import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import React, { useEffect } from 'react';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { ThemeProvider } from '../contexts/ThemeContext';
import Tabs from './tabs';

import {LogBox} from 'react-native';


LogBox.ignoreLogs([
	'Require cycle: ',
	'Constants.manifest has been deprecated in favor of Constants.expoConfig.',
	`Constants.platform.ios.model has been deprecated in favor of expo-device's Device.modelName property. This API will be removed in SDK 45.`,
]);

export default function RootLayout() {
	const [loaded, error] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
		...FontAwesome.font,
	});

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (error) throw error;
	}, [error]);

	return (
		<ThemeProvider>
			<ActionSheetProvider>
				<>
					{/* Keep the splash screen open until the assets have loaded. In the future, we should just support async font loading with a native version of font-display. */}
					{!loaded && <SplashScreen />}
					{loaded && <Tabs />}
				</>
			</ActionSheetProvider>
		</ThemeProvider>
	);
}