import { create } from 'zustand';

interface UserLocationState {
    longitude: number;
    latitude: number;
    setLocation: (longitude: number, latitude: number) => void;
}

export const useUserLocationStore = create<UserLocationState>((set) => ({
    longitude: 0,
    latitude: 0,
    setLocation: (longitude, latitude) => set({ longitude, latitude }),
}));