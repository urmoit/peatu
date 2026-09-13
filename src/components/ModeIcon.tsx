import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { TransitMode } from "@/types";

const ICONS: Record<TransitMode, React.ComponentProps<typeof MaterialCommunityIcons>["name"]> = {
  bus: "bus",
  train: "train",
  tram: "tram",
  ferry: "ferry",
  walk: "walk",
};

export default function ModeIcon({
  mode,
  size = 18,
  color,
}: {
  mode: TransitMode;
  size?: number;
  color: string;
}) {
  return <MaterialCommunityIcons name={ICONS[mode]} size={size} color={color} />;
}
