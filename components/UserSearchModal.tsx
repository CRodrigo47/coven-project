import { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, Modal, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import {  usePathname, useRouter } from 'expo-router';
import useGlobalStore from '@/context/useStore';
import UserInterface from '@/app/interfaces/userInterface';
import { COLORS } from '@/constants/COLORS';
import { FONTS } from '@/constants/FONTS';

const { width, height } = Dimensions.get('window');

export const UserSearchModal = () => {
  const router = useRouter();
  const pathname = usePathname()
  const setSelectedUser = useGlobalStore((state: any) => state.setSelectedUser);
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchUsers = async () => {
    if (!searchText.trim()) {
      setUsers([]);
      setLoading(false);
      setIsTyping(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .ilike('user_name', `%${searchText}%`)
        .limit(8);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (searchText.trim()) {
      setIsTyping(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        searchUsers();
      }, 1000);
    } else {
      setIsTyping(false);
      setUsers([]);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchText]);

  const handleUserSelect = (user: UserInterface) => {
    setSelectedUser(user);
    if(pathname.includes("mainTabs")){
      router.push(`/${user.user_name}`);
    }else{
      router.replace(`/${user.user_name}`);
    }
    setVisible(false);
    setSearchText('');
    setUsers([]);
    setIsTyping(false);
  };

  const showLoading = isTyping || loading;
  const showNoResults = !showLoading && searchText.trim() && users.length === 0;
  const showInitialState = !searchText.trim();

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <Ionicons name="search" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setVisible(false);
          setSearchText('');
          setUsers([]);
          setIsTyping(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.searchBox}>
              <View style={styles.searchHeader}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search users..."
                  placeholderTextColor="#999"
                  value={searchText}
                  onChangeText={setSearchText}
                  autoFocus
                />
                <TouchableOpacity 
                  onPress={() => {
                    setVisible(false);
                    setSearchText('');
                    setUsers([]);
                    setIsTyping(false);
                  }} 
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {showLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#8C5ABE" />
                  <Text style={styles.loadingText}>Searching users...</Text>
                </View>
              ) : showNoResults ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No users found</Text>
                </View>
              ) : showInitialState ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Type to search users</Text>
                </View>
              ) : (
                <FlatList
                  data={users}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.userItem} 
                      onPress={() => handleUserSelect(item)}
                    >
                      <Text style={styles.userName}>{item.user_name}</Text>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={styles.listContainer}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.7,
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchBox: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    fontFamily: FONTS.medium
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
    fontFamily: FONTS.medium
  },
  listContainer: {
    paddingBottom: 16,
  },
  userItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userName: {
    fontSize: 16,
    color: '#333',
    fontFamily: FONTS.medium
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontFamily: FONTS.medium
  },
});