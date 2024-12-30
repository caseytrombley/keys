<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useChordsStore } from "../stores/chordsStore";
import PageHeader from "./PageHeader.vue";
import ChordCard from "./ChordCard.vue";
import {chordOrder} from "../utils/chordSorting";

const props = defineProps({
  baseKey: {
    type: String,
    default: null, // If null, show all keys
  },
});

// Router and Store
const router = useRouter();
const chordsStore = useChordsStore();

// Computed: Filter and sort chords based on the custom order
const filteredChords = computed(() => {
  if (props.baseKey) {
    const chords = chordsStore.chords[props.baseKey] || [];
    // const chordKeys = Object.keys(chords); // Replace "C" with the desired key
    // const ids = chordKeys.map((key) => chords[key].id);
    // console.log(ids);

    return chords
      .filter((chord) => chordOrder.includes(chord.id)) // Filter by custom chord types
      .sort(
        (a, b) => chordOrder.indexOf(a.id) - chordOrder.indexOf(b.id) // Sort based on custom order
      );
  }

  // For all keys, return grouped chords
  return Object.entries(chordsStore.chords).map(([key, chordList]) => ({
    key,
    chords: chordList,
  }));
});

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
    <!-- Chord list -->
    <div v-if="props.baseKey">
      <v-container max-width="1200px" fluid>
        <v-row dense>
          <v-col
            v-for="chord in filteredChords"
            :key="chord.id"
            cols="auto"
          >
            <ChordCard
              :key="chord.id"
              :base-key="props.baseKey"
              :chord="chord"
            />
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
              <ChordCard
                :key="chord.id"
                :base-key="chordGroup.key"
                :chord="chord"
              />
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chord-name {
  font-size: 1.3rem;
  font-weight: bold;
  text-align: center;
}
.hover-card {
  cursor: pointer;
  text-decoration: none;
}
</style>
