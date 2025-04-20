import { useState, useCallback } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import CovenInterface from '@/app/interfaces/covenInterface';
import GatheringItem from '../GatheringComponents/GatheringItem';
import GatheringInterface from '@/app/interfaces/gatheringInterface';
import useGlobalStore from '@/context/useStore';

export default function CovenSelected({ item }: { item: CovenInterface }) {
  const [nextGatherings, setNextGatherings] = useState<GatheringInterface[]>([]);
  const [historyGatherings, setHistoryGatherings] = useState<GatheringInterface[]>([]);

  const fetchAndFilterGatherings = useCallback(async () => {
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
  }, [item.id]);

  useFocusEffect(
    useCallback(() => {
      fetchAndFilterGatherings();
    }, [fetchAndFilterGatherings])
  );

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 10, textAlign: "center", borderBottomWidth: 2 }}>
        Próximos Gatherings
      </Text>
      <FlatList
        data={nextGatherings}
        renderItem={({ item }) => <GatheringItem item={item} />}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', padding: 20 }}>
            No hay gatherings programados
          </Text>
        }
      />

      <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 10, textAlign: "center", borderBottomWidth: 2 }}>
        Historial
      </Text>
      <FlatList
        data={historyGatherings}
        renderItem={({ item }) => <GatheringItem item={item} />}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', padding: 20 }}>
            No hay gatherings anteriores
          </Text>
        }
      />
    </View>
  );
}