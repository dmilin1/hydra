import { Entypo, Feather } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { Directory, File, Paths } from "expo-file-system/next";
import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Switch,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import * as Clipboard from "expo-clipboard";

import List from "../../components/UI/List";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import {
  CUSTOM_HYDRA_SERVER_URL_KEY,
  DEFAULT_HYDRA_SERVER_URL,
  USE_CUSTOM_HYDRA_SERVER_KEY,
} from "../../constants/HydraServer";
import { useMMKVBoolean } from "react-native-mmkv";
import TextInput from "../../components/UI/TextInput";
import KeyStore from "../../utils/KeyStore";
import { hydraServerStatus } from "../../api/HydraServerStatus";
import { SubscriptionsContext } from "../../contexts/SubscriptionsContext";

const imageCacheDir = new Directory(
  `${Paths.cache.uri}/com.hackemist.SDImageCache/default`,
);

const calcDirectorySize = (dir: Directory) => {
  let size = 0;
  if (!dir.exists) return 0;
  dir.list().forEach((file) => {
    if (file instanceof File) {
      size += file?.size ?? 0;
    }
  });
  return (size / 1024 / 1024).toFixed(0);
};

export default function Advanced() {
  const { customerId } = useContext(SubscriptionsContext);
  const { theme } = useContext(ThemeContext);

  const isFocused = useIsFocused();

  const [imageCacheMb, setImageCacheMb] = useState(
    calcDirectorySize(imageCacheDir),
  );
  const [storedUseCustomHydraServer, setUseCustomHydraServer] = useMMKVBoolean(
    USE_CUSTOM_HYDRA_SERVER_KEY,
  );
  const useCustomHydraServer = storedUseCustomHydraServer ?? false;

  const [customServerUrl, setCustomServerUrl] = useState(
    KeyStore.getString(CUSTOM_HYDRA_SERVER_URL_KEY) ?? DEFAULT_HYDRA_SERVER_URL,
  );
  const [isCustomServerValid, setIsCustomServerValid] = useState<
    boolean | null
  >(null);

  const validateCustomServerUrl = async (url: string) => {
    setIsCustomServerValid(null);
    const isValid = await hydraServerStatus(url);
    setIsCustomServerValid(isValid);
    if (isValid) {
      KeyStore.set(CUSTOM_HYDRA_SERVER_URL_KEY, url);
    }
  };

  const clearCache = async () => {
    if (imageCacheDir.exists) {
      imageCacheDir.list().forEach((file) => {
        if (file instanceof File) {
          file.delete();
        }
      });
    }
    setImageCacheMb(calcDirectorySize(imageCacheDir));
    Alert.alert("Cache Cleared", "The image cache has been cleared.");
  };

  useEffect(() => {
    if (!isFocused) return;
    setImageCacheMb(calcDirectorySize(imageCacheDir));
  }, [isFocused]);

  useEffect(() => {
    if (customServerUrl) {
      validateCustomServerUrl(customServerUrl);
    }
  }, [customServerUrl, useCustomHydraServer]);

  return (
    <>
      <List
        title="Caching"
        items={[
          {
            key: "errorReporting",
            icon: <Entypo name="image" size={24} color={theme.text} />,
            rightIcon: <></>,
            text: `Clear Image Cache (${imageCacheMb} MB)`,
            onPress: () => clearCache(),
          },
        ]}
      />
      <List
        title="Self Hosted Hydra Server"
        items={[
          {
            key: "hydraServerUrl",
            icon: <Feather name="server" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={useCustomHydraServer}
                onValueChange={() =>
                  setUseCustomHydraServer(!useCustomHydraServer)
                }
              />
            ),
            text: `Use Custom Server`,
            onPress: () => setUseCustomHydraServer(!useCustomHydraServer),
          },
        ]}
      />
      {useCustomHydraServer && (
        <>
          <TextInput
            style={[
              styles.hydraServerUrlInput,
              {
                backgroundColor: theme.tint,
                borderColor: theme.divider,
                color: theme.text,
              },
            ]}
            placeholder="Hydra Server URL"
            value={customServerUrl}
            onChangeText={setCustomServerUrl}
          />
          <View style={styles.hydraServerUrlStatus}>
            {isCustomServerValid === null && (
              <Text
                style={[styles.hydraServerUrlStatusText, { color: theme.text }]}
              >
                Checking server status...
              </Text>
            )}
            {isCustomServerValid === false && (
              <Text
                style={[styles.hydraServerUrlStatusText, { color: theme.text }]}
              >
                Custom server URL is not valid or your server is not set up
                properly.
              </Text>
            )}
            {isCustomServerValid === true && (
              <Text
                style={[styles.hydraServerUrlStatusText, { color: theme.text }]}
              >
                Success! App must be restarted for changes to take effect.
              </Text>
            )}
          </View>
        </>
      )}
      {customerId && (
        <TouchableOpacity
          onPress={() => {
            Clipboard.setStringAsync(customerId);
            Alert.alert(
              "Customer ID Copied",
              "The customer ID has been copied to your clipboard.",
            );
          }}
        >
          <Text style={[styles.customerIdText, { color: theme.text }]}>
            Customer ID: {customerId}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  hydraServerUrlInput: {
    marginTop: 10,
    marginHorizontal: 10,
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
  },
  hydraServerUrlStatus: {
    marginHorizontal: 10,
    marginTop: 10,
    alignItems: "center",
  },
  hydraServerUrlStatusText: {
    fontSize: 14,
  },
  customerIdText: {
    fontSize: 14,
    marginTop: 30,
    marginHorizontal: 20,
    marginBottom: 20,
    textAlign: "center",
  },
});
