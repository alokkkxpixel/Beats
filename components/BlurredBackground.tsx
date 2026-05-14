import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

interface BlurredBackgroundProps {
  imageUri: string;
  height: number;
}

const BlurredBackground = React.memo(
  ({ imageUri, height }: BlurredBackgroundProps) => {
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
        <Image
          source={{ uri: imageUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          blurRadius={50}
          cachePolicy="memory-disk"
        />
        <LinearGradient
          colors={[
            "rgba(5,5,5,0.4)",
            "rgba(5,5,5,0.7)",
            "rgba(5,5,5,0.9)",
            "#050505",
          ]}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  },
);

export default BlurredBackground;
