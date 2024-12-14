<script setup lang="ts">
import { ref, onMounted } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "vue-router";

import { db } from "../firebase/firebase";

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
  chords: Record<string, ChordDetail>; // Object containing chord details
}

const chordsByKey = ref<ChordKey[]>([]); // Store chords grouped by key
const abbreviations = ref<string[]>([]); // Abbreviations for autocomplete
const abbreviationMap = ref<Map<string, { key: string; id: string }>>(new Map()); // Map abbreviation to chord key and ID

const router = useRouter();
const selectedAbbreviation = ref<string | null>(null);

// Fetch chords data from Firestore
const fetchChords = async () => {
  const querySnapshot = await getDocs(collection(db, "chords"));

  const parsedChords: ChordKey[] = [];

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
      abbreviations.value.push(chord.name);
      abbreviationMap.value.set(chord.name, { key, id: chordId });
    });
  });

  chordsByKey.value = parsedChords;
  console.log("Chords by Key:", chordsByKey.value);
};

// Handle autocomplete selection
const onAutocompleteSelect = (selectedAbbreviation: string) => {
  const chordData = abbreviationMap.value.get(selectedAbbreviation);
  if (chordData) {
    const { key, id } = chordData;
    // Encode the key (with '#' symbol) before navigating
    const encodedKey = encodeURIComponent(key);
    const encodedId = encodeURIComponent(id);
    router.push(`/chords/piano/${encodedKey}/${encodedId}`);
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchChords();
});
</script>

<template>
  <div>
    <!-- Autocomplete for searching chords -->
    <v-autocomplete
      v-model="selectedAbbreviation"
      :items="abbreviations"
      label="Search for a chord"
      @update:model-value="onAutocompleteSelect"
      dense
    ></v-autocomplete>

    <!-- Chords grouped by musical key -->
    <div v-if="chordsByKey.length">
      <div
        v-for="(chordGroup, index) in chordsByKey"
        :key="index"
        class="chord-group"
      >
        <h2>{{ chordGroup.key }}</h2>
        <v-row dense>
          <v-col
            v-for="(chord, chordId) in chordGroup.chords"
            :key="chordId"
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
