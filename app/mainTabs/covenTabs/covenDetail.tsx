import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import { Text, View } from "react-native";
import CovenSelected from "@/components/CovenComponents/CovenSelected";
import CreateCovenButton from "@/components/CovenComponents/CreateCovenButton";
import CreateGatheringButton from "@/components/GatheringComponents/CreateGatheringButton";
import InviteGatheringButton from "@/components/GatheringComponents/InviteGatheringButton";
import useGlobalStore from "@/context/useStore";
import CovenMembersButton from "@/components/CovenComponents/CovenMembersButton";

export default function CovenDetail() {
  const router = useRouter();
  const selectedCoven = useGlobalStore((state: any) => state.selectedCoven);
  const setSelectedGathering = useGlobalStore(
    (state: any) => state.setSelectedGathering
  );

  useFocusEffect(
    useCallback(() => {
      setSelectedGathering(null);

      // Si no hay un Coven seleccionado cuando esta pantalla obtiene el foco, redirigir
      if (!selectedCoven) {
        console.log("No hay Coven seleccionado al obtener foco en CovenDetail");
        router.replace("/mainTabs/covenTabs/");
      } else {
        console.log(
          "CovenDetail se enfocó con Coven seleccionado:",
          selectedCoven.id
        );
      }
    }, [selectedCoven, router, setSelectedGathering])
  );

  if (!selectedCoven) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Redirecting...</Text>
      </View>
    );
  }

  return (
    <>
      <View className="h-full" style={{ backgroundColor: "#fcf5d7" }}>
        <CovenMembersButton />
        <CovenSelected item={selectedCoven} />
      </View>
      <CreateCovenButton />
      <InviteGatheringButton />
      <CreateGatheringButton />
    </>
  );
}
