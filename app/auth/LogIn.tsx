import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { Logo } from "@/constants/covenIcons";
import { getTypography } from "@/constants/TYPOGRAPHY";
import { COLORS } from "@/constants/COLORS";
import LoginForm from "@/components/logInForm";

export default function LogIn() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo />
      </View>
      <LoginForm />
      <Text style={styles.footerText}>Don't have an account yet?</Text>
      <Link href="/createAccount" style={styles.createAccountLink}>
        Create one
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fcf5d7",
    paddingTop: 120,
  },
  logoContainer: {
    marginBottom: 40,
  },
  footerText: {
    ...getTypography("bodyMedium", "light"),
  },
  createAccountLink: {
    ...getTypography("bodyMedium", "light"),
    color: COLORS.primary,
    textAlign: "center"
  },
});