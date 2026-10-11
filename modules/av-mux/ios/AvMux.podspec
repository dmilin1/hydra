Pod::Spec.new do |s|
  s.name           = 'AvMux'
  s.version        = '1.0.0'
  s.summary        = 'Audio/video muxing for Hydra'
  s.description    = 'Local Expo module that remuxes separate audio and video files into one mp4 via AVFoundation passthrough export.'
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
