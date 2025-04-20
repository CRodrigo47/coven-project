import CovenSelected from "@/components/CovenComponents/CovenSelected";
import CreateGatheringButton from "@/components/GatheringComponents/CreateGatheringButton";
import InviteGatheringButton from "@/components/GatheringComponents/InviteGatheringButton";
import useGlobalStore from "@/context/useStore";
import { Text, View } from "react-native";

export default function CovenDetail() {
  const selectedCoven = useGlobalStore((state: any) => state.selectedCoven);

  return (
    <>
      <View className="h-full" style={{ backgroundColor: "#fcf5d7" }}>
        <CovenSelected item={selectedCoven} />
      </View>
      <InviteGatheringButton />
      <CreateGatheringButton />
    </>
  );
}
