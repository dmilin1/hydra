import { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DataMode = 'normal' | 'lowData';

type DataModeContextType =  {
    currentDataMode: DataMode,
    dataModeSettings: {
        wifi: DataMode,
        cellular: DataMode,
    },
    changeDataModeSetting: (setting: keyof DataModeContextType['dataModeSettings'], value: DataMode) => void,
}

const initialDataModeContext: DataModeContextType = {
    currentDataMode: 'lowData',
    dataModeSettings: {
        wifi: 'normal',
        cellular: 'normal',
    },
    changeDataModeSetting: () => {},
};

export const DataModeContext = createContext(initialDataModeContext);

export function DataModeProvider({ children }: React.PropsWithChildren) {
    const [connectionType, setConnectionType] = useState<NetInfoState['type']>(NetInfoStateType.wifi);
    const [dataModeSettings, setDataModeSettings] = useState(initialDataModeContext.dataModeSettings);

    const currentDataMode = dataModeSettings[connectionType === NetInfoStateType.wifi ? 'wifi' : 'cellular'];

    const changeDataModeSetting: DataModeContextType['changeDataModeSetting'] = (setting, value) => {
        const newSettings = {
            ...dataModeSettings,
            [setting]: value,
        }
        setDataModeSettings(newSettings);
        AsyncStorage.setItem('dataMode', JSON.stringify(newSettings));
    };

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setConnectionType(state.type);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        AsyncStorage.getItem('dataMode').then(dataMode => {
            if (dataMode) {
                setDataModeSettings(JSON.parse(dataMode));
            }
        });
    }, []);

    return (
        <DataModeContext.Provider value={{
            currentDataMode,
            dataModeSettings,
            changeDataModeSetting,
        }}>
            {children}
        </DataModeContext.Provider>
    );
}
