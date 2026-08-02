import AVFoundation
import ExpoModulesCore

internal final class InvalidUriException: GenericException<String> {
  override var reason: String {
    "\"\(param)\" is not a valid file:// URI"
  }
}

internal final class MissingTrackException: GenericException<String> {
  override var reason: String {
    param
  }
}

internal final class MuxException: GenericException<String> {
  override var reason: String {
    param
  }
}

public class AvMuxModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AvMux")

    Events("onMuxProgress")

    AsyncFunction("mux") { (videoUri: String, audioUri: String, outputUri: String) async throws in
      try await self.mux(videoUri: videoUri, audioUri: audioUri, outputUri: outputUri)
    }
  }

  private func fileURL(_ uri: String) throws -> URL {
    guard let url = URL(string: uri), url.isFileURL else {
      throw InvalidUriException(uri)
    }
    return url
  }

  private func mux(videoUri: String, audioUri: String, outputUri: String) async throws {
    let videoAsset = AVURLAsset(url: try fileURL(videoUri))
    let audioAsset = AVURLAsset(url: try fileURL(audioUri))
    let outputURL = try fileURL(outputUri)

    guard let videoTrack = try await videoAsset.loadTracks(withMediaType: .video).first else {
      throw MissingTrackException("No video track found in \(videoUri)")
    }
    guard let audioTrack = try await audioAsset.loadTracks(withMediaType: .audio).first else {
      throw MissingTrackException("No audio track found in \(audioUri)")
    }
    let videoDuration = try await videoAsset.load(.duration)
    let audioDuration = try await audioAsset.load(.duration)

    let composition = AVMutableComposition()
    guard
      let compositionVideo = composition.addMutableTrack(
        withMediaType: .video,
        preferredTrackID: kCMPersistentTrackID_Invalid
      ),
      let compositionAudio = composition.addMutableTrack(
        withMediaType: .audio,
        preferredTrackID: kCMPersistentTrackID_Invalid
      )
    else {
      throw MuxException("Could not create composition tracks")
    }

    try compositionVideo.insertTimeRange(
      CMTimeRange(start: .zero, duration: videoDuration),
      of: videoTrack,
      at: .zero
    )
    // Without this, videos recorded rotated (portrait phone footage) come out
    // sideways, since the rotation lives on the track rather than the frames.
    compositionVideo.preferredTransform = try await videoTrack.load(.preferredTransform)

    // Audio past the last video frame would play over a frozen final frame,
    // so it gets trimmed to the video's length.
    try compositionAudio.insertTimeRange(
      CMTimeRange(start: .zero, duration: CMTimeMinimum(audioDuration, videoDuration)),
      of: audioTrack,
      at: .zero
    )

    // Passthrough copies samples into the new container without re-encoding.
    guard
      let session = AVAssetExportSession(
        asset: composition,
        presetName: AVAssetExportPresetPassthrough
      )
    else {
      throw MuxException("Could not create export session")
    }

    try? FileManager.default.removeItem(at: outputURL)
    session.outputURL = outputURL
    session.outputFileType = .mp4
    session.shouldOptimizeForNetworkUse = true

    let progressTask = Task {
      while !Task.isCancelled {
        self.sendEvent("onMuxProgress", [
          "outputUri": outputUri,
          /**
           * The session can report 1.0 before the container is finalized, and
           * the JS side reserves 1 for "the output file is fully written".
           */
          "progress": min(session.progress, 0.99),
        ])
        try? await Task.sleep(nanoseconds: 100_000_000)
      }
    }
    defer { progressTask.cancel() }

    await session.export()

    if session.status != .completed {
      throw MuxException(
        session.error?.localizedDescription
          ?? "Export failed with status \(session.status.rawValue)"
      )
    }
  }
}
