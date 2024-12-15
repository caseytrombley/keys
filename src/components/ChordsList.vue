<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useChordsStore } from "../stores/chordsStore";
import PageHeader from "./PageHeader.vue";

// Props
const props = defineProps({
  baseKey: {
    type: String,
    default: null, // If null, show all keys
  },
  enableAutocomplete: {
    type: Boolean,
    default: true, // Whether to display the autocomplete
  },
});

// Router and Store
const router = useRouter();
const chordsStore = useChordsStore();

// State
const selectedAbbreviation = ref<string | null>(null);
const abbreviations = ref<string[]>([]);
const abbreviationMap = ref<Map<string, { key: string; id: string; original: string }>>(new Map());

// Computed: Filter chords by the provided baseKey, or show all chords
const filteredChords = computed(() => {
  if (props.baseKey) {
    return chordsStore.chords[props.baseKey] || [];
  }
  return Object.entries(chordsStore.chords).map(([key, chordList]) => ({
    key,
    chords: chordList,
  }));
});

// Generate abbreviations for autocomplete
const generateAbbreviations = () => {
  const abbrevMap = new Map<string, { key: string; id: string; original: string }>();
  const abbrevList: string[] = [];

  Object.entries(chordsStore.chords).forEach(([key, chordList]) => {
    chordList.forEach((chord) => {
      // Add original name
      abbrevList.push(chord.name);
      abbrevMap.set(chord.name, { key, id: chord.id, original: chord.name });

      // Add normalized version
      const normalized = chord.name.replace(/-/g, "").toLowerCase(); // e.g., "a-5" -> "a5"
      if (normalized !== chord.name) {
        abbrevList.push(normalized);
        abbrevMap.set(normalized, { key, id: chord.id, original: chord.name });
      }
    });
  });

  // Remove duplicates
  abbreviations.value = [...new Set(abbrevList)];
  abbreviationMap.value = abbrevMap;
};

// Handle autocomplete selection
const onAutocompleteSelect = (selected: string) => {
  const chordData = abbreviationMap.value.get(selected);
  if (chordData) {
    const { key, id } = chordData;
    router.push(`/chords/piano/${encodeURIComponent(key)}/${encodeURIComponent(id)}`);
  } else {
    console.error(`No match found for input: "${selected}"`);
  }
};

// Fetch chords from Pinia store (only fetch from Firestore if data is missing)
const ensureChordsLoaded = async () => {
  if (props.baseKey) {
    if (!chordsStore.chords[props.baseKey]) {
      await chordsStore.fetchChordsForKey(props.baseKey); // Fetch only the specific key
    }
  } else {
    if (!chordsStore.allKeysLoaded) {
      await chordsStore.fetchAllChords(); // Fetch all chords if not already loaded
    }
  }
  generateAbbreviations();
};

// Watch for changes in the `baseKey` prop and refetch chords as needed
watch(() => props.baseKey, ensureChordsLoaded);

// Fetch chords on mount
onMounted(() => {
  ensureChordsLoaded();
});
</script>



<template>
  <div>
    <!-- Autocomplete -->
    <v-container max-width="1200px" fluid v-if="enableAutocomplete">
      <v-autocomplete
        v-model="selectedAbbreviation"
        :items="abbreviations"
        label="Search for a chord"
        @update:model-value="onAutocompleteSelect"
        dense
      ></v-autocomplete>
    </v-container>

    <!-- Chord list -->
    <div v-if="props.baseKey">
      <PageHeader pre="Chords in the key of" :title="props.baseKey" />
      <v-container max-width="1200px" fluid>
        <v-row dense>
          <v-col
            v-for="chord in filteredChords"
            :key="chord.id"
            cols="auto"
          >
            <v-card
              :to="`/chords/piano/${encodeURIComponent(props.baseKey)}/${encodeURIComponent(chord.id)}`"
              router
              class="d-flex flex-column justify-center align-center hover-card"
              elevation="2"
            >
              <div class="chord-name">{{ chord.name }}</div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Chords grouped by key (for home view) -->
    <div v-else>
      <div
        v-for="(chordGroup, index) in filteredChords"
        :key="chordGroup.key"
        class="chord-group"
      >
        <PageHeader pre="Chords in the key of" :title="chordGroup.key" />
        <v-container max-width="1200px" fluid>
          <v-row dense>
            <v-col
              v-for="chord in chordGroup.chords"
              :key="chord.id"
              cols="auto"
            >
              <v-card
                :to="`/chords/piano/${encodeURIComponent(chordGroup.key)}/${encodeURIComponent(chord.id)}`"
                router
                class="d-flex flex-column justify-center align-center hover-card"
                elevation="2"
              >
                <div class="chord-name">{{ chord.name }}</div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
