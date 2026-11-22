import {
  EventMapCore,
  NavigationRoute,
  StackNavigationState,
  EventListenerCallback,
  useNavigation,
} from "@react-navigation/native";
import {
  NativeStackHeaderItem,
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
import { useVerticalBarEdgeIOS } from "expo-status-bar";
import { Animated, Dimensions } from "react-native";

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
  setVerticalBarItems: (_items: NativeStackHeaderItem[] | null) => {},
});

export function StackFutureProvider({
  children,
  futureRoutes,
}: StackFutureProviderProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<StackParamsList>>();

  const windowWidth = useRef(Dimensions.get("window").width);
  const gestureStart = useRef<{ x: number; y: number } | null>(null);

  const handleBeforeRemove: HandleBeforeRemoveType = (e) => {
    // A reset replaces the stack, so its removed routes aren't somewhere to go forward to
    if (e.data.action.type === "RESET") {
      futureRoutes.current = [];
      return;
    }
    const popped = navigation.getState().routes.slice(-1)[0];
    futureRoutes.current.push(popped);
  };

  useEffect(() => {
    navigation.addListener("beforeRemove", handleBeforeRemove);
    return () => {
      navigation.removeListener("beforeRemove", handleBeforeRemove);
    };
  }, [navigation]);

  const goForward = () => {
    const popped = futureRoutes.current.pop();
    if (!popped) return false;
    navigation.push(popped.name as any, popped.params as any);
    return true;
  };

  /**
   * The iPhone Duo's vertical bar covers the screen edge the forward swipe
   * starts from, but it does host native header items next to the back button.
   */
  const verticalBarEdge = useVerticalBarEdgeIOS();
  // Items a page puts in the vertical bar (e.g. split view's) replace the forward button
  const pageItems = useRef<NativeStackHeaderItem[] | null>(null);
  const updateHeaderLeftItems = () => {
    const showForward = !!verticalBarEdge && futureRoutes.current.length > 0;
    const items =
      pageItems.current ??
      (showForward
        ? [
            {
              type: "button" as const,
              label: "Forward",
              icon: { type: "sfSymbol" as const, name: "chevron.forward" },
              onPress: goForward,
            },
          ]
        : null);
    navigation.setOptions({
      headerBackVisible: items ? true : undefined,
      unstable_headerLeftItems: items ? () => items : undefined,
    });
  };
  useEffect(() => {
    updateHeaderLeftItems();
    return navigation.addListener("focus", updateHeaderLeftItems);
  }, [navigation, verticalBarEdge]);

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      "change",
      // We shouldn't have to type this as any. For some reason, the React Native library removed the types for this event
      (event: any) => (windowWidth.current = event.window.width),
    );
    return () => subscription.remove();
  }, []);

  return (
    <StackFutureContext.Provider
      value={{
        clearFuture: () => (futureRoutes.current = []),
        setVerticalBarItems: (items) => {
          pageItems.current = items;
          updateHeaderLeftItems();
        },
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
          windowWidth.current - gestureStart.current.x < 30 &&
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
            if (!goForward()) return false;
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
