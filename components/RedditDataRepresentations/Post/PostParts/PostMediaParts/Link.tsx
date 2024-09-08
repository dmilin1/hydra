import * as WebBrowser from "expo-web-browser";
import React, { useContext, useEffect, useState } from "react";
import { Text, StyleSheet, TouchableOpacity, Image } from "react-native";

import { DataModeContext } from "../../../../../contexts/SettingsContexts/DataModeContext";
import {
  ThemeContext,
  t,
} from "../../../../../contexts/SettingsContexts/ThemeContext";
import URL, { OpenGraphData } from "../../../../../utils/URL";

export default function Link({ link }: { link: string }) {
  const { theme } = useContext(ThemeContext);
  const [openGraphData, setOpenGraphData] = useState<OpenGraphData>();

  const { currentDataMode } = useContext(DataModeContext);

  const fetchOpenGraphData = async () => {
    const data = await new URL(link).getOpenGraphData();
    setOpenGraphData(data);
  };

  useEffect(() => {
    fetchOpenGraphData();
  }, []);

  return (
    <TouchableOpacity
      style={t(styles.externalLinkContainer, {
        borderColor: theme.tint,
      })}
      activeOpacity={openGraphData?.image ? 0.8 : 0.5}
      onPress={() => {
        if (link) {
          WebBrowser.openBrowserAsync(link);
        }
      }}
    >
      {openGraphData?.image &&
      openGraphData?.title &&
      openGraphData?.description ? (
        <>
          {currentDataMode === "normal" && (
            <Image
              source={{ uri: openGraphData.image }}
              resizeMode="cover"
              style={{ height: 200, borderRadius: 10 }}
            />
          )}
          <Text
            numberOfLines={1}
            style={t(styles.title, {
              color: theme.text,
            })}
          >
            {openGraphData.title}
          </Text>
          <Text
            style={t(styles.descriptionText, {
              color: theme.subtleText,
            })}
          >
            {openGraphData.description}
          </Text>
          <Text
            numberOfLines={1}
            style={t(styles.linkText, {
              color: theme.subtleText,
            })}
          >
            {link}
          </Text>
        </>
      ) : (
        <Text
          numberOfLines={1}
          style={t(styles.linkOnlyText, {
            color: theme.text,
          })}
        >
          {link}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  externalLinkContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 3,
  },
  title: {
    padding: 10,
  },
  descriptionText: {
    fontSize: 13,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  linkText: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
  },
  linkOnlyText: {
    padding: 10,
  },
});
