Pod::Spec.new do |s|
  s.name           = 'VolumeButtonDetector'
  s.version        = '1.0.0'
  s.summary        = 'Hardware volume button press detection for Hydra'
  s.description    = 'Local Expo module reporting volume button presses without changing system volume.'
  s.author         = ''
  s.homepage       = 'https://github.com/dmilin1/hydra'
  s.platform       = :ios, '15.1'
  s.swift_version  = '5.4'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
