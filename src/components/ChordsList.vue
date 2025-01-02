<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useChordsStore } from "../stores/chordsStore";
import ListHeader from "./ListHeader.vue";
import ChordCard from "./ChordCard.vue";
import LoaderPiano from "./LoaderPiano.vue";

const props = defineProps({
  baseKey: {
    type: String,
    default: null, // If null, show all keys
  },
});

// Router and Store
const router = useRouter();
const chordsStore = useChordsStore();

// State: Loading indicator
const isLoading = ref(true);

// Computed: Filter chords directly from the store
const filteredChords = computed(() => {
  if (props.baseKey) {
    // For a specific baseKey, directly return the chords from the store
    return chordsStore.chords[props.baseKey] || [];
  }

  // For all keys, return the chords grouped by key
  return Object.entries(chordsStore.chords).map(([key, chordList]) => ({
    key,
    chords: chordList,
  }));
});

// Fetch chords from Pinia store (only fetch from Firestore if data is missing)
const ensureChordsLoaded = async () => {
  isLoading.value = true;
  if (props.baseKey) {
    if (!chordsStore.chords[props.baseKey]) {
      await chordsStore.fetchChordsForKey(props.baseKey); // Fetch only the specific key
    }
  } else {
    if (!chordsStore.allKeysLoaded) {
      await chordsStore.fetchAllChords(); // Fetch all chords if not already loaded
    }
  }
  isLoading.value = false;
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
    <LoaderPiano v-if="isLoading" />

    <!-- Chord list -->
    <div v-else-if="props.baseKey">
      <ListHeader pre="Chords in the key of" :title="props.baseKey" />

      <v-container max-width="1200px" fluid>
        <v-row dense>
          <v-col
            v-for="chord in filteredChords"
            :key="chord.id"
            cols="6" sm="4" md="3" lg="2"
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
        <ListHeader pre="Chords in the key of" :title="chordGroup.key" />
        <v-container max-width="1200px" fluid>
          <v-row dense>
            <v-col
              v-for="chord in chordGroup.chords"
              :key="chord.id"
              cols="6" sm="4" md="3" lg="2"
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
.chord-group {
  margin-top: 2rem;
}
</style>
