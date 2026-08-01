import Feather from "@react-native-vector-icons/feather";
import React, { useContext, useState } from "react";
import { Platform, StyleSheet, Switch, Text, View } from "react-native";
import { Touchable } from "react-native-gesture-handler";
import { useMMKVBoolean, useMMKVString } from "react-native-mmkv";

import List from "../../../components/UI/List";
import SectionTitle from "../../../components/UI/SectionTitle";
import TextInput from "../../../components/UI/TextInput";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import {
  LINK_SCRIPT_ENABLED_KEY,
  LINK_SCRIPT_KEY,
  LinkScriptResult,
  compileLinkScript,
  runLinkScript,
} from "../../../utils/linkScript";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

const EXAMPLE_URL = "https://x.com/SpaceX/status/2081894924291654060";

const MONOSPACE_FONT = Platform.OS === "ios" ? "Courier New" : "monospace";

const SCRIPT_PLACEHOLDER = ` // DO NOT PASTE SCRIPTS FROM THE INTERNET THAT YOU DON'T FULLY UNDERSTAND

// url holds the link being opened.
// Change it, or return a different value.

if (url.startsWith("https://x.com/")) {
  url = url.replace("x.com", "xcancel.com");
}`;

/**
 * Snippets assign to `url` rather than returning it so they can be stacked in
 * any order, and wrap their declarations in a block so adding the same one
 * twice doesn't collide.
 */
const SNIPPETS = [
  {
    label: "Open X links with xcancel",
    code: `// Open X links with xcancel
{
  const xHosts = ["x.com", "www.x.com", "mobile.x.com", "twitter.com", "www.twitter.com"];
  const host = (url.split("/")[2] ?? "").split("?")[0].split("#")[0];
  if (xHosts.includes(host)) {
    url = "https://xcancel.com/" + url.split("/").slice(3).join("/");
  }
}`,
  },
  {
    label: "Remove tracking parameters",
    code: `// Remove tracking parameters
{
  const trackingKeys = ["si", "fbclid", "gclid", "igshid", "ref_src", "ref_url"];
  const queryStart = url.indexOf("?");
  if (queryStart !== -1) {
    const beforeQuery = url.slice(0, queryStart);
    const afterQuery = url.slice(queryStart + 1);
    const hashStart = afterQuery.indexOf("#");
    const query = hashStart === -1 ? afterQuery : afterQuery.slice(0, hashStart);
    const hash = hashStart === -1 ? "" : afterQuery.slice(hashStart);
    const params = new URLSearchParams(query);
    for (const key of Array.from(params.keys())) {
      if (trackingKeys.includes(key) || key.startsWith("utm_")) {
        params.delete(key);
      }
    }
    const cleanedQuery = params.toString();
    url = beforeQuery + (cleanedQuery ? "?" + cleanedQuery : "") + hash;
  }
}`,
  },
  {
    label: "Always use HTTPS",
    code: `// Always use HTTPS
if (url.startsWith("http://")) {
  url = "https://" + url.slice("http://".length);
}`,
  },
];

