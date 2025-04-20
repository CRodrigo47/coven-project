import { View, StyleSheet, Text, Button, Pressable } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function InviteQR() {
  return (
    <View style={styles.container}>
      <Text style={styles.QRText}>Invite your friends by QR</Text>
      <View style={styles.QRContainer}>
        <QRCode value="https://github.com/CRodrigo47" size={200} />
      </View>
      <Text style={styles.QRText}>Or send them a link instead</Text>
      <Pressable>
        <Text  style={styles.QRButton}
          className="color-white"
        >
          Copy link
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcf5d7",
    justifyContent: "center",
    alignItems: "center",
  },
  QRContainer: {
    borderWidth: 5,
    padding: 2,
  },
  QRText: {
    fontSize: 20,
    paddingVertical: 8,
  },
  QRButton: {
    width: 100,
    backgroundColor: "#6E4894",
    textAlign: "center",
    borderWidth: 1,
    marginTop: 2,
    paddingVertical: 6,
    borderRadius: 4
  }
});
