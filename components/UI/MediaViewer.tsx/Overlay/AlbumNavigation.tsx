import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import { StyleSheet, Text, View } from "react-native";
import { Touchable } from "react-native-gesture-handler";

import {
  OVERLAY_BACKGROUND_COLOR,
  OverlayIsland,
  useOverlayInteraction,
} from "./OverlayContext";

export default function AlbumNavigation({
  albumIndex,
  albumSize,
  onStep,
}: {
  albumIndex: number;
  albumSize: number;
  onStep: (direction: "left" | "right") => void;
}) {
  const { bumpAutoHide } = useOverlayInteraction();

  const step = (direction: "left" | "right") => {
    onStep(direction);
    bumpAutoHide();
  };

  return (
    <OverlayIsland style={styles.container}>
      <Touchable
        activeOpacity={0.2}
        animationDuration={{ in: 0, out: 150 }}
        style={[
          styles.navigationButton,
          {
            opacity: albumIndex === 0 ? 0.5 : 1,
          },
        ]}
        disabled={albumIndex === 0}
        onPress={() => step("left")}
        hitSlop={10}
      >
        <FontAwesome6
          iconStyle="solid"
          name="arrow-left"
          size={16}
          color="white"
        />
      </Touchable>
      <Touchable
        activeOpacity={0.2}
        animationDuration={{ in: 0, out: 150 }}
        style={[
          styles.navigationButton,
          {
            opacity: albumIndex === albumSize - 1 ? 0.5 : 1,
          },
        ]}
        disabled={albumIndex === albumSize - 1}
        onPress={() => step("right")}
        hitSlop={10}
      >
        <FontAwesome6
          iconStyle="solid"
          name="arrow-right"
          size={16}
          color="white"
        />
      </Touchable>
      <View style={styles.indexContainer}>
        <Text style={styles.indexText}>
          {albumIndex + 1} / {albumSize}
        </Text>
      </View>
    </OverlayIsland>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignSelf: "flex-end",
    gap: 10,
    marginHorizontal: 10,
  },
  navigationButton: {
    aspectRatio: 1,
    borderRadius: 100,
    width: 40,
    backgroundColor: OVERLAY_BACKGROUND_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },
  indexContainer: {
    borderRadius: 10,
    padding: 10,
    backgroundColor: OVERLAY_BACKGROUND_COLOR,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
  },
  indexText: {
    color: "white",
  },
});
