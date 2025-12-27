<template>
  <v-app>
    <!-- Hero Section: Introduction to the chord player -->
    <section class="hero-section">
      <v-row>
        <v-col cols="12" md="6" class="hero-text">
          <h1 class="hero-title">Welcome to the Chord Player</h1>
          <p class="hero-description">
            Explore and play common piano chords with ease. Learn and practice major, minor, and
            more, all at your fingertips.
          </p>
        </v-col>
        <v-col>
          <v-img :src="backgroundImage" alt="Piano keys" height="auto" cover></v-img>
        </v-col>
      </v-row>
    </section>

    <!-- Piano Controls (not sticky) -->
    <div class="piano-controls-wrapper">
      <PianoControls :hide-tempo="true" />
    </div>

    <!-- Piano Section (sticky) -->
    <div class="piano-sticky-wrapper">
      <Piano ref="piano" :notes="currentChordNotes" @finish="onSampleFinish" />
    </div>

    <div class="chord-practice">
      <div class="chord-grid">
        <v-container>
          <!-- Custom Chord Banks -->
          <v-row v-for="(bank, bankIndex) in customBanks" :key="`custom-${bankIndex}`">
            <v-col cols="12" class="d-flex align-center justify-space-between">
              <div class="d-flex align-center gap-2" style="flex: 1">
                <v-text-field
                  v-model="bank.title"
                  variant="plain"
                  density="compact"
                  hide-details
                  class="bank-title-input"
                  @blur="saveCustomBanks"
                  @keyup.enter="saveCustomBanks"
                ></v-text-field>
              </div>
              <v-btn
                icon
                size="small"
                variant="text"
                color="error"
                @click="removeCustomBank(bankIndex)"
                class="ml-2"
              >
                <v-icon>mdi-delete-outline</v-icon>
              </v-btn>
            </v-col>
            <v-col
              v-for="(chord, chordIndex) in bank.chords"
              :key="`custom-${bankIndex}-${chordIndex}`"
              class="col"
              cols="3"
              sm="3"
              md="2"
            >
              <div v-if="chord" class="chord-button-wrapper">
                <v-btn
                  block
                  size="large"
                  variant="flat"
                  :color="
                    isPlaying &&
                    currentChord?.id === chord.id &&
                    currentChord?.notes?.join(',') === chord.notes.join(',')
                      ? 'primary'
                      : 'secondary'
                  "
                  @click="selectChord(chord)"
                  class="chord-btn"
                >
                  {{ chord.id }}
                </v-btn>
                <v-btn
                  icon
                  size="x-small"
                  variant="text"
                  color="error"
                  class="remove-chord-slot-btn"
                  @click="removeChordFromSlot(bankIndex, chordIndex)"
                >
                  <v-icon size="x-small">mdi-close</v-icon>
                </v-btn>
              </div>
              <v-btn
                v-else
                block
                size="large"
                variant="outlined"
                class="empty-chord-btn"
                @click="openChordSelector(bankIndex, chordIndex)"
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-col>
            <!-- Add slot button at the end of each row -->
            <v-col class="col" cols="3" sm="3" md="2">
              <v-btn
                block
                size="large"
                variant="outlined"
                class="add-slot-btn"
                @click="addSlotToBank(bankIndex)"
              >
                <v-icon>mdi-plus-circle-outline</v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <!-- Add New Bank Row Button -->
          <v-row>
            <v-col cols="12">
              <v-btn block variant="outlined" class="add-bank-row-btn" @click="addNewBankRow">
                <v-icon start>mdi-plus</v-icon>
                Add Custom Bank
              </v-btn>
            </v-col>
          </v-row>

          <!-- Iterate over each chord section (Major Chords, Major 7th, etc.) -->
          <v-row v-for="(section, sectionIndex) in chordGroups" :key="sectionIndex">
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

    <!-- Chord Selector Dialog -->
    <v-dialog v-model="chordSelectorOpen" max-width="600">
      <v-card>
        <v-card-title>
          <span class="text-h5">Select a Chord</span>
        </v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="selectedChordForSlot"
            :items="allChordsForSelect"
            item-title="label"
            item-value="id"
            label="Search chords"
            variant="outlined"
            clearable
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-icon>mdi-music-note</v-icon>
                </template>
                <v-list-item-title>{{ item.raw.label }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.raw.notes.join(', ') }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="chordSelectorOpen = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="addChordToSlot"
            :disabled="!selectedChordForSlot"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Piano from '../components/Piano.vue'
import PianoControls from '../components/PianoControls.vue'
import { chordGroups } from '../utils/chordGroups'
import backgroundImage from '../assets/images/pexels-danielspase-734918.jpg'

const piano = ref<InstanceType<typeof Piano> | null>(null)
const currentChord = ref<any>(null)
const currentChordNotes = ref<string[]>([])
const isPlaying = ref(false)

// Custom banks state
interface CustomBank {
  title: string
  chords: Array<{ id: string; notes: string[] } | null>
}

const customBanks = ref<CustomBank[]>([])
const chordSelectorOpen = ref(false)
const selectedChordForSlot = ref<string | null>(null)
const currentBankIndex = ref<number | null>(null)
const currentSlotIndex = ref<number | null>(null)

// Get responsive column count based on screen size
const getColumnsPerRow = () => {
  const width = window.innerWidth
  if (width < 480) return 4 // Small mobile
  return 6 // Tablet and desktop
}

// Load custom banks from localStorage on mount
onMounted(() => {
  const savedBanks = localStorage.getItem('customChordBanks')
  if (savedBanks) {
    try {
      customBanks.value = JSON.parse(savedBanks)
    } catch (e) {
      console.error('Failed to load custom banks:', e)
    }
  }

  // Set initial chord
  currentChord.value = chordGroups[0].chords[0]
  currentChordNotes.value = chordGroups[0].chords[0].notes
})

