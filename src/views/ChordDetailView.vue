<template>
  <div :key="routeKey">
    <KeyNav :activeKey="key" :collapsible="true" />
    
    <!-- Piano Controls - Under KeyNav -->
    <PianoControls />

    <ChordHeader v-if="chordData" ref="chordHeaderRef" :chord="chordData" :baseKey="key" />

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
                <!-- Multiple Piano instances - all use the same controls from Pinia -->
                <Piano
                  :ref="(el) => {
                    if (el) {
                      inversionPianos[index] = el as InstanceType<typeof Piano>;
                    }
                  }"
                  size="sm"
                  :notes="inversion.notes"
                  @finish="onSampleFinish"
                />
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
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useChordsStore } from "../stores/chordsStore";
import KeyNav from "../components/KeyNav.vue";
import ChordHeader from "../components/ChordHeader.vue";
import InversionHeader from "../components/InversionHeader.vue";
import Piano from "../components/Piano.vue";
import PianoControls from "../components/PianoControls.vue"; // Import the new controls component
import { getOrdinalSuffix } from "../utils/ordinal";

const chordsStore = useChordsStore();
const router = useRouter();

const route = useRoute();
const key = computed(() => route.params.key as string);
const chordId = computed(() => route.params.id as string);

const chordData = ref<any | null>(null);
const inversions = ref<any[]>([]);
const mainPiano = ref<InstanceType<typeof Piano> | null>(null);
const inversionPianos = ref<(InstanceType<typeof Piano> | null)[]>([]);
const chordHeaderRef = ref<InstanceType<typeof ChordHeader> | null>(null);

const isPlaying = ref(false);

const routeKey = computed(() => `${key.value}-${chordId.value}`);

const hasPreviousChord = ref(false);
const hasNextChord = ref(false);

const fetchChordData = async () => {
  chordData.value = null;
  inversions.value = [];

  await chordsStore.fetchChordsForKey(key.value);
  const chords = chordsStore.chords[key.value];
  const chord = chords?.find((c: any) => `${key.value}${c.id}` === chordId.value);
  if (chord) {
    chordData.value = chord;
    await fetchInversions(chord.name);
  } else {
    console.error("Chord not found");
  }

  updateNavigationState();
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

const scrollToChordHeader = async () => {
  await nextTick();
  // Wait a bit more for DOM to fully render
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // Find the header element by ID
  const headerElement = document.getElementById('chord-header-anchor');
  
  if (headerElement) {
    const headerRect = headerElement.getBoundingClientRect();
    const scrollOffset = headerRect.top + window.scrollY - 20; // 20px offset from top
    window.scrollTo({ top: Math.max(0, scrollOffset), behavior: 'smooth' });
  }
};

const goToPreviousChord = async () => {
  if (previousChord.value) {
    await router.push({
      name: "ChordDetail",
      params: { key: key.value, id: `${key.value}${previousChord.value.id}` },
    });
    await scrollToChordHeader();
  }
};

const goToNextChord = async () => {
  if (nextChord.value) {
    await router.push({
      name: "ChordDetail",
      params: { key: key.value, id: `${key.value}${nextChord.value.id}` },
    });
    await scrollToChordHeader();
  }
};

// Keyboard navigation handler
const handleKeyboardNavigation = (event: KeyboardEvent) => {
  // Only handle if not typing in an input
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return;
  }
  
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    goToPreviousChord();
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    goToNextChord();
  }
};

onMounted(() => {
  fetchChordData();
  isPlaying.value = false;
  // Add keyboard event listener
  window.addEventListener('keydown', handleKeyboardNavigation);
  // Scroll to header after initial load
  nextTick(() => {
    scrollToChordHeader();
  });
});

onUnmounted(() => {
  // Remove keyboard event listener
  window.removeEventListener('keydown', handleKeyboardNavigation);
});

watch(
  () => [key.value, chordId.value],
  async () => {
    fetchChordData();
    isPlaying.value = false;
    // Scroll to header when route changes
    await nextTick();
    scrollToChordHeader();
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
  }
}
</style>
