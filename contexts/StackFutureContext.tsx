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
import { Animated, Dimensions } from "react-native";

import { StackParamsList } from "../app/stack";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  const gestureStartX = useRef(0);

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
          gestureStartX.current = e.nativeEvent.pageX;
          return false;
        }}
        onMoveShouldSetResponder={() =>
          SCREEN_WIDTH - gestureStartX.current < 30 &&
          futureRoutes.current.length > 0
        }
        onResponderMove={(e) => {
          if (gestureStartX.current - e.nativeEvent.pageX > 15) {
            const popped = futureRoutes.current.pop();
            if (!popped) return false;
            navigation.push(popped.name as any, popped.params as any);
            gestureStartX.current = 0;
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
