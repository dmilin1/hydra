import { ImagePickerAsset } from "expo-image-picker";

import { defineOperation, gql } from "./GqlApi";
import { USER_AGENT } from "../UserAgent";
import safeFetch from "../../utils/safeFetch";

/**
 * Image uploads work like in Reddit's app: BatchCreateMediaUploadLease returns
 * a signed S3 form upload, the image is POSTed straight to S3, and S3's
 * Location is what CreateSubredditPost takes as the image URL.
 */

const BatchCreateMediaUploadLease = defineOperation(
  "BatchCreateMediaUploadLease",
  "f71516bedb1e72c437061c8e405259c86039f6347eb5d4e520586653416ca0c5",
);

// Reddit's MimeType values for images.
const MIME_TYPES: Record<string, string> = {
  "image/jpeg": "JPEG",
  "image/jpg": "JPEG",
  "image/png": "PNG",
  "image/gif": "GIF",
  "image/webp": "WEBP",
};

export async function uploadImage(
  imageAsset: ImagePickerAsset,
): Promise<string> {
  const mimeType = MIME_TYPES[imageAsset.mimeType?.toLowerCase() ?? ""];
  if (!mimeType) {
    throw new Error(`Unsupported image type: ${imageAsset.mimeType}`);
  }
  const data = await gql(BatchCreateMediaUploadLease, {
    input: {
      fileInputs: [
        {
          mimeType,
          ...(imageAsset.fileSize
            ? { totalFileSize: imageAsset.fileSize }
            : {}),
          // Reddit's app asks for ADAPTIVE, which can return a multipart lease
          // for large files. BASIC always returns the single-request upload.
          uploadStrategy: "BASIC",
        },
      ],
    },
  });
  const result = data.batchCreateMediaUploadLease;
  const lease = result?.leases?.[0]?.lease;
  if (!result?.ok || !lease?.uploadUrl) {
    throw new Error(result?.errors?.[0]?.message ?? "Failed to upload image");
  }

  const body = new FormData();
  for (const { name, value } of lease.uploadHeaders ?? []) {
    body.append(name, value);
  }
  body.append(
    "file",
    {
      uri: imageAsset.uri,
      type: imageAsset.mimeType,
      name: imageAsset.fileName ?? "image",
    } as unknown as string /* React Native's FormData file */,
  );
  // Not fetch(): Expo replaces it with an implementation that can't send React
  // Native's { uri } file parts. XMLHttpRequest (safeFetch) streams them natively.
  const s3UploadResponse = await safeFetch(lease.uploadUrl, {
    method: "POST",
    headers: { "User-Agent": USER_AGENT },
    body,
    timeout: 120_000,
  });
  const text = await s3UploadResponse.text();
  const uploadURL = text.match(/<Location>(.*?)<\/Location>/)?.[1];
  if (!uploadURL) {
    // S3 explains rejections in an XML <Error> body.
    const reason =
      text.match(/<Message>(.*?)<\/Message>/)?.[1] ?? text.slice(0, 200);
    throw new Error(
      `Image upload failed (HTTP ${s3UploadResponse.status}): ${reason}`,
    );
  }
  return uploadURL;
}
