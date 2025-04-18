import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useDailyColorEnergy } from "../hooks/useDailyColorEnergy";

const DailyColorEnergy = () => {
  const colorEnergy = useDailyColorEnergy();

  if (!colorEnergy) return null;

  return (
    <TouchableOpacity style={styles.container}>
      <LinearGradient
        colors={colorEnergy.gradient as [string, string, ...string[]]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Ionicons name={colorEnergy.icon as any} size={24} color="#FFF" />
          <Text style={styles.title}>Günün Renk Enerjisi</Text>
        </View>

        <Text style={styles.colorName}>{colorEnergy.name}</Text>

        <View style={styles.energyContainer}>
          <Text style={styles.energyText}>{colorEnergy.energy}</Text>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsHeader}>Bugün İçin Öneriler:</Text>
          {colorEnergy.moodTips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Ionicons
                name="ellipse"
                size={8}
                color="#FFF"
                style={styles.bullet}
              />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  card: {
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  colorName: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
  },
  energyContainer: {
    marginBottom: 20,
  },
  energyText: {
    color: "#FFF",
    fontSize: 16,
    lineHeight: 24,
  },
  tipsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 8,
    padding: 12,
  },
  tipsHeader: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "center",
  },
  bullet: {
    marginRight: 8,
  },
  tipText: {
    color: "#FFF",
    fontSize: 14,
    flex: 1,
  },
});

export default DailyColorEnergy;
