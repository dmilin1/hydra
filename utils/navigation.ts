import { RouteProp, useNavigation as useNavigationUntyped, useRoute as useRouteUntyped } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackParamsList } from "../app/stack";

export function useNavigation() {
    return useNavigationUntyped<NativeStackNavigationProp<StackParamsList>>();
}

export function useRoute<Pages extends keyof StackParamsList = keyof StackParamsList>() {
    return useRouteUntyped<RouteProp<StackParamsList, Pages>>();
}