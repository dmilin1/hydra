// `@expo/metro-runtime` MUST be the first import to ensure Fast Refresh works
// on web.
import "@expo/metro-runtime";

import { NavigationContainer } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import React, { useEffect } from 'react';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { ThemeProvider } from '../contexts/ThemeContext';
import Tabs from './tabs';

import {LogBox, View} from 'react-native';

import { renderRootComponent } from "expo-router/src/renderRootComponent";
import { AccountProvider } from "../contexts/AccountContext";
import { ModalProvider } from "../contexts/ModalContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { InboxProvider } from "../contexts/InboxContext";


LogBox.ignoreLogs([
	'Require cycle: ',
	'Constants.manifest has been deprecated in favor of Constants.expoConfig.',
	`Constants.platform.ios.model has been deprecated in favor of expo-device's Device.modelName property. This API will be removed in SDK 45.`,
]);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded, error] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
		...FontAwesome.font,
	});

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded])

	return (
		<SafeAreaProvider>
			<NavigationContainer>
				<ThemeProvider>
					<AccountProvider>
						<ActionSheetProvider>
							<InboxProvider>
								<ModalProvider>
									<>
										{loaded && <Tabs />}
									</>
								</ModalProvider>
							</InboxProvider>
						</ActionSheetProvider>
					</AccountProvider>
				</ThemeProvider>
			</NavigationContainer>
		</SafeAreaProvider>
	);
}

renderRootComponent(RootLayout);