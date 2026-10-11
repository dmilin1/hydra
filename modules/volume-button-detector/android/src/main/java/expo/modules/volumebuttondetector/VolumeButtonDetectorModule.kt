package expo.modules.volumebuttondetector

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Shared with the Activity handler, which the Activity creates before any
// module instance exists.
internal object VolumeKeyListener {
  @Volatile var onPressed: (() -> Unit)? = null
}

class VolumeButtonDetectorModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("VolumeButtonDetector")
    Events("onVolumeButtonPressed")

    OnStartObserving { VolumeKeyListener.onPressed = { sendEvent("onVolumeButtonPressed") } }
    OnStopObserving { VolumeKeyListener.onPressed = null }
    OnDestroy { VolumeKeyListener.onPressed = null }
  }
}
