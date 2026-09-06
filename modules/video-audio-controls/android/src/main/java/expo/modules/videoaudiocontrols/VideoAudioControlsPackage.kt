package expo.modules.videoaudiocontrols

import android.app.Activity
import android.content.Context
import android.view.KeyEvent
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityHandler

class VideoAudioControlsPackage : Package {
  override fun createReactActivityHandlers(activityContext: Context): List<ReactActivityHandler> =
    listOf(object : ReactActivityHandler {
      override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if ((activityContext as? Activity)?.hasWindowFocus() == true &&
          event?.repeatCount == 0 &&
          (keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN)) {
          VolumeKeyIntent.notify?.invoke()
        }
        return false
      }

      override fun onKeyUp(keyCode: Int, event: KeyEvent?): Boolean {
        // React Native Modal owns a Dialog window and forwards only key-up to
        // the Activity. The Activity itself has no window focus in that case.
        // The owner exists only while a foreground, focused viewer is muted.
        if (event != null && !event.isCanceled &&
          (keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN)) {
          VolumeKeyIntent.notify?.invoke()
        }
        return false
      }
    })
}
