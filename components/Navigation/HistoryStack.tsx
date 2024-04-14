import React, { Fragment, useContext, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { HistoryContext, HistoryLayer, HistoryProviderProps } from '../../contexts/HistoryContext';
import { HistoryProvider } from '../../contexts/HistoryContext/HistoryProvider';
import { t } from '../../contexts/SettingsContexts/ThemeContext';
import Navbar from './Navbar';


function History() {
  const history = useContext(HistoryContext);
  const touchX = useRef(new Animated.Value(0)).current;
  const touchStart = useRef<{ x: number, y: number}>();
  const physics = useRef({ momentum: 0, lastX: 0, lastTime: 0 });
  const gestureDirection = useRef('forward');
  const [selected, setSelected] = React.useState<HistoryLayer|null>(null);

  return (
    <View
      style={styles.historyContainer}
      onStartShouldSetResponderCapture={(e) => {
        if (e.nativeEvent.identifier as unknown !== 1) return false;
        const screenWidth = Dimensions.get('window').width
        const boundarySize = 5;
        touchStart.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY};
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
      onMoveShouldSetResponderCapture={e => {
        if (e.nativeEvent.identifier as unknown !== 1) return false;
        if (!touchStart.current) return false;
        const boundarySize = 40;
        const screenWidth = Dimensions.get('window').width;
        if (
          e.nativeEvent.pageX - touchStart.current.x > 15
          && touchStart.current.x < boundarySize
          && history.past.length > 1
        ) {
          setSelected(history.past.slice(-1)[0]);
          gestureDirection.current = 'backward';
          return true;
        }
        if (
          touchStart.current.x - e.nativeEvent.pageX > 15
          && touchStart.current.x > screenWidth - boundarySize
          && history.future.length > 0
        ) {
          setSelected(history.future.slice(-1)[0]);
          gestureDirection.current = 'forward';
          return true;
        }
        return false;
      }}
      onResponderReject={() => {
        setSelected(null);
      }}
      onResponderMove={(e) => {
        if (e.nativeEvent.identifier as unknown !== 1) return false;
        const timeDelta = e.timeStamp - physics.current.lastTime;
        physics.current = {
          momentum: (e.nativeEvent.pageX - physics.current.lastX) / timeDelta,
          lastX: e.nativeEvent.pageX,
          lastTime: e.timeStamp,
        }
        physics.current.lastX = e.nativeEvent.pageX;
        touchX.setValue(e.nativeEvent.pageX);
      }}
      onResponderEnd={(e) => {
        if (e.nativeEvent.identifier as unknown !== 1) return false;
        if (!selected) return;
        let swipeDirection = 'forward';
        if (Math.abs(physics.current.momentum) > 0.2) {
          swipeDirection = physics.current.momentum > 0 ? 'forward' : 'backward';
        } else {
          swipeDirection = physics.current.lastX > Dimensions.get('window').width / 2 ? 'forward' : 'backward';
        }
        Animated.spring(touchX, {
          toValue: swipeDirection === 'forward' ? Dimensions.get('window').width : 0,
          useNativeDriver: true,
          overshootClamping: true,
          tension: 100,
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
        let left = new Animated.Value(i < history.past.length ? 0 : Dimensions.get('window').width);
        if (layer === selected) {
          left = touchX;
        }
        return (
          <Fragment key={i}>
            <Animated.View
              style={t(styles.historyLayerContainer, {
                zIndex: 2*i + 2,
                transform: [{
                  translateX: left as any, // expects a number, but Animated.Value definitely works
                }],
              })}
            >
              {layer.elem}
            </Animated.View>
            {layer === selected &&
              /**
               * Adds an invisible screen between layers to prevent touch events
               * from passing through to the layer below. Makes it feel less buggy.
               */
              <View
                style={t(styles.historyLayerContainer, {
                  zIndex: 2*i + 1,
                })}
              />
            }
          </Fragment>
        )
      })}
    </View>
  )
}

export default function HistoryStack(params: HistoryProviderProps) {
  return (
    <HistoryProvider
      initialFuture={params.initialFuture}
      initialPast={params.initialPast}
    >
      <>
        <Navbar/>
        <History/>
      </>
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