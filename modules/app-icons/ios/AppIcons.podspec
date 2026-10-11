Pod::Spec.new do |s|
  s.name           = 'AppIcons'
  s.version        = '1.0.0'
  s.summary        = 'Alternate app icon switching for Hydra'
  s.description    = 'Local Expo module wrapping UIApplication alternate icon APIs.'
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
