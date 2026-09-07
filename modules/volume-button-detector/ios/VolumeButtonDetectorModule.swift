import AVFoundation
import ExpoModulesCore

public class VolumeButtonDetectorModule: Module {
  private let queue = DispatchQueue(label: "hydra.volume-button-detector")
  private var armed = false
  private var ownsMute = false
  private var observers: [NSObjectProtocol] = []
  private var volumeObservation: NSKeyValueObservation?

  public func definition() -> ModuleDefinition {
    Name("VolumeButtonDetector")
    Events("onVolumeButtonPressed")

    OnStartObserving { self.queue.async { self.arm() } }
    OnStopObserving { self.queue.async { self.disarm() } }
    // Backgrounding can deactivate the session, which silences both observers.
    OnAppBecomesActive { self.queue.async { if self.armed { self.activateSession() } } }
    OnDestroy { self.queue.async { self.disarm() } }
  }

  private func arm() {
    armed = true
    activateSession()
    let session = AVAudioSession.sharedInstance()
    if #available(iOS 26.0, *) {
      // Never claim a mute somebody else established; we only release our own.
      if !ownsMute && !session.isOutputMuted {
        ownsMute = (try? session.setOutputMuted(true)) != nil
      }
      observers.append(NotificationCenter.default.addObserver(
        forName: AVAudioSession.userIntentToUnmuteOutputNotification, object: nil, queue: .main
      ) { [weak self] _ in self?.sendEvent("onVolumeButtonPressed") })
    } else {
      // No button API before iOS 26; a press at the volume limit is invisible.
      volumeObservation = session.observe(\.outputVolume, options: [.old, .new]) { [weak self] _, change in
        guard change.oldValue != change.newValue else { return }
        DispatchQueue.main.async { self?.sendEvent("onVolumeButtonPressed") }
      }
    }
  }

  private func disarm() {
    armed = false
    observers.forEach(NotificationCenter.default.removeObserver)
    observers.removeAll()
    volumeObservation = nil
    guard #available(iOS 26.0, *), ownsMute else { return }
    do {
      try AVAudioSession.sharedInstance().setOutputMuted(false)
      ownsMute = false
    } catch {
      // Keep ownership so the next disarm retries rather than leaving the app silent.
      NSLog("[VolumeButtonDetector] Could not release output mute: %@", error.localizedDescription)
    }
  }

  // Volume buttons only address media volume, and the observers only fire, while
  // the app's session is active. expo-video activates it for unmuted playback
  // only and sets the category asynchronously, so make it mixable here first:
  // activating the launch default category would stop other apps' audio.
  private func activateSession() {
    let session = AVAudioSession.sharedInstance()
    do {
      if session.category != .playback || !session.categoryOptions.contains(.mixWithOthers) {
        try session.setCategory(.playback, mode: .moviePlayback, options: [.mixWithOthers])
      }
      try session.setActive(true)
    } catch {
      NSLog("[VolumeButtonDetector] Could not activate audio session: %@", error.localizedDescription)
    }
  }
}
