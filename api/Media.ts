import { ImagePickerAsset } from "expo-image-picker";

import { api } from "./RedditApi";
import { USER_AGENT } from "./UserAgent";

export async function uploadImage(
  imageAsset: ImagePickerAsset,
): Promise<string | null> {
  const response = await api(
    "https://www.reddit.com/api/image_upload_s3.json",
    {
      method: "POST",
    },
    {
      requireAuth: true,
      body: {
        filepath: imageAsset.fileName,
        mimetype: imageAsset.mimeType,
        raw_json: "1",
      },
    },
  );
  const s3UploadData = response.fields.reduce(
    (acc: Record<string, string>, field: { name: string; value: string }) => {
      acc[field.name] = field.value;
      return acc;
    },
    {},
  );
  const file = {
    uri: imageAsset.uri,
    type: imageAsset.mimeType,
    name: imageAsset.fileName,
  };
  const body = new FormData();
  Object.entries(s3UploadData).forEach(([key, value]) => {
    body.append(key, value as string);
  });
  body.append("file", file as unknown as string /* idk, but it works */);
  const s3UploadResponse = await fetch(`https:${response.action}`, {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data; ",
      "User-Agent": USER_AGENT,
    },
    body,
  });
  const text = await s3UploadResponse.text();
  const uploadURL = text.match(/<Location>(.*?)<\/Location>/)?.[1];
  return uploadURL ?? null;
}
