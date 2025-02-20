// This replaces `const { getDefaultConfig } = require('expo/metro-config');`
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

// This replaces `const config = getDefaultConfig(__dirname);`
const config = getSentryExpoConfig(__dirname);

config.resolver.sourceExts.push('sql');

module.exports = config;