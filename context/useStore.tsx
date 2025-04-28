import CovenInterface from "@/app/interfaces/covenInterface";
import GatheringInterface from "@/app/interfaces/gatheringInterface";
import UserInterface from "@/app/interfaces/userInterface";
import { supabase } from "@/lib/supabase";
import { create } from "zustand";

const useGlobalStore = create((set) => ({
  selectedGathering: null,
  selectedCoven: null,
  selectedUser: null,
  skipCovenCheck: false,
  authUserId: null,

  setSelectedGathering: (gathering: GatheringInterface) =>
    set({ selectedGathering: gathering }),
  setSelectedCoven: (coven: CovenInterface) =>
    set({
      selectedCoven: coven,
      skipCovenCheck: true,
    }),
  setSelectedUser: (user: UserInterface) => set({ selectedUser: user }),
  setSkipCovenCheck: (skip: boolean) => set({ skipCovenCheck: skip }),
  setAuthUserId: (userId: string | null) => set({ authUserId: userId }),

  fetchAuthUserId: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ authUserId: session.user.id });
        return session.user.id;
      } else {
        set({ authUserId: null });
        return null;
      }
    } catch (error) {
      console.error("Error fetching authenticated user:", error);
      set({ authUserId: null });
      return null;
    }
  },

  resetSelections: () =>
    set({
      selectedGathering: null,
      selectedCoven: null,
      selectedUser: null,
      skipCovenCheck: false,
    }),

    resetAuthId: () => set({authUserId: null})
}));

interface CovenUIStore {
  maxCovenItemHeight: number;
  updateMaxHeight: (height: number) => void;
}

export const useCovenUIStore = create<CovenUIStore>((set) => ({
  maxCovenItemHeight: 80,
  updateMaxHeight: (height) =>
    set((state) => ({
      maxCovenItemHeight: Math.max(state.maxCovenItemHeight, height),
    })),
}));

export default useGlobalStore;