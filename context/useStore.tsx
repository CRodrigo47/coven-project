import CovenInterface from '@/app/interfaces/covenInterface';
import GatheringInterface from '@/app/interfaces/gatheringInterface';
import UserInterface from '@/app/interfaces/userInterface';
import { create } from 'zustand'

const useGlobalStore = create((set) => ({
  selectedGathering: null,
  selectedCoven: null,
  selectedUser: null,
  skipCovenCheck: false, // Nueva bandera
  
  setSelectedGathering: (gathering: GatheringInterface) => set({ selectedGathering: gathering }),
  setSelectedCoven: (coven: CovenInterface) => set({ 
    selectedCoven: coven,
    skipCovenCheck: true // Activar bandera al seleccionar un Coven
  }),
  setSelectedUser: (user: UserInterface) => set({ selectedUser: user }),
  setSkipCovenCheck: (skip: boolean) => set({ skipCovenCheck: skip }),
  
  resetSelections: () => set({ 
    selectedGathering: null,
    selectedCoven: null,
    selectedUser: null,
    skipCovenCheck: false
  }),
}));
  
  export default useGlobalStore;