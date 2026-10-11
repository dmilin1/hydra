import { File, Paths } from "expo-file-system";
import { parseDocument } from "htmlparser2";

import { mux } from "../modules/av-mux";
import URL from "./URL";
import safeFetch from "./safeFetch";
import { Alert } from "react-native";

export type DownloadRequest = {
  url: string;
  isPro: boolean;
  onProgress?: (progress: number) => void;
};

export type DownloadResult = {
  file: File;
  cleanup: () => void;
};

export class UserCancelledVideoMuxError extends Error {
  name: "UserCancelledVideoMuxError";
  constructor() {
    super("UserCancelledVideoMuxError");
    this.name = "UserCancelledVideoMuxError";
  }
}

/**
 * Rough share of the total work each stage of an HLS download represents.
 * Audio is a small fraction of the bytes and the mux is a local remux rather
 * than a re-encode, so the video download dominates.
 */
const VIDEO_WEIGHT = 0.8;
const AUDIO_WEIGHT = 0.1;
const MUX_WEIGHT = 0.1;

export async function download(
  downloadRequest: DownloadRequest,
): Promise<DownloadResult> {
  if (downloadRequest.url.includes(".m3u8")) {
    return hlsDownload(downloadRequest);
  } else {
    return standardDownload(downloadRequest);
  }
}

async function downloadToFile(
  url: string,
  file: File,
  onProgress?: (progress: number) => void,
) {
  if (file.exists) {
    file.delete();
  }
  await File.downloadFileAsync(url, file, {
    /**
     * totalBytes is unknown when the server omits Content-Length, and
     * rounding keeps a large download from re-rendering callers on every
     * chunk since React bails out on an unchanged value.
     */
    onProgress: ({ bytesWritten, totalBytes }) =>
      onProgress?.(
        totalBytes > 0
          ? Math.round((bytesWritten / totalBytes) * 100) / 100
          : 0,
      ),
  });
}

async function standardDownload({
  url,
  onProgress,
}: DownloadRequest): Promise<DownloadResult> {
  const fileName = new URL(url).getBasePath().split("/").pop();
  const file = new File(`${Paths.cache.uri}/${fileName}`);
  await downloadToFile(url, file, onProgress);
  return { file, cleanup: () => file.delete() };
}

async function hlsDownload(
  downloadRequest: DownloadRequest,
): Promise<DownloadResult> {
  const { url, onProgress, isPro } = downloadRequest;
  const basePath = new URL(url).getBasePath();
  const baseDir = basePath.slice(0, basePath.lastIndexOf("/") + 1);
  const videoId = baseDir.split("/").filter(Boolean).pop();

  const manifestRes = await safeFetch(`${baseDir}DASHPlaylist.mpd`);
  if (!manifestRes.ok) {
    throw new Error(`Failed to load DASH manifest for ${url}`);
  }
  const { videoUrl, audioUrl } = parseDashManifest(
    await manifestRes.text(),
    baseDir,
  );
  if (!videoUrl) {
    throw new Error(`No video track found in DASH manifest for ${url}`);
  }
  if (!isPro && !!audioUrl) {
    const userSaysDownloadWithoutAudio = await new Promise((resolve) =>
      Alert.alert(
        "Hydra Pro Feature",
        "Downloading videos with audio is a Hydra Pro feature. Would you like to download the video without audio?",
        [
          {
            text: "Download Anyway",
            onPress: () => resolve(true),
          },
          {
            text: "Get Hydra Pro",
            style: "default",
            isPreferred: true,
            onPress: () => resolve(false),
          },
        ],
      ),
    );
    if (!userSaysDownloadWithoutAudio) {
      throw new UserCancelledVideoMuxError();
    }
  }
  if (!audioUrl || !isPro) {
    // Silent video, so there is nothing to mux.
    return standardDownload({
      ...downloadRequest,
      url: videoUrl,
    });
  }

  let videoProgress = 0;
  let audioProgress = 0;
  let muxProgress = 0;
  const reportProgress = () =>
    onProgress?.(
      Math.round(
        (videoProgress * VIDEO_WEIGHT +
          audioProgress * AUDIO_WEIGHT +
          muxProgress * MUX_WEIGHT) *
          100,
      ) / 100,
    );

  /**
   * The track files get explicit .mp4 names because AVFoundation infers the
   * container format from the extension and old posts serve audio from an
   * extensionless "audio" path. The shared file keeps the clean {videoId}.mp4
   * name since it's visible in the share sheet.
   */
  const videoFile = new File(`${Paths.cache.uri}/${videoId}-video.mp4`);
  const audioFile = new File(`${Paths.cache.uri}/${videoId}-audio.mp4`);
  const outputFile = new File(`${Paths.cache.uri}/${videoId}.mp4`);

  try {
    await Promise.all([
      downloadToFile(videoUrl, videoFile, (progress) => {
        videoProgress = progress;
        reportProgress();
      }),
      downloadToFile(audioUrl, audioFile, (progress) => {
        audioProgress = progress;
        reportProgress();
      }),
    ]);
    if (outputFile.exists) {
      outputFile.delete();
    }
    await mux({
      videoUri: videoFile.uri,
      audioUri: audioFile.uri,
      outputUri: outputFile.uri,
      onProgress: (progress) => {
        muxProgress = progress;
        reportProgress();
      },
    });
  } finally {
    if (videoFile.exists) {
      videoFile.delete();
    }
    if (audioFile.exists) {
      audioFile.delete();
    }
  }

  return { file: outputFile, cleanup: () => outputFile.delete() };
}

function parseDashManifest(
  xml: string,
  baseDir: string,
): { videoUrl?: string; audioUrl?: string } {
  type Track = {
    url: string;
    isAudio: boolean;
    height: number;
    bandwidth: number;
  };
  const tracks: Track[] = [];

  const visit = (node: any, parentContentType?: string) => {
    if (!node.name) return;
    const contentType =
      (node.attribs?.mimeType ?? node.attribs?.contentType)?.split("/")[0] ??
      parentContentType;
    if (node.name === "Representation") {
      const baseURL = node.children
        ?.find((child: any) => child.name === "BaseURL")
        ?.children?.[0]?.data?.trim();
      if (baseURL) {
        tracks.push({
          url: baseURL.startsWith("https://") ? baseURL : baseDir + baseURL,
          /**
           * Old manifests don't put a content type on anything, but across
           * every era the audio file's name has contained "audio"
           * (DASH_AUDIO_128.mp4, DASH_audio.mp4, or just audio).
           */
          isAudio: contentType === "audio" || /audio/i.test(baseURL),
          height: Number(node.attribs?.height) || 0,
          bandwidth: Number(node.attribs?.bandwidth) || 0,
        });
      }
      return;
    }
    node.children?.forEach((child: any) => visit(child, contentType));
  };
  parseDocument(xml, { xmlMode: true }).children.forEach((child: any) =>
    visit(child),
  );

  const byQuality = (a: Track, b: Track) =>
    b.height - a.height || b.bandwidth - a.bandwidth;
  return {
    videoUrl: tracks.filter((track) => !track.isAudio).sort(byQuality)[0]?.url,
    audioUrl: tracks.filter((track) => track.isAudio).sort(byQuality)[0]?.url,
  };
}
