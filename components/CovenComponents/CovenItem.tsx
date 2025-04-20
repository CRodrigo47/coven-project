import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import CovenInterface from '@/app/interfaces/covenInterface';
import useGlobalStore from '@/context/useStore';

export default function CovenItem({ item }: { item: CovenInterface }) {
    const router = useRouter();
    const setSelectedCoven = useGlobalStore((state: any) => state.setSelectedCoven);
    const [membersCount, setMembersCount] = useState(0);
    const [nextGathering, setNextGathering] = useState<string | null>(null);

    const fetchMembersCount = useCallback(async () => {
        try {
            const { count, error } = await supabase
                .from('_Members_')
                .select('*', { count: 'exact', head: true })
                .eq('coven_id', item.id);

            if (error) throw error;
            setMembersCount(count || 0);
        } catch (error) {
            console.error('Error fetching members count:', error);
            setMembersCount(0);
        }
    }, [item.id]);

    const fetchNextGathering = useCallback(async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            const { data, error } = await supabase
                .from('Gathering')
                .select('date, time, name')
                .eq('coven_id', item.id)
                .gte('date', today)
                .order('date', { ascending: true })
                .order('time', { ascending: true })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                const gathering = data[0];
                const formattedDate = new Date(gathering.date).toLocaleDateString();
                setNextGathering(`${formattedDate} ${gathering.time.substring(0,5)}`);
            } else {
                setNextGathering(null);
            }
        } catch (error) {
            console.error('Error fetching next gathering:', error);
            setNextGathering(null);
        }
    }, [item.id]);
    useFocusEffect(
        useCallback(() => {
            fetchMembersCount();
            fetchNextGathering();
            return () => {
            };
        }, [fetchMembersCount, fetchNextGathering])
    );

    const moveToDetail = () => {
        setSelectedCoven(item);
        router.push("/mainTabs/covenTabs/covenDetail");
    };

    return (
        <TouchableOpacity onPress={moveToDetail}>
            <View style={styles.covenInfo}>
                <View className="w-1/2 ps-4">
                    <Text>{item.name}</Text>
                </View>
                <View className="w-1/2 pe-4 py-2" style={styles.rightSection}>
                    <Text className="text-center">{membersCount} members</Text>
                    {nextGathering ? (
                        <Text>{nextGathering}</Text>
                    ) : (
                        <Text>No upcoming gatherings</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    covenInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1
    },
    rightSection: {
        alignItems: "flex-end",
    }
});