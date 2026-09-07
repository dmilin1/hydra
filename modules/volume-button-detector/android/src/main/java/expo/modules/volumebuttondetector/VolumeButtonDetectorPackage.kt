package expo.modules.volumebuttondetector

import android.content.Context
import android.view.KeyEvent
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityHandler

class VolumeButtonDetectorPackage : Package {
  override fun createReactActivityHandlers(activityContext: Context): List<ReactActivityHandler> =
    listOf(object : ReactActivityHandler {
      // Key-up only: a React Native Modal owns a Dialog window and forwards just
      // key-up to the Activity, and a single hook avoids double counting.
      // Returning false leaves the system volume adjustment and HUD untouched.
      override fun onKeyUp(keyCode: Int, event: KeyEvent?): Boolean {
        if (event?.isCanceled == false &&
          (keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN)) {
          VolumeKeyListener.onPressed?.invoke()
        }
        return false
      }
    })
}
