<template>
  <div :key="routeKey"> <!-- Add a dynamic key -->
    <KeyNav :activeKey="key" />
    <ChordHeader v-if="chordData" :chord="chordData" :baseKey="key" />

    <Piano v-if="chordData" ref="mainPiano" :notes="chordData.notes" @finish="onSampleFinish" />

    <div class="controls">
      <v-btn variant="flat" color="primary" @click="playMainSample" :disabled="isPlaying">Play Sample</v-btn>

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
              <div class="music-box-body">
                <v-btn
                  @click="playInversionSample(index)"
                  :disabled="isPlaying"
                  variant="flat"
                  color="primary"
                >
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
import { useRoute } from "vue-router";
import { useChordsStore } from "../stores/chordsStore";
import KeyNav from "../components/KeyNav.vue";
import ChordHeader from "../components/ChordHeader.vue";
import InversionHeader from "../components/InversionHeader.vue";
import Piano from "../components/Piano.vue";
import { getOrdinalSuffix } from "../utils/ordinal";

const chordsStore = useChordsStore();

const route = useRoute();
const key = computed(() => route.params.key as string); // Reactive key
const chordId = computed(() => route.params.id as string); // Reactive chordId

const chordData = ref<any | null>(null);
const inversions = ref<any[]>([]);
const mainPiano = ref<InstanceType<typeof Piano> | null>(null);
const inversionPianos = ref<Array<InstanceType<typeof Piano>>>([]);
const isPlaying = ref(false);

// Dynamic routeKey forces Vue to re-render the entire page
const routeKey = computed(() => `${route.params.key}-${route.params.id}`);

// Fetch chord data based on the route
const fetchChordData = async () => {
  // Clear previous data
  chordData.value = null;
  inversions.value = [];

  // Fetch chords for the specific key
  await chordsStore.fetchChordsForKey(key.value);
  const chords = chordsStore.chords[key.value];
  const chord = chords?.find((c: any) => c.longName === chordId.value);
  if (chord) {
    chordData.value = chord;
    await fetchInversions(chord.name); // Fetch inversions for the specific chord name
  } else {
    console.error("Chord not found");
  }
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

// Fetch chord data on initial mount
onMounted(() => {
  fetchChordData();
});

// Watch route params for changes and fetch new chord data
watch(
  () => [key.value, chordId.value], // Watch both 'key' and 'id'
  () => {
    fetchChordData(); // Fetch chord data whenever either of the params change
  }
);
</script>


<style lang="scss" scoped>
.detail-body {
  margin-top: 4rem;
}
.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
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
    background-color: rgba(0,0,0, 0.05);
  }
}
</style>
