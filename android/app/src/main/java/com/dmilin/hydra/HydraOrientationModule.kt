package com.dmilin.hydra

import android.content.pm.ActivityInfo
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class HydraOrientationModule(
  private val hydraReactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(hydraReactContext) {

  override fun getName(): String = "HydraOrientation"

  @ReactMethod
  fun allowFullscreenRotation() {
    hydraReactContext.currentActivity?.requestedOrientation =
      ActivityInfo.SCREEN_ORIENTATION_FULL_USER
  }

  @ReactMethod
  fun lockPortrait() {
    hydraReactContext.currentActivity?.requestedOrientation =
      ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
  }
}
