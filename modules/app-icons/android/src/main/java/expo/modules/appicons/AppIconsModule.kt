package expo.modules.appicons

import android.content.ComponentName
import android.content.pm.ActivityInfo
import android.content.pm.PackageManager
import android.os.Build
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * The real launcher activity. It owns every non-launcher intent filter the app
 * has — the hydra:// scheme, share targets — so it must stay enabled forever.
 * Disabling a component disables its intent filters too, which is why icon
 * switching goes through aliases only and never touches this class.
 */
private const val MAIN_ACTIVITY = "MainActivity"

/**
 * Alias representing the stock icon. Enabled in the manifest, so it is the
 * launcher entry on a fresh install. Kept in sync with DEFAULT_ALIAS_SUFFIX in
 * plugins/withAppIcons.js.
 */
private const val DEFAULT_ALIAS = "MainActivityDefault"

internal class UnknownAppIconException(alias: String) :
  CodedException("No activity alias named \"$alias\" exists in this app")

class AppIconsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AppIcons")

    Constants(
      "supportsAlternateIcons" to true
    )

    Function("getAppIconAlias") { getAppIconAlias() }

    AsyncFunction("setAppIconAlias") { alias: String? -> setAppIconAlias(alias) }
  }

  private val packageManager: PackageManager
    get() = requireNotNull(appContext.reactContext).packageManager

  private val packageName: String
    get() = requireNotNull(appContext.reactContext).packageName

  /**
   * Reads the active icon from the aliases' enabled state rather than from the
   * launching activity: the app may have been opened through a deep link or a
   * share intent, which resolve to MainActivity itself and say nothing about
   * which icon the user picked.
   */
  private fun getAppIconAlias(): String? {
    val activeAlias = aliasActivities().firstOrNull(::isEnabled) ?: return null
    val simpleName = simpleName(activeAlias.name)

    if (simpleName == DEFAULT_ALIAS) return null

    return simpleName.removePrefix(MAIN_ACTIVITY)
  }

  private fun setAppIconAlias(alias: String?): String? {
    val targetName = if (alias == null) DEFAULT_ALIAS else "$MAIN_ACTIVITY$alias"
    val aliases = aliasActivities()

    if (aliases.none { simpleName(it.name) == targetName }) {
      throw UnknownAppIconException(targetName)
    }

    // Enable the target before disabling the others so the package never has
    // zero launcher entries, even briefly.
    aliases
      .filter { simpleName(it.name) == targetName }
      .forEach { setEnabled(it, enabled = true) }
    aliases
      .filter { simpleName(it.name) != targetName }
      .forEach { setEnabled(it, enabled = false) }

    return alias
  }

  /** Every MainActivity* alias, excluding the base MainActivity itself. */
  private fun aliasActivities(): List<ActivityInfo> {
    val flags = PackageManager.GET_ACTIVITIES or PackageManager.MATCH_DISABLED_COMPONENTS
    val packageInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      packageManager.getPackageInfo(
        packageName,
        PackageManager.PackageInfoFlags.of(flags.toLong())
      )
    } else {
      @Suppress("DEPRECATION")
      packageManager.getPackageInfo(packageName, flags)
    }

    return packageInfo.activities
      ?.filter {
        val simpleName = simpleName(it.name)
        simpleName != MAIN_ACTIVITY && simpleName.startsWith(MAIN_ACTIVITY)
      }
      ?: emptyList()
  }

  private fun isEnabled(activity: ActivityInfo): Boolean =
    when (packageManager.getComponentEnabledSetting(component(activity))) {
      PackageManager.COMPONENT_ENABLED_STATE_ENABLED -> true
      PackageManager.COMPONENT_ENABLED_STATE_DISABLED -> false
      // COMPONENT_ENABLED_STATE_DEFAULT — nothing has overridden the manifest
      // yet, so android:enabled decides. True for the default alias only.
      else -> activity.enabled
    }

  private fun setEnabled(activity: ActivityInfo, enabled: Boolean) {
    packageManager.setComponentEnabledSetting(
      component(activity),
      if (enabled) {
        PackageManager.COMPONENT_ENABLED_STATE_ENABLED
      } else {
        PackageManager.COMPONENT_ENABLED_STATE_DISABLED
      },
      PackageManager.DONT_KILL_APP
    )
  }

  private fun component(activity: ActivityInfo) = ComponentName(packageName, activity.name)

  private fun simpleName(className: String) = className.substringAfterLast('.')
}
