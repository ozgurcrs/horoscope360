import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  Text,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  KeyboardEvent,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useAnimatedGestureHandler,
  runOnJS,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export type BottomSheetRefProps = {
  scrollTo: (destination: number) => void;
  isActive: () => boolean;
};

export type BottomSheetProps = {
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
  onClose?: () => void;
  backDropOpacity?: number;
};

const BottomSheet = React.forwardRef<BottomSheetRefProps, BottomSheetProps>(
  (
    {
      children,
      title,
      snapPoints = Platform.OS === "android" ? [0.7, 0.95] : [0.5, 0.9],
      onClose,
      backDropOpacity = 0.5,
    },
    ref
  ) => {
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const active = useSharedValue(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener(
        Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
        (e: KeyboardEvent) => {
          const height = e.endCoordinates.height;
          setKeyboardHeight(height);

          if (active.value) {
            const keyboardAdjustedPosition = SCREEN_HEIGHT * 0.15;
            translateY.value = withTiming(keyboardAdjustedPosition, {
              duration: 250,
            });
          }
        }
      );

      const keyboardDidHideListener = Keyboard.addListener(
        Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
        () => {
          setKeyboardHeight(0);

          if (active.value) {
            const activePoint = snapPoints[snapPoints.length - 1];
            translateY.value = withTiming(SCREEN_HEIGHT * (1 - activePoint), {
              duration: 250,
            });
          }
        }
      );

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }, []);

    const scrollTo = useCallback((destination: number) => {
      "worklet";

      if (destination === 0) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
        active.value = false;
        runOnJS(Keyboard.dismiss)();
        return;
      }

      const adjustedDestination =
        Platform.OS === "android" && destination > 0.8 ? 0.98 : destination;

      const finalPosition = SCREEN_HEIGHT * (1 - adjustedDestination);

      translateY.value = withTiming(finalPosition, {
        duration: 300,
      });

      active.value = true;

      if (Platform.OS === "android") {
        setTimeout(() => {
          runOnJS(ensureOpen)(adjustedDestination);
        }, 400);
      }
    }, []);

    const ensureOpen = (destination: number) => {
      if (active.value && Platform.OS === "android") {
        const finalPosition = SCREEN_HEIGHT * (1 - destination);
        translateY.value = withTiming(finalPosition, { duration: 200 });
      }
    };

    const isActive = useCallback(() => {
      return active.value;
    }, []);

    useImperativeHandle(ref, () => ({ scrollTo, isActive }), [
      scrollTo,
      isActive,
    ]);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, ctx: any) => {
        ctx.startY = translateY.value;
        ctx.startTime = new Date().getTime();
      },
      onActive: (event, ctx) => {
        if (event.absoluteY < 150 && Math.abs(event.translationY) > 10) {
          const newTranslateY = Math.max(
            SCREEN_HEIGHT * 0.02, // Minimum pozisyon
            ctx.startY + event.translationY
          );
          translateY.value = newTranslateY;
        }
      },
      onEnd: (event, ctx) => {
        const duration = new Date().getTime() - ctx.startTime;
        if (duration < 300 && Math.abs(event.translationY) < 10) {
          return;
        }

        if (event.velocityY > 500 || translateY.value > SCREEN_HEIGHT * 0.6) {
          translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
          active.value = false;
          runOnJS(Keyboard.dismiss)();
          if (onClose) {
            runOnJS(onClose)();
          }
        } else {
          const highestPoint = Math.max(...snapPoints);
          translateY.value = withTiming(SCREEN_HEIGHT * (1 - highestPoint), {
            duration: 300,
          });
        }
      },
    });

    const backDropStyle = useAnimatedStyle(() => {
      return {
        opacity: withTiming(active.value ? backDropOpacity : 0, {
          duration: 300,
        }),
        display: active.value ? "flex" : "none",
      };
    });

    const bottomSheetStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: translateY.value }],
      };
    });

    const closeBottomSheet = () => {
      Keyboard.dismiss();
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      active.value = false;
      if (onClose) onClose();
    };

    const contentHeightStyle = {
      maxHeight:
        keyboardHeight > 0 ? SCREEN_HEIGHT * 0.6 : SCREEN_HEIGHT * 0.85,
    };

    return (
      <>
        <Animated.View style={[styles.backdrop, backDropStyle]}>
          <Pressable
            style={styles.backdropPressable}
            onPress={() => {
              Keyboard.dismiss();
              closeBottomSheet();
            }}
          />
        </Animated.View>

        {/* BottomSheet */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "position" : undefined}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
          enabled={Platform.OS === "ios"}
        >
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.container, bottomSheetStyle]}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.handle} />
                <View style={styles.titleContainer}>
                  {title && <Text style={styles.title}>{title}</Text>}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeBottomSheet}
                  >
                    <Ionicons name="close-outline" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                style={[styles.content, contentHeightStyle]}
                contentContainerStyle={{
                  padding: 20,
                  paddingBottom: 60,
                }}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                bounces={false}
                scrollEventThrottle={16}
              >
                {children}

                <View style={{ height: 20 }} />

                {keyboardHeight > 0 && (
                  <View style={{ height: keyboardHeight * 0.7 }} />
                )}
              </ScrollView>
            </Animated.View>
          </PanGestureHandler>
        </KeyboardAvoidingView>
      </>
    );
  }
);

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    zIndex: 10,
  },
  backdropPressable: {
    width: "100%",
    height: "100%",
  },
  keyboardAvoidingView: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    zIndex: 11,
  },
  container: {
    backgroundColor: "#FFFFFF",
    width: SCREEN_WIDTH,
    maxHeight: SCREEN_HEIGHT * 0.9,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#DDD",
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
});

export default BottomSheet;
