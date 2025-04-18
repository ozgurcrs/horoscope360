import { Tarot } from "@/constants/tarots";
import { StyleSheet, TouchableOpacity } from "react-native";
import Typography from "@/components/ui/Typography";
export default function FlipCard({
  tarot,
  onPress,
}: {
  tarot: Tarot;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Typography variant="span" color="white">
        {tarot.name}
      </Typography>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 65,
    height: 100,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    padding: 10,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "purple",
  },
});
