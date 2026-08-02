package expo.modules.avmux

import android.media.MediaCodec
import android.media.MediaExtractor
import android.media.MediaFormat
import android.media.MediaMuxer
import android.net.Uri
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.nio.ByteBuffer

/**
 * Fallback for tracks that don't declare KEY_MAX_INPUT_SIZE. 4 MiB is
 * comfortably above any single compressed video frame at the resolutions
 * Reddit serves.
 */
private const val DEFAULT_BUFFER_SIZE = 4 * 1024 * 1024

internal class InvalidUriException(uri: String) :
  CodedException("\"$uri\" is not a valid file:// URI")

internal class MissingTrackException(message: String) :
  CodedException(message)

class AvMuxModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AvMux")

    Events("onMuxProgress")

    // Runs on the module's background queue, so it's fine that the copy
    // loop blocks until the mux finishes.
    AsyncFunction("mux") { videoUri: String, audioUri: String, outputUri: String ->
      mux(videoUri, audioUri, outputUri)
    }
  }

  private fun filePath(uri: String): String {
    val parsed = Uri.parse(uri)
    val path = parsed.path
    if (parsed.scheme != "file" || path == null) {
      throw InvalidUriException(uri)
    }
    return path
  }

  /**
   * Combines the video track of one file and the audio track of another into
   * a single mp4 by copying compressed samples straight across — no decode or
   * re-encode, so it runs in roughly file-copy time.
   */
  private fun mux(videoUri: String, audioUri: String, outputUri: String) {
    val outputFile = File(filePath(outputUri))
    val videoExtractor = MediaExtractor()
    val audioExtractor = MediaExtractor()
    var muxer: MediaMuxer? = null

    try {
      videoExtractor.setDataSource(filePath(videoUri))
      audioExtractor.setDataSource(filePath(audioUri))

      val videoFormat =
        selectTrack(videoExtractor, "video/")
          ?: throw MissingTrackException("No video track found in $videoUri")
      val audioFormat =
        selectTrack(audioExtractor, "audio/")
          ?: throw MissingTrackException("No audio track found in $audioUri")

      // MediaMuxer refuses to replace an existing file.
      outputFile.delete()
      val mediaMuxer =
        MediaMuxer(outputFile.absolutePath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
      muxer = mediaMuxer

      val videoTrack = mediaMuxer.addTrack(videoFormat)
      val audioTrack = mediaMuxer.addTrack(audioFormat)
      // Rotation lives on the container rather than the frames, so videos
      // recorded rotated (portrait phone footage) need the hint carried over.
      if (videoFormat.containsKey(MediaFormat.KEY_ROTATION)) {
        mediaMuxer.setOrientationHint(videoFormat.getInteger(MediaFormat.KEY_ROTATION))
      }
      mediaMuxer.start()

      val videoDurationUs = durationUs(videoFormat)
      // Audio past the last video frame would play over a frozen final frame,
      // so it gets trimmed to the video's length.
      val audioDurationUs = minOf(durationUs(audioFormat), videoDurationUs)
      val totalUs = videoDurationUs + audioDurationUs

      var lastSentProgress = 0.0
      val sendProgress = { copiedUs: Long ->
        if (totalUs > 0) {
          /**
           * Capped below 1 because the JS side reserves 1 for "the output
           * file is fully written", which is only true after stop() returns.
           * Sending every sample would flood the bridge, so only meaningful
           * increases go through.
           */
          val progress = minOf(copiedUs.toDouble() / totalUs, 0.99)
          if (progress - lastSentProgress >= 0.01) {
            lastSentProgress = progress
            sendEvent(
              "onMuxProgress",
              mapOf("outputUri" to outputUri, "progress" to progress),
            )
          }
        }
      }

      copySamples(videoExtractor, mediaMuxer, videoTrack, videoFormat, Long.MAX_VALUE) {
        sendProgress(it)
      }
      copySamples(audioExtractor, mediaMuxer, audioTrack, audioFormat, videoDurationUs) {
        sendProgress(videoDurationUs + it)
      }

      mediaMuxer.stop()
    } catch (e: Throwable) {
      outputFile.delete()
      throw e
    } finally {
      videoExtractor.release()
      audioExtractor.release()
      muxer?.release()
    }
  }

  /** Selects the first track whose mime type matches and returns its format. */
  private fun selectTrack(extractor: MediaExtractor, mimePrefix: String): MediaFormat? {
    for (i in 0 until extractor.trackCount) {
      val format = extractor.getTrackFormat(i)
      if (format.getString(MediaFormat.KEY_MIME)?.startsWith(mimePrefix) == true) {
        extractor.selectTrack(i)
        return format
      }
    }
    return null
  }

  private fun durationUs(format: MediaFormat): Long =
    if (format.containsKey(MediaFormat.KEY_DURATION)) {
      format.getLong(MediaFormat.KEY_DURATION)
    } else {
      0L
    }

  /**
   * Copies compressed samples from the extractor's selected track into the
   * muxer until the track ends or a sample lands past endUs. Reports each
   * copied sample's presentation time to onSampleCopied.
   */
  private fun copySamples(
    extractor: MediaExtractor,
    muxer: MediaMuxer,
    trackIndex: Int,
    format: MediaFormat,
    endUs: Long,
    onSampleCopied: (presentationTimeUs: Long) -> Unit,
  ) {
    val bufferSize =
      if (format.containsKey(MediaFormat.KEY_MAX_INPUT_SIZE)) {
        maxOf(format.getInteger(MediaFormat.KEY_MAX_INPUT_SIZE), DEFAULT_BUFFER_SIZE)
      } else {
        DEFAULT_BUFFER_SIZE
      }
    val buffer = ByteBuffer.allocateDirect(bufferSize)
    val info = MediaCodec.BufferInfo()

    while (true) {
      val size = extractor.readSampleData(buffer, 0)
      if (size < 0) break
      val timeUs = extractor.sampleTime
      if (timeUs > endUs) break
      val flags =
        if (extractor.sampleFlags and MediaExtractor.SAMPLE_FLAG_SYNC != 0) {
          MediaCodec.BUFFER_FLAG_KEY_FRAME
        } else {
          0
        }
      info.set(0, size, timeUs, flags)
      muxer.writeSampleData(trackIndex, buffer, info)
      onSampleCopied(timeUs)
      extractor.advance()
    }
  }
}
