export type MuxOptions = {
  videoUri: string;
  audioUri: string;
  outputUri: string;
  onProgress?: (progress: number) => void;
};

export function mux(_options: MuxOptions): Promise<void> {
  return Promise.reject(new Error("Muxing is not supported on web"));
}
