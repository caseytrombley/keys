import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useChordsStore = defineStore('chords', () => {
  const chordsByKey = ref([]); // Store chords grouped by key
  const abbreviations = ref<string[]>([]); // Abbreviations for autocomplete
  const abbreviationMap = ref<Map<string, { key: string; id: string }>>(new Map()); // Map abbreviation to chord key and ID

  const setChordsData = (data: any) => {
    chordsByKey.value = data.chordsByKey;
    abbreviations.value = data.abbreviations;
    abbreviationMap.value = data.abbreviationMap;
  };

  return {
    chordsByKey,
    abbreviations,
    abbreviationMap,
    setChordsData
  };
});
