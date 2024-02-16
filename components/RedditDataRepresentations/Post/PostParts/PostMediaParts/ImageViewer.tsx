import React, { useState, useContext } from 'react';
import { Text, StyleSheet, Image, View, TouchableHighlight } from 'react-native';
import { default as ImageView }from 'react-native-image-viewing';
import { ThemeContext, t } from '../../../../../contexts/ThemeContext';
import URL from '../../../../../utils/URL';


export default function ImageViewer({ images, thumbnail }: { images: string[], thumbnail?: string }) {
  const [visible, setVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const { theme } = useContext(ThemeContext);

  const isGif = new URL(images[0]).getRelativePath().endsWith('.gif');

  return (
    <View style={styles.imageViewerContainer}>
      <ImageView
        images={images.map((image) => ({ uri: image }))}
        imageIndex={imageIndex}
        presentationStyle='fullScreen'
        visible={visible}
        onRequestClose={() => setVisible(false)}
      />
      {images.slice(0, 2).map((image, index) => (
        <TouchableHighlight
          key={index}
          onPress={() => {
            setImageIndex(index);
            setVisible(true);
          }}
          style={styles.touchableZone}
        >
          <Image
            style={styles.img}
            resizeMode='cover'
            source={{ uri: isGif ? thumbnail : image }}
            alt={'image failed to load'}
          />
        </TouchableHighlight>
      ))}
      {images.length >= 2 && (
        <View style={t(styles.imageCountContainer, {
          backgroundColor: theme.background,
        })}>
          <Text style={t(styles.imageCountText, {
            color: theme.text,
          })}>{images.length} IMAGES</Text>
        </View>
      )}
      {isGif && (
        <View style={t(styles.isGifContainer, {
          backgroundColor: theme.background,
        })}>
          <Text style={t(styles.isGifText, {
            color: theme.text,
          })}>VIDEO</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageViewerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  touchableZone: {
    flex: 1,
  },
  img: {
    flex: 1,
  },
  imageCountContainer: {
    position: 'absolute',
    borderRadius: 5,
    overflow: 'hidden',
    margin: 5,
    right: 0,
    bottom: 0,
    opacity: 0.6,
  },
  imageCountText: {
    padding: 5,
  },
  isGifContainer: {
    position: 'absolute',
    borderRadius: 5,
    overflow: 'hidden',
    margin: 5,
    left: 0,
    bottom: 0,
    opacity: 0.6,
  },
  isGifText: {
    padding: 5,
  },
});
