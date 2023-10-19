import React, { useContext, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { HistoryContext, HistoryLayer, HistoryProvider, HistoryProviderProps } from '../contexts/HistoryContext';
import { t } from '../contexts/ThemeContext';
import Navbar from './Navbar';
import { WebviewersContext, WebviewersProvider } from '../contexts/WebViewContext';


function History() {
  const history = useContext(HistoryContext);
  const { webviewers } = useContext(WebviewersContext);
  const touchX = useRef(new Animated.Value(0)).current;
  const physics = useRef({ momentum: 0, lastX: 0, lastTime: 0 });
  const gestureDirection = useRef('forward');
  const [selected, setSelected] = React.useState<HistoryLayer|null>(null);

  return (
    <View
      style={styles.historyContainer}
      onStartShouldSetResponderCapture={(e) => {
        const screenWidth = Dimensions.get('window').width
        const boundarySize = 20;
        touchX.setValue(e.nativeEvent.pageX);
        if (e.nativeEvent.pageX < boundarySize && history.past.length > 1) {
          setSelected(history.past.slice(-1)[0]);
          gestureDirection.current = 'backward';
          return true;
        }
        if (e.nativeEvent.pageX > screenWidth - boundarySize && history.future.length > 0) {
          setSelected(history.future.slice(-1)[0]);
          gestureDirection.current = 'forward';
          return true;
        }
        return false;
      }}
      onResponderMove={(e) => {
        const timeDelta = e.timeStamp - physics.current.lastTime;
        physics.current = {
          momentum: (e.nativeEvent.pageX - physics.current.lastX) / timeDelta,
          lastX: e.nativeEvent.pageX,
          lastTime: e.timeStamp,
        }
        physics.current.lastX = e.nativeEvent.pageX;
        touchX.setValue(e.nativeEvent.pageX);
      }}
      onResponderEnd={() => {
        if (!selected) return;
        let swipeDirection = 'forward';
        if (Math.abs(physics.current.momentum) > 0.2) {
          swipeDirection = physics.current.momentum > 0 ? 'forward' : 'backward';
        } else {
          swipeDirection = physics.current.lastX > Dimensions.get('window').width / 2 ? 'forward' : 'backward';
        }
        Animated.timing(touchX, {
          toValue: swipeDirection === 'forward' ? Dimensions.get('window').width : 0,
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          setSelected(null);
          if (gestureDirection.current === swipeDirection) return;
          if (swipeDirection === 'forward') {
            history.backward();
          } else {
            history.forward();
          }
        });
      }}
    >
      {[...history.past, ...(history.future.slice().reverse())].map((layer, i) => {
        let left : string|number|Animated.Value = i < history.past.length ? 0 : '100%';
        if (layer === selected) {
          left = touchX;
        }
        return (
          <Animated.View
            key={i}
            style={t(styles.historyLayerContainer, {
              left: left,
            })}
          >
            {layer.elem}
          </Animated.View>
        )
      })}
      <View style={{ height: 1000, width: 1000, zIndex: -1000 }}>
        {Object.values(webviewers).map((webviewer) => webviewer.elem)}
      </View>
    </View>
  )
}

export default function HistoryStack(params: HistoryProviderProps) {
  return (
    <HistoryProvider
      initialFuture={params.initialFuture}
      initialPast={params.initialPast}
    >
      <WebviewersProvider>
        <>
          <Navbar/>
          <History/>
        </>
      </WebviewersProvider>
    </HistoryProvider>
  )
}

const styles = StyleSheet.create({
  historyContainer: {
    flex: 1,
    backgroundColor: 'gray',
  },
  historyLayerContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  }
});