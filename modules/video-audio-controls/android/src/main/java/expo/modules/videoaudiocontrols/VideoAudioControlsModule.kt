package expo.modules.videoaudiocontrols

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// The Activity handler observes delivered foreground keys without consuming
// them. Native volume adjustment and the system HUD retain their normal path.
internal object VolumeKeyIntent {
  @Volatile var owner: String? = null
  @Volatile var notify: (() -> Unit)? = null
}

class VideoAudioControlsModule : Module() {
  private var owner: String? = null

  override fun definition() = ModuleDefinition {
    Name("VideoAudioControls")
    Events("onUnmuteIntent")

    Function("start") { nextOwner: String ->
      owner = nextOwner
      VolumeKeyIntent.owner = nextOwner
      VolumeKeyIntent.notify = { sendEvent("onUnmuteIntent", mapOf("owner" to nextOwner)) }
    }
    Function("stop") { previousOwner: String ->
      if (owner == previousOwner) stop()
    }
    OnActivityEntersBackground { stop() }
    OnDestroy { stop() }
  }

  private fun stop() {
    if (VolumeKeyIntent.owner == owner) {
      VolumeKeyIntent.notify = null
      VolumeKeyIntent.owner = null
    }
    owner = null
  }
}
