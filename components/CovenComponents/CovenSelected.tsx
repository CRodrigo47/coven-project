import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import CovenInterface from '@/app/interfaces/covenInterface';
import GatheringItem from '../GatheringComponents/GatheringItem';
import GatheringInterface from '@/app/interfaces/gatheringInterface';
import { getTypography } from '@/constants/TYPOGRAPHY';
import { COLORS } from '@/constants/COLORS';

export default function CovenSelected({ item }: { item: CovenInterface }) {
  const [nextGatherings, setNextGatherings] = useState<GatheringInterface[]>([]);
  const [historyGatherings, setHistoryGatherings] = useState<GatheringInterface[]>([]);

  const fetchAndFilterGatherings = useCallback(async () => {
        if (!item || !item.id) {
          console.log('No valid Coven selected');
          setNextGatherings([]);
          setHistoryGatherings([]);
          return;
        }

    try {
      const { data, error } = await supabase
        .from('Gathering')
        .select('*')
        .eq('coven_id', item.id);

      if (error) throw error;

      const currentDate = new Date();
      const next = data?.filter(g => new Date(g.date) > currentDate) || [];
      const history = data?.filter(g => new Date(g.date) <= currentDate) || [];

      setNextGatherings(next);
      setHistoryGatherings(history);
    } catch (error) {
      console.error('Error al cargar gatherings:', error);
      setNextGatherings([]);
      setHistoryGatherings([]);
    }
  }, [item]);

  useFocusEffect(
    useCallback(() => {
      fetchAndFilterGatherings();
    }, [fetchAndFilterGatherings])
  );

  if (!item || !item.id) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No Coven selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[getTypography("titleLarge", "light"), styles.sectionTitle]}>
        Upcoming gatherings
      </Text>
      <FlatList
        data={nextGatherings}
        renderItem={({ item }) => <GatheringItem item={item} />}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={[getTypography("titleLarge", "light"), styles.emptyText]}>
            There are no gatherings on schedule
          </Text>
        }
      />

      <Text style={[getTypography("titleLarge", "light"), styles.sectionTitle]}>
        Gatherings History
      </Text>
      <FlatList
        data={historyGatherings}
        renderItem={({ item }) => <GatheringItem item={item} />}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={[getTypography("titleLarge", "light"), styles.emptyText]}>
            There are no previous gatherings
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    padding: 10,
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primaryDark,
    marginBottom: 5
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: 'black',
  },
});