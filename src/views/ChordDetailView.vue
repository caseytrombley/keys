<template>
  <div :key="routeKey"> <!-- Add a dynamic key -->
    <KeyNav :activeKey="key" />
    <ChordHeader v-if="chordData" :chord="chordData" :baseKey="key" />

    <Piano v-if="chordData" ref="mainPiano" :notes="chordData.notes" @finish="onSampleFinish" />

    <div class="controls mt-3">
      <v-btn
        size="large"
        variant="flat"
        color="primary"
        @click="playMainSample"
        :disabled="isPlaying"
      >
        <v-icon
          icon="mdi-play-circle-outline"
          size="x-large"
          class="mr-1"
        ></v-icon>
        Play Sample
      </v-btn>
    </div>

    <!-- Navigation Buttons -->
    <div class="navigation-buttons">
      <v-btn
        size="x-large"
        variant="text"
        color="primary"
        @click="goToPreviousChord"
        :disabled="!previousChord"
      >
        <v-icon start>
          mdi-chevron-left
        </v-icon>
        <span v-if="previousChord">{{ key }}{{ previousChord?.id || "Previous" }}</span>
        <span v-else class="d-none">Previous</span>
      </v-btn>

      <v-btn
        size="x-large"
        variant="text"
        color="primary"
        @click="goToNextChord"
        :disabled="!nextChord"
      >
        <span v-if="nextChord">{{ key }}{{ nextChord?.id || "Next" }}</span>
        <span v-else class="d-none">Next</span>
        <v-icon end>
          mdi-chevron-right
        </v-icon>
      </v-btn>
    </div>


    <div v-if="chordData" class="detail-body">
      <v-container max-width="1200px" fluid>
        <v-row>
          <v-col v-for="(inversion, index) in inversions" :key="index">
            <div class="music-box">
              <div class="music-box-header">
                <InversionHeader :inversion="inversion" :title="`${index + 1}${getOrdinalSuffix(index + 1)} inversion`" />
              </div>
              <div class="music-box-piano">
                <Piano :ref="(el) => (inversionPianos[index] = el)" size="sm" :notes="inversion.notes" @finish="onSampleFinish" />
              </div>
              <div class="music-box-body mt-3">
                <v-btn
                  size="large"
                  @click="playInversionSample(index)"
                  :disabled="isPlaying"
                  variant="flat"
                  color="primary"
                >
                  <v-icon
                    icon="mdi-play-circle-outline"
                    size="x-large"
                    class="mr-1"
                  ></v-icon>
                  Play Sample
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useChordsStore } from "../stores/chordsStore";
import KeyNav from "../components/KeyNav.vue";
import ChordHeader from "../components/ChordHeader.vue";
import InversionHeader from "../components/InversionHeader.vue";
import Piano from "../components/Piano.vue";
import { getOrdinalSuffix } from "../utils/ordinal";

const chordsStore = useChordsStore();
const router = useRouter();

const route = useRoute();
const key = computed(() => route.params.key as string); // Reactive key
const chordId = computed(() => route.params.id as string); // Reactive chordId

const chordData = ref<any | null>(null);
const inversions = ref<any[]>([]);
const mainPiano = ref<InstanceType<typeof Piano> | null>(null);
const inversionPianos = ref<Array<InstanceType<typeof Piano>>>([]);
const isPlaying = ref(false);

// Correct dynamic routeKey to just use key and chordId properly
const routeKey = computed(() => `${key.value}-${chordId.value}`); // Keep the existing route key logic

// Reactive state for navigation
const hasPreviousChord = ref(false);
const hasNextChord = ref(false);

// Fetch chord data based on the route
const fetchChordData = async () => {
  // Clear previous data
  chordData.value = null;
  inversions.value = [];

  // Fetch chords for the specific key
  await chordsStore.fetchChordsForKey(key.value);
  const chords = chordsStore.chords[key.value];
  const chord = chords?.find((c: any) => `${key.value}${c.id}` === chordId.value); // Compare with concatenated ID (key + id)
  if (chord) {
    chordData.value = chord;
    await fetchInversions(chord.name); // Fetch inversions for the specific chord name
  } else {
    console.error("Chord not found");
  }

  updateNavigationState(); // Update navigation state after fetching data
};

const fetchInversions = async (chordName: string) => {
  await chordsStore.fetchInversionsForChord(chordName);
  inversions.value = chordsStore.inversions[chordName]?.inversions || [];
};

const playMainSample = () => {
  if (mainPiano.value) {
    isPlaying.value = true;
    mainPiano.value.playSample();
  }
};

const playInversionSample = (index: number) => {
  if (inversionPianos.value[index]) {
    isPlaying.value = true;
    inversionPianos.value[index].playSample();
  }
};

const onSampleFinish = () => {
  isPlaying.value = false;
};

// Navigation helpers
const updateNavigationState = () => {
  const chords = chordsStore.chords[key.value] || [];
  const currentIndex = chords.findIndex((c: any) => `${key.value}${c.id}` === chordId.value);

  hasPreviousChord.value = chords.length > 0 && currentIndex > 0;
  hasNextChord.value = chords.length > 0 && currentIndex < chords.length - 1;
};

const previousChord = computed(() => {
  const chords = chordsStore.chords[key.value] || [];
  const currentIndex = chords.findIndex((c: any) => `${key.value}${c.id}` === chordId.value);

  return currentIndex > 0 ? chords[currentIndex - 1] : null;
});

const nextChord = computed(() => {
  const chords = chordsStore.chords[key.value] || [];
  const currentIndex = chords.findIndex((c: any) => `${key.value}${c.id}` === chordId.value);

  return currentIndex < chords.length - 1 ? chords[currentIndex + 1] : null;
});

const goToPreviousChord = () => {
  if (previousChord.value) {
    router.push({
      name: "ChordDetail",
      params: { key: key.value, id: `${key.value}${previousChord.value.id}` }, // Concatenate key and id properly
    });
  }
};

const goToNextChord = () => {
  if (nextChord.value) {
    router.push({
      name: "ChordDetail",
      params: { key: key.value, id: `${key.value}${nextChord.value.id}` }, // Concatenate key and id properly
    });
  }
};

// Fetch chord data on initial mount
onMounted(() => {
  fetchChordData();
  // Reset isPlaying when navigating to a new page
  isPlaying.value = false;
});

// Watch route params for changes and fetch new chord data
watch(
  () => [key.value, chordId.value], // Watch both 'key' and 'id'
  () => {
    fetchChordData(); // Fetch chord data whenever either of the params change
    // Reset isPlaying when navigating to a new page
    isPlaying.value = false;
  }
);
</script>

<style lang="scss" scoped>
.detail-body {
  margin-top: 4rem;
  min-height: 40vh;
}
.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin: 2rem 0;
}
.music-box-body {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

/* Dark Theme */
.v-theme--dark {
  .detail-body {
    background-color: rgba(var(--v-theme-primary), 0.2);
  }
}

/* Light Theme */
.v-theme--light {
  .detail-body {
    background-color: rgba(var(--v-theme-primary), 0.1);

    //background-color: rgba(0,0,0, 0.05);
    //rgb(218 191 255)
  }
}
</style>
