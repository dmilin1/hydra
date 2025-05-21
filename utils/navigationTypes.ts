import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { StackParamsList } from "../app/stack";
import { TabParamsList } from "../app/tabs";

// Define the composite navigation type for the application
export type AppNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamsList>,
  NativeStackNavigationProp<StackParamsList>
>;

// Define a union type that accepts either a Stack navigation or the composite
export type FlexibleNavigationProp =
  | NativeStackNavigationProp<StackParamsList>
  | AppNavigationProp;
