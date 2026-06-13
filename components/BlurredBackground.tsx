import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

interface BlurredBackgroundProps {
  imageUri?: string;
  height: number;
  accentColor?: string;
}
const BlurredBackground = React.memo(
  ({ imageUri, height, accentColor = "#050505" }: BlurredBackgroundProps) => {
    console.log("color", accentColor);
    return (
      <View
        style={{
          height: height * 1.85,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
        }}
      >
        <LinearGradient
          colors={[
            accentColor,
            "rgba(5, 5, 5, 0.2)",
            // "rgba(5, 5, 5, 0.5)",

            "#0505058c",
          ]}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  },
);
BlurredBackground.displayName = "BlurredBackground";

export default BlurredBackground;
