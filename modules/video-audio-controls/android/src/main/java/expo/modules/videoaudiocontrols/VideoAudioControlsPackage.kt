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
    })
}
