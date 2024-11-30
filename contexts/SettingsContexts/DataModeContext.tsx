import NetInfo, {
  NetInfoState,
  NetInfoStateType,
} from "@react-native-community/netinfo";
import { createContext, useEffect, useState } from "react";
import { useMMKVObject } from "react-native-mmkv";

export type DataMode = "normal" | "lowData";

type DataModeContextType = {
  currentDataMode: DataMode;
  dataModeSettings: {
    wifi: DataMode;
    cellular: DataMode;
  };
  changeDataModeSetting: (
    setting: keyof DataModeContextType["dataModeSettings"],
    value: DataMode,
  ) => void;
};

const initialDataModeContext: DataModeContextType = {
  currentDataMode: "lowData",
  dataModeSettings: {
    wifi: "normal",
    cellular: "normal",
  },
  changeDataModeSetting: () => {},
};

export const DataModeContext = createContext(initialDataModeContext);

export function DataModeProvider({ children }: React.PropsWithChildren) {
  const [connectionType, setConnectionType] = useState<NetInfoState["type"]>(
    NetInfoStateType.wifi,
  );

  const [storedDataModeSettings, setDataModeSettings] =
    useMMKVObject<DataModeContextType["dataModeSettings"]>("dataMode");

  const dataModeSettings =
    storedDataModeSettings ?? initialDataModeContext.dataModeSettings;

  const currentDataMode =
    dataModeSettings[
      connectionType === NetInfoStateType.wifi ? "wifi" : "cellular"
    ];

  const changeDataModeSetting: DataModeContextType["changeDataModeSetting"] = (
    setting,
    value,
  ) => {
    const newSettings = {
      ...dataModeSettings,
      [setting]: value,
    };
    setDataModeSettings(newSettings);
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setConnectionType(state.type);
    });
    return () => unsubscribe();
  }, []);

  return (
    <DataModeContext.Provider
      value={{
        currentDataMode,
        dataModeSettings,
        changeDataModeSetting,
      }}
    >
      {children}
    </DataModeContext.Provider>
  );
}
