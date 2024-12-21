<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useChordsStore } from "../stores/chordsStore";
import KeyNav from "../components/KeyNav.vue";
import PageHeader from "../components/PageHeader.vue";
import Piano from "../components/Piano.vue";
import { getOrdinalSuffix } from "../utils/ordinal";

const chordsStore = useChordsStore();

const route = useRoute();
const key = route.params.key as string;
const chordId = route.params.id as string;

const chordData = ref<any | null>(null);
const inversions = ref<any[]>([]);
const mainPiano = ref<InstanceType<typeof Piano> | null>(null);
const inversionPianos = ref<Array<InstanceType<typeof Piano>>>([]);
const isPlaying = ref(false);

const fetchChordData = async () => {
  await chordsStore.fetchChordsForKey(key);
  const chords = chordsStore.chords[key];
  const chord = chords?.find((c: any) => c.id === chordId);
  if (chord) {
    chordData.value = chord;
    await fetchInversions(chord.name); // Fetch inversions for the specific chord name
  } else {
    console.error("Chord not found");
  }
};

const fetchInversions = async (chordName: string) => {
  await chordsStore.fetchInversionsForChord(chordName); // Use chord name, not id
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

onMounted(() => {
  fetchChordData();
});
</script>


<template>
  <KeyNav :activeKey="key" />
  <PageHeader :title="chordData?.longName" class="pb-2">
    <v-btn variant="flat" color="primary" @click="playMainSample" :disabled="isPlaying">Play Sample</v-btn>
  </PageHeader>

  <Piano v-if="chordData" ref="mainPiano" :notes="chordData.notes" @finish="onSampleFinish" />

  <div v-if="chordData" class="detail-body">
    <v-container max-width="1200px" fluid>
      <div class="details">
        <h2>{{ chordData.longName }}</h2>
        <div class="detail-facts">
          <p>Notes: {{ chordData.notes.join(", ") }}</p>
          <p>Intervals: {{ chordData.intervals.join(", ") }}</p>
        </div>
      </div>

      <v-row>
        <v-col v-for="(inversion, index) in inversions" :key="index">
          <div class="music-box">
            <div class="music-box-header">
              <div class="music-box-title">
                {{ `${index + 1}${getOrdinalSuffix(index + 1)} inversion` }}
              </div>
            </div>
            <div class="music-box-body">
              <div class="info">Notes: {{ inversion.notes.join(", ") }}</div>
              <div class="action">
                <v-btn @click="playInversionSample(index)" :disabled="isPlaying">Play</v-btn>
              </div>
            </div>
            <div class="music-box-piano">
              <Piano :ref="(el) => (inversionPianos[index] = el)" size="sm" :notes="inversion.notes" @finish="onSampleFinish" />
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>


<style lang="scss" scoped>
.detail-body {
  margin-top: 4rem;
  min-height: 50vh;
  background-color: rgba(var(--v-theme-primary), 0.2);
}
</style>
