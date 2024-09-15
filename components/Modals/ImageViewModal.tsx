import React, { useRef } from "react";
import {
  Image,
  StyleSheet,
  Modal,
  View,
  Animated,
  PanResponder,
  NativeTouchEvent,
} from "react-native";

type ImageViewModalProps = {
  images: string[];
  visible: boolean;
};

function ImageView({ image }: { image: string }) {
  const pan = useRef(new Animated.ValueXY()).current;

  const scale = useRef(1);
  const scaleAsAnimatedValue = useRef(new Animated.Value(scale.current)).current;
  const pinchStartingScale = useRef(scale.current);
  const pinchStartingDist = useRef(0);

  const calcDist = (touches: NativeTouchEvent[]) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderStart: (e, gestureState) => {
      if (e.nativeEvent.touches.length === 2) {
        pinchStartingDist.current = calcDist(e.nativeEvent.touches);
      }
    },
    onPanResponderMove: (e, gestureState) => {
      if (Number(e.nativeEvent.identifier) === 1) {
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      }
      if (e.nativeEvent.touches.length === 2) {
        const distance = calcDist(e.nativeEvent.touches);
        scale.current = pinchStartingScale.current + pinchStartingScale.current * (distance / pinchStartingDist.current - 1);
        scaleAsAnimatedValue.setValue(scale.current);
      }
    },
    onPanResponderRelease: (e, gestureState) => {
      if (e.nativeEvent.touches.length < 2) {
        pinchStartingScale.current = scale.current;
      }
      pan.extractOffset();
      // Animated.spring(
      //   pan, // Auto-multiplexed
      //   { toValue: { x: 0, y: 0 }, useNativeDriver: true }, // Back to zero
      // ).start();
    },
  });

  return (
    <View
      {...panResponder.panHandlers}
      style={{
        flex: 1,
        backgroundColor: 'pink',
      }}
    >
      <Animated.View
        style={{
          flex: 1,
          transform: [
            ...pan.getTranslateTransform(),
            { scale: scaleAsAnimatedValue },
          ],
        }}
      >
        <Image
          source={{ uri: image }}
          resizeMode="contain"
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

export default function ImageViewModal({
  images,
  visible,
}: ImageViewModalProps) {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.imageContainer} >
        <ImageView image={images[0]} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  modal: {
    flexDirection: "row",
  },
});
