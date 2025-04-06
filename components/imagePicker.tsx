import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import NetInfo from '@react-native-community/netinfo';

type ImagePickerProps = {
  initialImage?: string | null;
  onImageSelected: (uri: string | null) => void;
  uploadToSupabase?: boolean;
  bucketName?: string;
  folderPath?: string;
};

const ImagePickerComponent: React.FC<ImagePickerProps> = ({
  initialImage = null,
  onImageSelected,
  uploadToSupabase = false,
  bucketName = 'avatars',
  folderPath = 'public/',
}) => {
  const [image, setImage] = useState<string | null>(initialImage);
  const [uploading, setUploading] = useState(false);

  

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      
      // 1. Convertir la imagen a base64 (método más confiable en Expo Go)
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      // 2. Convertir base64 a ArrayBuffer
      const arrayBuffer = decode(base64Data);
  
      // 3. Subir a Supabase
      const fileName = `user_icons/${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
        });
  
      if (error) throw error;
  
      // 4. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
  
      return publicUrl;
    } catch (error) {
      console.error('Error en uploadImage:', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        uri,
        platform: Platform.OS,
      });
      
      throw new Error(
        Platform.OS === 'android' 
          ? 'Error al subir. ¿Tienes buena conexión a internet?'
          : 'Error al subir la imagen'
      );
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Verificar conexión a internet
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        Alert.alert('Sin conexión', 'Necesitas conexión a internet para subir imágenes');
        return;
      }
  
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Necesitamos acceso a tus fotos');
        return;
      }
  
      // Seleccionar imagen (con la nueva sintaxis)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: false
      });
  
      if (!result.canceled && result.assets[0].uri) {
        const selectedImage = result.assets[0].uri;
        setImage(selectedImage);
        
        if (uploadToSupabase) {
          try {
            const publicUrl = await uploadImage(selectedImage);
            onImageSelected(publicUrl);
          } catch (error) {
            Alert.alert(
              'Error', 
              error instanceof Error ? error.message : 'Error al subir la imagen'
            );
            setImage(null);
            onImageSelected(null);
          }
        } else {
          onImageSelected(selectedImage);
        }
      }
    } catch (error) {
      console.error('Error en pickImage:', error);
      Alert.alert('Error', 'No se pudo completar la operación');
    }
  };

  const removeImage = () => {
    setImage(null);
    onImageSelected(null);
  };

  return (
    <View style={styles.container}>
      {image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
            <Ionicons name="close-circle" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={pickImage} 
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="camera" size={32} color="#fff" />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 15,
  },
  uploadButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
});

export default ImagePickerComponent;