import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch, Modal, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/COLORS";
import { getTypography } from "@/constants/TYPOGRAPHY";

export default function Settings() {
  const router = useRouter();
  const [isNightMode, setIsNightMode] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [appInfoModalVisible, setAppInfoModalVisible] = useState(false);

  const toggleNightMode = () => setIsNightMode(previousState => !previousState);

  return (
    <View style={styles.container}>

      {/* Night Mode */}
      <View style={styles.settingItem}>
        <Text style={[getTypography("bodyLarge", "light"), styles.settingText]}>
          Night Mode
        </Text>
        <Switch
          trackColor={{ false: "#767577", true: COLORS.primaryDark }}
          thumbColor={isNightMode ? COLORS.primary : "#f4f3f4"}
          onValueChange={toggleNightMode}
          value={isNightMode}
        />
      </View>

      {/* Change User Information */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => router.navigate("/mainTabs/settingsTabs/changeUserInfo")}
      >
        <Text style={[getTypography("bodyLarge", "light"), styles.settingText]}>
          Change User Information
        </Text>
        <Text style={[getTypography("bodyMedium", "light"), styles.arrowIcon]}>
          &gt;
        </Text>
      </TouchableOpacity>

      {/* Friend List */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => router.navigate("/mainTabs/settingsTabs/friendsList")}
      >
        <Text style={[getTypography("bodyLarge", "light"), styles.settingText]}>
          Friend List
        </Text>
        <Text style={[getTypography("bodyMedium", "light"), styles.arrowIcon]}>
          &gt;
        </Text>
      </TouchableOpacity>

      {/* Block List */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => router.navigate("/mainTabs/settingsTabs/blockList")}
      >
        <Text style={[getTypography("bodyLarge", "light"), styles.settingText]}>
          Block List
        </Text>
        <Text style={[getTypography("bodyMedium", "light"), styles.arrowIcon]}>
          &gt;
        </Text>
      </TouchableOpacity>

      {/* Notifications */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => router.navigate("/mainTabs/settingsTabs/notifications")}
      >
        <Text style={[getTypography("bodyLarge", "light"), styles.settingText]}>
          Notifications
        </Text>
        <Text style={[getTypography("bodyMedium", "light"), styles.arrowIcon]}>
          &gt;
        </Text>
      </TouchableOpacity>

      {/* Language */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => setLanguageModalVisible(true)}
      >
        <Text style={[getTypography("bodyLarge", "light"), styles.settingText]}>
          Language
        </Text>
        <Text style={[getTypography("bodyMedium", "light"), styles.arrowIcon]}>
          &gt;
        </Text>
      </TouchableOpacity>

      {/* Help */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => setHelpModalVisible(true)}
      >
        <Text style={[getTypography("bodyLarge", "light"), styles.settingText]}>
          Help
        </Text>
        <Text style={[getTypography("bodyMedium", "light"), styles.arrowIcon]}>
          &gt;
        </Text>
      </TouchableOpacity>

      {/* Terms of Use */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => setTermsModalVisible(true)}
      >
        <Text style={[getTypography("bodyLarge", "light"), styles.settingText]}>
          Terms of Use
        </Text>
        <Text style={[getTypography("bodyMedium", "light"), styles.arrowIcon]}>
          &gt;
        </Text>
      </TouchableOpacity>

      {/* App Information */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => setAppInfoModalVisible(true)}
      >
        <Text style={[getTypography("bodyLarge", "light"), styles.settingText]}>
          App Information
        </Text>
        <Text style={[getTypography("bodyMedium", "light"), styles.arrowIcon]}>
          &gt;
        </Text>
      </TouchableOpacity>

      {/* Language Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[getTypography("headlineMedium", "light"), styles.modalTitle]}>
              Language Settings
            </Text>
            <Text style={[getTypography("bodyLarge", "light"), styles.modalText]}>
              WORK IN PROGRESS
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={[getTypography("bodyLarge", "light"), styles.closeButtonText]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Help Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={helpModalVisible}
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[getTypography("headlineMedium", "light"), styles.modalTitle]}>
              Help Center
            </Text>
            <ScrollView style={styles.modalScrollView}>
              <Text style={[getTypography("bodyMedium", "light"), styles.modalText]}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setHelpModalVisible(false)}
            >
              <Text style={[getTypography("bodyLarge", "light"), styles.closeButtonText]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Terms of Use Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={termsModalVisible}
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[getTypography("headlineMedium", "light"), styles.modalTitle]}>
              Terms of Use
            </Text>
            <ScrollView style={styles.modalScrollView}>
              <Text style={[getTypography("bodyMedium", "light"), styles.modalText]}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setTermsModalVisible(false)}
            >
              <Text style={[getTypography("bodyLarge", "light"), styles.closeButtonText]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* App Information Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={appInfoModalVisible}
        onRequestClose={() => setAppInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[getTypography("headlineMedium", "light"), styles.modalTitle]}>
              App Information
            </Text>
            <ScrollView style={styles.modalScrollView}>
              <Text style={[getTypography("bodyMedium", "light"), styles.modalText]}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setAppInfoModalVisible(false)}
            >
              <Text style={[getTypography("bodyLarge", "light"), styles.closeButtonText]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: 4,
    borderTopWidth: 1
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryDark,
    width: "100%",
    backgroundColor: COLORS.secondary,
  },
  settingText: {
    flex: 1,
  },
  arrowIcon: {
    fontSize: 18,
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: "80%",
  },
  modalTitle: {
    marginBottom: 15,
    color: COLORS.primary,
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "left",
  },
  modalScrollView: {
    width: "100%",
    maxHeight: "70%",
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
    minWidth: 100,
    alignItems: "center",
  },
  closeButtonText: {
  },
});