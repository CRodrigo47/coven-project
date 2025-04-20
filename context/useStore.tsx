import CovenInterface from '@/app/interfaces/covenInterface';
import GatheringInterface from '@/app/interfaces/gatheringInterface';
import UserInterface from '@/app/interfaces/userInterface';
import { create } from 'zustand'

const useGlobalStore = create((set) => ({
    selectedGathering: null,
    selectedCoven: null,
    selectedUser: null,
    
    setSelectedGathering: (gathering: GatheringInterface) => set({ selectedGathering: gathering }),
    setSelectedCoven: (coven: CovenInterface) => set({ selectedCoven: coven }),
    setSelectedUser: (user: UserInterface) => set({ selectedUser: user }),
    
    resetSelections: () => set({ 
      selectedGathering: null,
      selectedCoven: null,
      selectedUser: null 
    }),
  }));
  
  export default useGlobalStore;