// Save custom banks to localStorage whenever they change
const saveCustomBanks = () => {
  localStorage.setItem('customChordBanks', JSON.stringify(customBanks.value))
}

// Flatten all chords for autocomplete
const allChordsForSelect = computed(() => {
  const allChords: Array<{ id: string; label: string; notes: string[] }> = []
  chordGroups.forEach((section) => {
    section.chords.forEach((chord) => {
      allChords.push({
        id: `${section.title}-${chord.id}`,
        label: `${chord.id} (${section.title})`,
        notes: chord.notes,
      })
    })
  })
  return allChords
})

// Add new bank row - start with responsive number of slots
const addNewBankRow = () => {
  const initialSlots = getColumnsPerRow()
  customBanks.value.push({
    title: `Custom Bank ${customBanks.value.length + 1}`,
    chords: new Array(initialSlots).fill(null),
  })
  saveCustomBanks()
}

// Add a new empty slot to a bank
const addSlotToBank = (bankIndex: number) => {
  const bank = customBanks.value[bankIndex]
  if (bank) {
    bank.chords.push(null)
    saveCustomBanks()
  }
}

// Remove custom bank row
const removeCustomBank = (index: number) => {
  customBanks.value.splice(index, 1)
  saveCustomBanks()
}

// Open chord selector for a slot
const openChordSelector = (bankIndex: number, slotIndex: number) => {
  currentBankIndex.value = bankIndex
  currentSlotIndex.value = slotIndex
  selectedChordForSlot.value = null
  chordSelectorOpen.value = true
}

// Add chord to slot
const addChordToSlot = () => {
  if (
    currentBankIndex.value === null ||
    currentSlotIndex.value === null ||
    !selectedChordForSlot.value
  )
    return

  const chordData = allChordsForSelect.value.find((c) => c.id === selectedChordForSlot.value)
  if (!chordData) return

  const bank = customBanks.value[currentBankIndex.value]
  if (bank) {
    bank.chords[currentSlotIndex.value] = {
      id: chordData.label.split(' ')[0], // Just the chord name (e.g., "C")
      notes: chordData.notes,
    }
    saveCustomBanks()
  }

  chordSelectorOpen.value = false
  selectedChordForSlot.value = null
  currentBankIndex.value = null
  currentSlotIndex.value = null
}

// Remove chord from slot
const removeChordFromSlot = (bankIndex: number, slotIndex: number) => {
  const bank = customBanks.value[bankIndex]
  if (bank) {
    bank.chords[slotIndex] = null
    saveCustomBanks()
  }
}

// Function to select a chord and play it
const selectChord = async (chord: any) => {
  currentChordNotes.value = chord.notes
  currentChord.value = chord

  // Small delay to ensure Vue has updated the props
  await new Promise((resolve) => setTimeout(resolve, 0))

  if (piano.value) {
    piano.value.playChordOnly()
    isPlaying.value = true
  }
}

// Reset after the sample finishes playing
const onSampleFinish = () => {
  isPlaying.value = false
}
</script>

<style lang="scss" scoped>
.empty-chord-btn {
  border-style: dashed !important;
  border-width: 2px !important;
  min-height: 48px;

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.5) !important;
    background-color: rgba(var(--v-theme-primary), 0.05);
  }
}

.add-slot-btn {
  border-style: dashed !important;
  border-width: 2px !important;
  min-height: 48px;
  border-color: rgba(var(--v-theme-primary), 0.3) !important;

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.6) !important;
    background-color: rgba(var(--v-theme-primary), 0.1);
  }
}

.chord-button-wrapper {
  position: relative;

  .remove-chord-slot-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: rgba(var(--v-theme-surface), 1) !important;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 10;
  }

  &:hover .remove-chord-slot-btn {
    opacity: 1;
  }
}

.bank-title-input {
  :deep(.v-field__input) {
    padding: 0;
    min-height: auto;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.5;
  }

  :deep(.v-field) {
    padding: 0;
    min-height: auto;
  }

  :deep(.v-field__field) {
    padding: 0;
    min-height: auto;
  }

  :deep(.v-input__control) {
    min-height: auto;
  }
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.add-bank-row-btn {
  border-style: dashed !important;
  border-width: 2px !important;
  margin: 0.5rem 0 2rem 0;
  min-height: 56px;

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.5) !important;
    background-color: rgba(var(--v-theme-primary), 0.05);
  }
}

.hero-section {
  //padding: 3rem 0;
  margin-bottom: 1rem;
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

/* Piano Controls Wrapper */
.piano-controls-wrapper {
  margin-bottom: 1.5rem;
}

/* Piano Sticky Wrapper */
.piano-sticky-wrapper {
  position: sticky;
  top: 0;
  z-index: 1000;
  margin-bottom: 1rem;
  background-color: transparent;
}

/* Chord Grid Styling */
.chord-practice {
  display: flex;
  flex-direction: column;
  margin-top: 0;
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
    padding: 0.25rem;
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
  .piano-sticky-wrapper {
    background-color: rgba(18, 18, 18, 0.8);
    backdrop-filter: blur(10px);
  }
}

/* Light Theme Styling */
.v-theme--light {
  .chord-practice {
    background-color: rgba(var(--v-theme-primary), 0.05);
  }
  .hero-section {
    background: #342c1f;
  }
  .hero-title {
    background: linear-gradient(to right, #ff9b00, #bfe9ff);
    -webkit-background-clip: text;
    color: transparent;
  }
  .piano-sticky-wrapper {
    background-color: rgba(255, 246, 233, 0.8);
    backdrop-filter: blur(10px);
  }
}
</style>
