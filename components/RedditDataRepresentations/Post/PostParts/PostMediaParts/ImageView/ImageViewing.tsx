import React, {
  useEffect,
  useContext,
} from "react";
import {
  StyleSheet,
  View,
  ModalProps,
  Modal,
} from "react-native";

import StatusBarManager from "./components/StatusBarManager";
import useRequestClose from "./hooks/useRequestClose";
import { PostInteractionContext } from "../../../../../../contexts/PostInteractionContext";
import ImageSlider, { ImageSliderProps } from "./ImageSlider";

type ImageViewingProps = ImageSliderProps & {
  visible: boolean;
  presentationStyle?: ModalProps["presentationStyle"];
  animationType?: ModalProps["animationType"];
};

export default function ImageViewing(props: ImageViewingProps) {
  const {
    visible,
    presentationStyle,
    animationType,
    onRequestClose,
  } = props;

  const { interactedWithPost } = useContext(PostInteractionContext);

  const [_opacity, onRequestCloseEnhanced] = useRequestClose(onRequestClose);

  useEffect(() => {
    if (visible) interactedWithPost();
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <View
      onMoveShouldSetResponder={() => true}
      onStartShouldSetResponder={() => true}
      onResponderTerminationRequest={() => {
        /* Prevents views underneath the modal from taking over */
        return false;
      }}
    >
      <Modal
        transparent={presentationStyle === "overFullScreen"}
        visible={visible}
        presentationStyle={presentationStyle}
        animationType={animationType}
        onRequestClose={onRequestCloseEnhanced}
        supportedOrientations={["portrait"]}
        hardwareAccelerated
      >
        <StatusBarManager presentationStyle={presentationStyle} />
        <ImageSlider
          images={props.images}
          keyExtractor={props.keyExtractor}
          initialImageIndex={props.initialImageIndex}
          onRequestClose={onRequestClose}
          onLongPress={props.onLongPress}
          onImageIndexChange={props.onImageIndexChange}
          swipeToCloseEnabled={props.swipeToCloseEnabled}
          doubleTapToZoomEnabled={props.doubleTapToZoomEnabled}
          delayLongPress={props.delayLongPress}
          HeaderComponent={props.HeaderComponent}
          FooterComponent={props.FooterComponent}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0)",
  },
  header: {
    position: "absolute",
    width: "100%",
    zIndex: 1,
    top: 0,
  },
  footer: {
    position: "absolute",
    width: "100%",
    zIndex: 1,
    bottom: 0,
  },
  imageCounterPill: {
    position: "absolute",
    right: 16,
    bottom: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  counterText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
