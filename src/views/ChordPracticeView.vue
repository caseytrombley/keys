<template>
  <div class="chord-practice">
    <!-- Piano Component -->
    <div class="piano-container">
      <Piano ref="piano" :notes="currentChordNotes" @finish="onSampleFinish" />
    </div>

    <!-- Chord Selection Grid -->
    <div class="chord-grid">
      <v-container>
        <v-row>
          <v-col v-for="chord in commonChords" :key="chord.id" cols="6" sm="4" md="3">
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
import { useChordsStore } from '../stores/chordsStore';

const chordsStore = useChordsStore();
const piano = ref<InstanceType<typeof Piano> | null>(null);
const currentChord = ref<any>(null);
const currentChordNotes = ref<string[]>([]);
const isPlaying = ref(false);

// Common chords to practice
const commonChords = ref([
  { id: 'C', notes: ['C', 'E', 'G'] },
  { id: 'Cm', notes: ['C', 'Eb', 'G'] },
  { id: 'F', notes: ['F', 'A', 'C'] },
  { id: 'Fm', notes: ['F', 'Ab', 'C'] },
  { id: 'G', notes: ['G', 'B', 'D'] },
  { id: 'Gm', notes: ['G', 'Bb', 'D'] },
  { id: 'Am', notes: ['A', 'C', 'E'] },
  { id: 'Em', notes: ['E', 'G', 'B'] },
  { id: 'Dm', notes: ['D', 'F', 'A'] },
  { id: 'Bm', notes: ['B', 'D', 'F#'] },
  { id: 'A', notes: ['A', 'C#', 'E'] },
  { id: 'E', notes: ['E', 'G#', 'B'] },
]);

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

const onSampleFinish = () => {
  isPlaying.value = false;
};

onMounted(() => {
  currentChord.value = commonChords.value[0];
  currentChordNotes.value = commonChords.value[0].notes;
});
</script>

<style lang="scss" scoped>
.chord-practice {
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.piano-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.chord-grid {
  margin-top: 2rem;
}

/* Dark Theme */
.v-theme--dark {
  .chord-practice {
    background-color: rgba(var(--v-theme-primary), 0.1);
  }
}

/* Light Theme */
.v-theme--light {
  .chord-practice {
    background-color: rgba(var(--v-theme-primary), 0.05);
  }
}
</style> 