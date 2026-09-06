Pod::Spec.new do |s|
  s.name = 'VideoAudioControls'
  s.version = '1.0.0'
  s.summary = 'Foreground video unmute intent for Hydra'
  s.description = 'Observes supported audio-session unmute intent without changing system volume.'
  s.author = ''
  s.homepage = 'https://github.com/dmilin1/hydra'
  s.platform = :ios, '15.1'
  s.swift_version = '5.4'
  s.source = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.source_files = '**/*.swift'
end
