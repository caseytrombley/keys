<template>
  <v-app>
    <!-- Hero Section: Introduction to the chord player -->
    <section class="hero-section">
      <v-row>
        <v-col cols="12" md="6" class="hero-text">
          <h1 class="hero-title">Welcome to the Chord Player</h1>
          <p class="hero-description">
            Explore and play common piano chords with ease. Learn and practice major, minor, and more,
            all at your fingertips.
          </p>
        </v-col>
        <v-col>
          <v-img
            :src="backgroundImage"
            alt="Piano keys"
            height="auto"
            cover
          ></v-img>
        </v-col>
      </v-row>
    </section>

    <!-- Piano Section -->
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
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Piano from '../components/Piano.vue';
import { chordGroups } from '../utils/chordGroups';
import backgroundImage from '../assets/images/pexels-danielspase-734918.jpg';


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
.hero-section {
  //padding: 3rem 0;
  margin-bottom: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-container {
  max-width: 1200px;
  padding: 0 2rem;
}

.hero-text {
  padding: 3rem 3rem 3rem 4rem;
  color: white;
  text-align: left;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.hero-description {
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.5;
}

/* Piano Container Styling */
.piano-container {
  display: flex;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 0 0 .25rem;
}

/* Chord Grid Styling */
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

/* Dark Theme Styling */
.v-theme--dark {
  .chord-practice {
    background-color: rgba(var(--v-theme-primary), 0.1);
  }
  .hero-section {
    background: #231e2a;
  }
  .hero-title {
    background: linear-gradient(to right, #bb86fc, #bfe9ff);
    -webkit-background-clip: text;
    color: transparent;
  }
  .piano-container {
    background: #121212;
  }
}

/* Light Theme Styling */
.v-theme--light {
  .chord-practice {
    background-color: rgba(var(--v-theme-primary), 0.05);
  }
  .hero-section {
    background: #231e2a;
  }
  .hero-title {
    background: linear-gradient(to right, #bb86fc, #bfe9ff);
    -webkit-background-clip: text;
    color: transparent;

  }
  .piano-container {
    background: #fff6e9;
  }
}
</style>
