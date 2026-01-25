import {
  EventMapCore,
  NavigationRoute,
  StackNavigationState,
  EventListenerCallback,
  useNavigation,
} from "@react-navigation/native";
import {
  NativeStackNavigationEventMap,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import {
  createContext,
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useRef,
} from "react";
import { Animated, useWindowDimensions } from "react-native";

import { StackParamsList } from "../app/stack";

type HandleBeforeRemoveType = EventListenerCallback<
  NativeStackNavigationEventMap &
    EventMapCore<StackNavigationState<StackParamsList>>,
  "beforeRemove",
  true
>;

type StackFutureProviderProps = PropsWithChildren<{
  futureRoutes: MutableRefObject<
    NavigationRoute<StackParamsList, keyof StackParamsList>[]
  >;
}>;

export const StackFutureContext = createContext({
  clearFuture: () => {},
});

export function StackFutureProvider({
  children,
  futureRoutes,
}: StackFutureProviderProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<StackParamsList>>();

  const { width } = useWindowDimensions();

  const gestureStart = useRef<{ x: number; y: number } | null>(null);

  const handleBeforeRemove: HandleBeforeRemoveType = () => {
    const popped = navigation.getState().routes.slice(-1)[0];
    futureRoutes.current.push(popped);
  };

  useEffect(() => {
    navigation.addListener("beforeRemove", handleBeforeRemove);
    return () => {
      navigation.removeListener("beforeRemove", handleBeforeRemove);
    };
  }, [navigation]);

  return (
    <StackFutureContext.Provider
      value={{
        clearFuture: () => (futureRoutes.current = []),
      }}
    >
      <Animated.View
        style={{
          width: "100%",
          height: "100%",
        }}
        onStartShouldSetResponderCapture={(e) => {
          gestureStart.current = {
            x: e.nativeEvent.pageX,
            y: e.nativeEvent.pageY,
          };
          return false;
        }}
        onMoveShouldSetResponder={() =>
          !!gestureStart.current &&
          width - gestureStart.current.x < 30 &&
          futureRoutes.current.length > 0
        }
        onResponderMove={(e) => {
          if (!gestureStart.current) return false;
          const deltaX = gestureStart.current.x - e.nativeEvent.pageX;
          const deltaY = e.nativeEvent.pageY - gestureStart.current.y;
          const angleDegrees = Math.abs(
            Math.atan2(deltaY, deltaX) * (180 / Math.PI),
          );
          if (angleDegrees > 15 && deltaY > 30) {
            gestureStart.current = null;
            return false;
          }
          if (deltaX > 15 && angleDegrees < 15) {
            const popped = futureRoutes.current.pop();
            if (!popped) return false;
            navigation.push(popped.name as any, popped.params as any);
            gestureStart.current = null;
            return true;
          }
          return false;
        }}
      >
        {children}
      </Animated.View>
    </StackFutureContext.Provider>
  );
}
