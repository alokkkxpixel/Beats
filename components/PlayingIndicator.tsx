import LottieView from 'lottie-react-native';
import { StyleSheet, View } from "react-native";
export default function PlayingIndicator() {
 
  return (
    <View style={styles.container}>
       <LottieView
      source={require('../assets/images/playing.json')}
      autoPlay
      loop
      style={{
        
        width: 100,
        height: 60,
      }}
    />
     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "red",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  bar: {
    width: 3,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
});
