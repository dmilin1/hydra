import ExpoModulesCore
import UIKit

public class AppIconsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AppIcons")

    Constants([
      "supportsAlternateIcons": UIApplication.shared.supportsAlternateIcons
    ])

    // On iOS the alias is the asset-catalog name, which is the icon key itself.
    Function("getAppIconAlias") { () -> String? in
      UIApplication.shared.alternateIconName
    }

    AsyncFunction("setAppIconAlias") { (alias: String?, promise: Promise) in
      DispatchQueue.main.async {
        UIApplication.shared.setAlternateIconName(alias) { error in
          if let error {
            promise.reject(error)
          } else {
            promise.resolve(alias)
          }
        }
      }
    }
  }
}
