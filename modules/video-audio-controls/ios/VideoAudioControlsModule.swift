import AVFoundation
import ExpoModulesCore
import UIKit

public class VideoAudioControlsModule: Module {
  private var owner: String?
  private var ownsMute = false
  private var observers: [NSObjectProtocol] = []

  public func definition() -> ModuleDefinition {
    Name("VideoAudioControls")
    Events("onUnmuteIntent")

    Function("start") { (owner: String) in
      self.onMain { self.start(owner) }
    }
    Function("stop") { (owner: String) in
      self.onMain {
        if self.owner == owner { self.stop() }
      }
    }
    OnDestroy {
      self.onMain { self.stop() }
    }
    OnAppBecomesActive {
      self.onMain {
        if self.owner == nil { self.stop() }
      }
    }
  }

  private func onMain(_ work: () -> Void) {
    if Thread.isMainThread { work() }
    else { DispatchQueue.main.sync(execute: work) }
  }

  private func start(_ nextOwner: String) {
    stop()
    guard #available(iOS 26.0, *), !ownsMute,
      UIApplication.shared.applicationState == .active else { return }
    let session = AVAudioSession.sharedInstance()
    // Never claim a mute established by another audio feature. Expo remains
    // responsible for session category, mode and activation. Inline players
    // are muted; the focused full-screen viewer is Hydra's only audible player.
    guard !session.isOutputMuted else { return }
    do {
      try session.setOutputMuted(true)
      ownsMute = session.isOutputMuted
      guard ownsMute else { return }
      owner = nextOwner
      let center = NotificationCenter.default
      observers.append(center.addObserver(
        forName: AVAudioSession.userIntentToUnmuteOutputNotification,
        object: nil, queue: .main
      ) { [weak self] _ in
        guard let self, self.owner == nextOwner,
          UIApplication.shared.applicationState == .active else { return }
        // Either volume direction may express intent, including at maximum.
        self.sendEvent("onUnmuteIntent", ["owner": nextOwner])
      })
      for name in [UIApplication.willResignActiveNotification,
                   AVAudioSession.interruptionNotification,
                   AVAudioSession.mediaServicesWereResetNotification] {
        observers.append(center.addObserver(forName: name, object: nil, queue: .main) { [weak self] _ in
          self?.stop()
        })
      }
    } catch {
      stop()
      NSLog("[VideoAudioControls] Could not acquire session mute: %@", error.localizedDescription)
    }
  }

  private func stop() {
    owner = nil
    observers.forEach(NotificationCenter.default.removeObserver)
    observers.removeAll()
    guard #available(iOS 26.0, *), ownsMute else { return }
    do {
      try AVAudioSession.sharedInstance().setOutputMuted(false)
      ownsMute = AVAudioSession.sharedInstance().isOutputMuted
    } catch {
      // Retain ownership so a subsequent start can retry release, not claim
      // the still-muted session as somebody else's state.
      NSLog("[VideoAudioControls] Could not release session mute: %@", error.localizedDescription)
    }
  }
}
