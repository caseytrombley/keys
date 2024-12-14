<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { db } from '../firebase/firebase';
import { useChordsStore } from '../stores/chordsStore';

// Define types
interface ChordDetail {
  id: string;
  name: string;
  notes: string[];
  intervals: string[];
  midiKeys: number[];
}

interface ChordKey {
  key: string;
  chords: Record<string, ChordDetail>;
}

const router = useRouter();
const selectedAbbreviation = ref<string | null>(null);

// Store reference from Pinia
const chordsStore = useChordsStore();

// Fetch chords data from Firestore
const fetchChords = async () => {
  const querySnapshot = await getDocs(collection(db, 'chords'));

  const parsedChords: ChordKey[] = [];
  const abbreviationMap = new Map<string, { key: string; id: string }>();
  const abbreviations: string[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const key = doc.id; // Top-level key (C, C#, etc.)
    const chords = data;

    // Transform into ChordKey structure
    parsedChords.push({
      key,
      chords,
    });

    // Populate abbreviations for the autocomplete
    Object.entries(chords).forEach(([chordId, chord]) => {
      abbreviations.push(chord.name);
      abbreviationMap.set(chord.name, { key, id: chordId });
    });
  });

  // Set data in the store for caching
  chordsStore.setChordsData({
    chordsByKey: parsedChords,
    abbreviations,
    abbreviationMap,
  });
};

// Fetch data on component mount, only if not cached
onMounted(() => {
  if (chordsStore.chordsByKey.length === 0) {
    fetchChords(); // Fetch if no data in store
  }
});

// Handle autocomplete selection
const onAutocompleteSelect = (selected: string) => {
  const chordData = chordsStore.abbreviationMap.get(selected);
  if (chordData) {
    const { key, id } = chordData;
    const encodedKey = encodeURIComponent(key);
    const encodedId = encodeURIComponent(id);
    router.push(`/chords/piano/${encodedKey}/${encodedId}`);
  } else {
    console.warn('Selected abbreviation not found in map:', selected);
  }
};

const customFilter = (item: string, query: string): boolean => {
  const normalize = (str: string) => str.toLowerCase().replace(/[-\s]/g, '');
  const normalizedQuery = normalize(query);
  const normalizedItem = normalize(item);
  return normalizedItem.startsWith(normalizedQuery);
};
</script>

<template>
  <div>
    <!-- Autocomplete for searching chords -->
    <v-autocomplete
      v-model="selectedAbbreviation"
      :items="chordsStore.abbreviations"
      :custom-filter="customFilter"
      label="Search for a chord"
      @update:model-value="onAutocompleteSelect"
      dense
    ></v-autocomplete>

    <!-- Chords grouped by musical key -->
    <div v-if="chordsStore.chordsByKey.length">
      <div
        v-for="(chordGroup, index) in chordsStore.chordsByKey"
        :key="index"
        class="chord-group"
      >
        <h2>{{ chordGroup.key }}</h2>
        <v-row dense>
          <v-col
            v-for="(chord, chordId) in chordGroup.chords"
            :key="chord + '-' + chordId"
            cols="auto"
          >
            <v-card
              :to="`/chords/piano/${encodeURIComponent(chordGroup.key)}/${encodeURIComponent(chordId)}`"
              router
              class="d-flex flex-column justify-center align-center hover-card"
              elevation="2"
            >
              <div class="chord-name">{{ chord.name }}</div>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
h1 {
  text-align: center;
  margin-bottom: 1rem;
}

.chord-name {
  font-size: 1.3rem;
  font-weight: bold;
  text-align: center;
}

.v-card {
  text-align: center;
  padding: 8px;
  width: 80px;
  height: 80px;
  transition: transform 0.2s, background-color 0.2s;
}

.v-card:hover {
  transform: scale(1.05);
}

.hover-card {
  cursor: pointer;
  text-decoration: none;
}
</style>
