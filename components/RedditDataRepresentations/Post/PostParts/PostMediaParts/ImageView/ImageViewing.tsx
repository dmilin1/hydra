import React, { useEffect, useContext } from "react";
import { View, ModalProps, Modal } from "react-native";

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
  const { visible, presentationStyle, animationType, onRequestClose } = props;

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
