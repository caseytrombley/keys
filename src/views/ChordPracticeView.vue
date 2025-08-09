<template>
  <div class="piano-container">
    <Piano ref="piano" :notes="currentChordNotes" @finish="onSampleFinish" />
  </div>
  <div class="chord-practice">
    <div class="chord-grid">
      <v-container>
        <!-- Iterate over each chord section (Major Chords, Major 7th, etc.) -->
        <v-row
          v-for="(section, sectionIndex) in chordGroups"
          :key="sectionIndex"
        >
          <!-- Section title -->
          <v-col cols="12">
            <h3>{{ section.title }}</h3>
          </v-col>

          <!-- Iterate over the chords within the section -->
          <v-col
            v-for="chord in section.chords"
            :key="chord.id"
            class="col"
            cols="3"
            sm="3"
            md="2"
          >
            <v-btn
              block
              size="large"
              variant="flat"
              :color="isPlaying && currentChord?.id === chord.id ? 'primary' : 'secondary'"
              @click="selectChord(chord)"
            >
              {{ chord.id }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Piano from '../components/Piano.vue';
import { chordGroups } from '../utils/chordGroups';

const piano = ref<InstanceType<typeof Piano> | null>(null);
const currentChord = ref<any>(null);
const currentChordNotes = ref<string[]>([]);
const isPlaying = ref(false);

// Function to select a chord and play it
const selectChord = async (chord: any) => {
  currentChordNotes.value = chord.notes;
  currentChord.value = chord;

  // Small delay to ensure Vue has updated the props
  await new Promise(resolve => setTimeout(resolve, 0));

  if (piano.value) {
    piano.value.playChordOnly();
    isPlaying.value = true;
  }
};

// Reset after the sample finishes playing
const onSampleFinish = () => {
  isPlaying.value = false;
};

// Set initial chord
onMounted(() => {
  currentChord.value = chordGroups[0].chords[0];
  currentChordNotes.value = chordGroups[0].chords[0].notes;
});
</script>

<style lang="scss" scoped>
.piano-container {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.chord-practice {
  display: flex;
  flex-direction: column;
  margin-top: 4rem;
  min-height: 100vh;
}

.chord-grid {
  gap: 1rem;
  margin-top: 1rem;
  @media (min-width: 480px) {
    padding: 2rem;
    gap: 2rem;
  }
  .col {
    padding: .25rem;
  }
}

.v-theme--dark .chord-practice {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.v-theme--light .chord-practice {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>
