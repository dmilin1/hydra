import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'favoriteSubreddits';

type FavoritesContextType = {
    favorites: string[];
    refreshFavorites: () => Promise<void>;
    toggleFavorite: (subredditName: string) => Promise<boolean>;
};

export const FavoritesContext = createContext<FavoritesContextType>({
    favorites: [],
    refreshFavorites: async () => {},
    toggleFavorite: async () => false,
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>([]);

    const getFavorites = async (): Promise<string[]> => {
        const favs = await AsyncStorage.getItem(STORAGE_KEY);
        return favs ? JSON.parse(favs) : [];
    };

    const refreshFavorites = async () => {
        const favs = await getFavorites();
        setFavorites(favs);
    };

    const toggleFavorite = async (subredditName: string): Promise<boolean> => {
        const currentFavorites = await getFavorites();
        const isFavorite = currentFavorites.includes(subredditName);

        let newFavorites: string[];
        if (isFavorite) {
            newFavorites = currentFavorites.filter(name => name !== subredditName);
        } else {
            newFavorites = [...currentFavorites, subredditName];
        }

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
        setFavorites(newFavorites);
        return !isFavorite;
    };

    useEffect(() => {
        refreshFavorites();
    }, []);

    return (
        <FavoritesContext.Provider value={{ favorites, refreshFavorites, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}