import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesStore {
  favoriteIds: string[];
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      toggleFavorite: (propertyId: string) => {
        const { favoriteIds } = get();
        const exists = favoriteIds.includes(propertyId);

        if (exists) {
          set({ favoriteIds: favoriteIds.filter((id) => id !== propertyId) });
        } else {
          set({ favoriteIds: [...favoriteIds, propertyId] });
        }
      },

      isFavorite: (propertyId: string) => {
        return get().favoriteIds.includes(propertyId);
      },
    }),
    {
      name: "awtarprop_favorites_storage",
    },
  ),
);

export const useIsFavorite = (propertyId: string) =>
  useFavoritesStore((state) => state.favoriteIds.includes(propertyId));

export const useToggleFavorite = () =>
  useFavoritesStore((state) => state.toggleFavorite);