export default function ModifyLinks() {
  const { theme } = useContext(ThemeContext);

  const [storedScript, setScript] = useMMKVString(LINK_SCRIPT_KEY);
  const script = storedScript ?? "";

  const [storedEnabled, setEnabled] = useMMKVBoolean(LINK_SCRIPT_ENABLED_KEY);
  const enabled = storedEnabled ?? false;

  const [testURL, setTestURL] = useState("");
  const [result, setResult] = useState<LinkScriptResult | null>(null);

  const testedURL = testURL || EXAMPLE_URL;

  /**
   * Compiling only checks syntax, so it can run on every keystroke. Running
   * the script is saved for the test button below, since a script that never
   * finishes would freeze the app.
   */
  const compileError = compileLinkScript().error;

  return (
    <>
      <Text style={[styles.description, { color: theme.text }]}>
        Write JavaScript to modify how Hydra opens web links. Mutate the url
        variable, or return a new value, and Hydra opens that instead. Links
        that open inside Hydra, like Reddit posts and subreddits, are left
        alone.
      </Text>
      <List
        containerStyle={styles.toggle}
        items={[
          {
            key: "enabled",
            icon: (
              <MaterialDesignIcons
                name="language-javascript"
                size={26}
                color={theme.text}
              />
            ),
            text: "Enable Script",
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={enabled}
                onValueChange={() => setEnabled(!enabled)}
              />
            ),
            onPress: () => setEnabled(!enabled),
          },
        ]}
      />
      <SectionTitle text="Script" />
      <TextInput
        style={[
          styles.code,
          styles.editor,
          {
            backgroundColor: theme.tint,
            borderColor: compileError ? theme.delete : theme.divider,
            color: theme.text,
          },
        ]}
        value={script}
        placeholder={SCRIPT_PLACEHOLDER}
        placeholderTextColor={theme.verySubtleText}
        multiline
        textAlignVertical="top"
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        keyboardType={Platform.OS === "ios" ? "ascii-capable" : "default"}
        onChangeText={(newScript) => {
          setScript(newScript);
          setResult(null);
        }}
      />
      {compileError && (
        <Text style={[styles.message, { color: theme.delete }]}>
          {compileError}
        </Text>
      )}
      <List
        title="Add an Example"
        items={SNIPPETS.map((snippet) => ({
          key: snippet.label,
          icon: <Feather name="link" size={22} color={theme.text} />,
          text: snippet.label,
          rightIcon: (
            <Feather name="plus" size={22} color={theme.iconPrimary} />
          ),
          onPress: () => {
            setScript(script ? `${script}\n\n${snippet.code}` : snippet.code);
            setResult(null);
          },
        }))}
      />
      <View style={[styles.divider, { borderColor: theme.divider }]} />
      <SectionTitle text="Test Your Script" />
      <TextInput
        style={[
          styles.code,
          {
            backgroundColor: theme.tint,
            borderColor: theme.divider,
            color: theme.text,
          },
        ]}
        value={testURL}
        placeholder={EXAMPLE_URL}
        placeholderTextColor={theme.verySubtleText}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        onChangeText={(newTestURL) => {
          setTestURL(newTestURL);
          setResult(null);
        }}
      />
      <Touchable
        onPress={() => setResult(runLinkScript(testedURL))}
        activeOpacity={0.5}
        animationDuration={{ in: 0, out: 150 }}
        style={[styles.runButton, { backgroundColor: theme.buttonBg }]}
      >
        <View style={styles.runButtonContent}>
          <Feather name="play" size={16} color={theme.buttonText} />
          <Text style={{ color: theme.buttonText, fontSize: 15 }}>
            Run Script On This Link
          </Text>
        </View>
      </Touchable>
      {result &&
        (result.error ? (
          <Text style={[styles.message, { color: theme.delete }]}>
            {result.error}
          </Text>
        ) : result.url === testedURL ? (
          <Text style={[styles.message, { color: theme.subtleText }]}>
            Your script left this link unchanged
          </Text>
        ) : (
          <Text style={[styles.result, { color: theme.text }]}>
            {result.url}
          </Text>
        ))}
      <View style={[styles.divider, { borderColor: theme.divider }]} />
      <Text style={[styles.description, { color: theme.text }]}>
        If your script has an error, or returns something that isn&apos;t a
        link, Hydra opens the original link instead. Be careful with loops
        though. A script that never finishes will freeze the app until it is
        restarted, so turn off the switch above if a script starts causing
        trouble.
      </Text>
      <View style={{ marginBottom: 50 }} />
    </>
  );
}

const styles = StyleSheet.create({
  description: {
    marginTop: 10,
    marginHorizontal: 15,
    lineHeight: 20,
  },
  toggle: {
    marginTop: 15,
  },
  divider: {
    marginTop: 25,
    marginBottom: 10,
    marginHorizontal: 15,
    borderBottomWidth: 1,
  },
  code: {
    marginHorizontal: 15,
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    fontFamily: MONOSPACE_FONT,
    fontSize: 14,
  },
  editor: {
    minHeight: 220,
  },
  message: {
    marginTop: 10,
    marginHorizontal: 15,
    fontSize: 13,
    lineHeight: 18,
  },
  result: {
    marginTop: 15,
    marginHorizontal: 15,
    fontFamily: MONOSPACE_FONT,
    fontSize: 14,
    lineHeight: 20,
  },
  runButton: {
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  runButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
});
