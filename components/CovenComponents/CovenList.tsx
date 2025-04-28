import CovenInterface from "@/app/interfaces/covenInterface";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import CovenItem from "./CovenItem";
import CreateCovenButton from "./CreateCovenButton";
import { getTypography } from "@/constants/TYPOGRAPHY";
import { COLORS } from "@/constants/COLORS";
import useGlobalStore from "@/context/useStore";

const fetchUserCoven = async (
  userId: string | undefined
): Promise<CovenInterface[]> => {
  if (!userId) {
    console.error("Error: No userId provided to fetchUserCoven");
    return [];
  }

  try {
    console.log(`Fetching covens for user ${userId}...`);
    
    const { data, error } = await supabase
      .from("_Members_")
      .select(`coven_id (*)`)
      .eq("user_id", userId);

    if (error) {
      console.error("Error in fetchUserCoven: ", error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log("No covens found for user");
      return [];
    }

    const covens = data.map((item) => item.coven_id as CovenInterface);
    console.log(`Found ${covens.length} covens for user with IDs: ${covens.map(c => c.id).join(', ')}`);
    return covens;
  } catch (err) {
    console.error("Exception in fetchUserCoven: ", err);
    return [];
  }
};

export default function CovenList() {
  const [allCoven, setAllCoven] = useState<CovenInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();
  const skipCovenCheck = useGlobalStore((state: any) => state.skipCovenCheck);
  const setSkipCovenCheck = useGlobalStore((state: any) => state.setSkipCovenCheck);
  
  // Accede al estado global
  const selectedCoven = useGlobalStore((state: any) => state.selectedCoven);
  const resetSelections = useGlobalStore((state: any) => state.resetSelections);
  
  // Flag para controlar si debemos verificar la existencia del Coven
  const [shouldCheckCoven, setShouldCheckCoven] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchCovens = async () => {
        setIsLoading(true);
        setShouldCheckCoven(false); // Desactivar verificación durante la carga
        
        const userCoven = await fetchUserCoven(session?.user.id);
        setAllCoven(userCoven);
        setIsLoading(false);
        
        // Activar verificación solo después de que los datos estén cargados
        setShouldCheckCoven(true);
      };
      fetchCovens();
    }, [session?.user.id])
  );

  // Efecto separado para verificar la existencia del Coven seleccionado
  useEffect(() => {

    if (skipCovenCheck) {
      console.log("Saltando verificación de Coven por bandera skipCovenCheck");
      // Desactivar la bandera después de un tiempo
      setTimeout(() => {
        setSkipCovenCheck(false);
      }, 2000);
      return;
    }
    // Solo verificar cuando:
    // 1. No estamos cargando
    // 2. La bandera shouldCheckCoven está activada
    // 3. Hay un Coven seleccionado
    // 4. La lista de Covens ya está cargada
    if (!isLoading && shouldCheckCoven && selectedCoven && allCoven.length > 0) {
      console.log("Verificando existencia del Coven seleccionado...");
      
      // Verificar si el Coven existe en la lista actual
      const covenExists = allCoven.some(coven => coven.id === selectedCoven.id);
      
      if (!covenExists) {
        console.log(`Coven con ID ${selectedCoven.id} no encontrado en la lista de ${allCoven.length} Covens`);
        // Imprimir IDs de los Covens en la lista para diagnóstico
        allCoven.forEach(coven => console.log(`Coven en lista: ${coven.id}`));
        
        resetSelections();
      } else {
        console.log(`Coven con ID ${selectedCoven.id} encontrado en la lista`);
      }
    }
  }, [isLoading, shouldCheckCoven, selectedCoven, allCoven, resetSelections]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (allCoven[0]) {
    return (
      <>
        <FlatList
        style={{marginTop: 10}}
          data={allCoven}
          renderItem={({ item }) => <CovenItem item={item} />}
          keyExtractor={(item) => item.id.toString()}
        />
        <CreateCovenButton />
      </>
    );
  }

  return (
    <>
      <View
        style={{ justifyContent: "center", alignItems: "center" }}
        className="h-full"
      >
        <Text style={getTypography("titleLarge", "light")}>
          You are not in any Coven
        </Text>
      </View>
      <CreateCovenButton />
    </>
  );
}