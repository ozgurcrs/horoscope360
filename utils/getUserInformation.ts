import AsyncStorage from "@react-native-async-storage/async-storage";

export const getUserInformation = async () => {
  const userInformation = await AsyncStorage.getItem("userInformation");
  return userInformation ? JSON.parse(userInformation) : null;
};
