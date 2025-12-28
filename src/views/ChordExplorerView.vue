<template>
  <v-app>
    <!-- Hero Section: Introduction to the chord player -->
    <section class="hero-section">
      <v-row>
        <v-col cols="12" md="6" class="hero-text">
          <h1 class="hero-title">Welcome to the Chord Explorer</h1>
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
                <v-icon>mdi-close</v-icon>
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
              <div
                v-if="chord"
                class="chord-button-wrapper"
                :class="{
                  dragging: draggedBankIndex === bankIndex && draggedIndex === chordIndex,
                  'show-remove': longPressActiveBankIndex === bankIndex && longPressActiveChordIndex === chordIndex,
                }"
                draggable="true"
                @dragstart="handleDragStart(bankIndex, chordIndex, $event)"
                @dragover.prevent="handleDragOver(bankIndex, chordIndex, $event)"
                @dragleave="handleDragLeave(bankIndex, chordIndex, $event)"
                @drop="handleDrop(bankIndex, chordIndex, $event)"
                @dragend="handleDragEnd"
                @touchstart="handleTouchStart(bankIndex, chordIndex, $event)"
                @touchend="handleTouchEnd"
                @touchcancel="handleTouchEnd"
              >
                <!-- Drop indicator on the left side -->
                <div
                  v-if="
                    dragOverBankIndex === bankIndex &&
                    dragOverIndex === chordIndex &&
                    draggedIndex !== null &&
                    draggedIndex !== chordIndex &&
                    draggedIndex > chordIndex
                  "
                  class="drop-indicator drop-indicator-left"
                ></div>

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
                  class="remove-chord-btn"
                  @click.stop="removeChordFromSlot(bankIndex, chordIndex)"
                >
                  <v-icon size="x-small">mdi-close</v-icon>
                </v-btn>

                <!-- Drop indicator on the right side -->
                <div
                  v-if="
                    dragOverBankIndex === bankIndex &&
                    dragOverIndex === chordIndex &&
                    draggedIndex !== null &&
                    draggedIndex !== chordIndex &&
                    draggedIndex < chordIndex
                  "
                  class="drop-indicator drop-indicator-right"
                ></div>
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
            autofocus
            @update:model-value="handleChordSelection"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props" @click="handleChordSelection(item.raw.id)">
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
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Piano from '../components/Piano.vue'
import PianoControls from '../components/PianoControls.vue'
import { chordGroups } from '../utils/chordGroups'
import { useChordsStore } from '../stores/chordsStore'
import backgroundImage from '../assets/images/pexels-danielspase-734918.jpg'

const piano = ref<InstanceType<typeof Piano> | null>(null)
const currentChord = ref<any>(null)
const currentChordNotes = ref<string[]>([])
const isPlaying = ref(false)

const chordsStore = useChordsStore()

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

// Context menu state
const contextMenuOpen = ref(false)
const contextMenuLocation = ref<'top' | 'bottom' | 'start' | 'end'>('bottom')
const contextMenuActivator = ref<HTMLElement | null>(null)
const contextMenuBankIndex = ref<number | null>(null)
const contextMenuChordIndex = ref<number | null>(null)

// Long press detection for mobile
const longPressActiveBankIndex = ref<number | null>(null)
const longPressActiveChordIndex = ref<number | null>(null)
let touchTimer: ReturnType<typeof setTimeout> | null = null
const LONG_PRESS_DURATION = 500 // milliseconds

// Drag and drop state
const draggedIndex = ref<number | null>(null)
const draggedBankIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const dragOverBankIndex = ref<number | null>(null)

// Get responsive column count based on screen size
const getColumnsPerRow = () => {
  const width = window.innerWidth
  if (width < 480) return 4 // Small mobile
  return 6 // Tablet and desktop
}

// Clear long press state when clicking elsewhere
const handleDocumentClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  // Don't clear if clicking on the remove button or within a chord button wrapper
  if (!target.closest('.chord-button-wrapper') && !target.closest('.remove-chord-btn')) {
    longPressActiveBankIndex.value = null
    longPressActiveChordIndex.value = null
  }
}

// Load custom banks from localStorage on mount
onMounted(async () => {
  // Load all chords from Firebase for the autocomplete
  if (!chordsStore.allKeysLoaded || Object.keys(chordsStore.chords).length < 12) {
    await chordsStore.fetchAllChords(true)
  }

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

  // Add click listener to clear long press state
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  if (touchTimer) {
    clearTimeout(touchTimer)
  }
})

// Save custom banks to localStorage whenever they change
const saveCustomBanks = () => {
  localStorage.setItem('customChordBanks', JSON.stringify(customBanks.value))
}

// Flatten all chords for autocomplete - includes both static chordGroups and Firebase chords
const allChordsForSelect = computed(() => {
  const allChords: Array<{ id: string; label: string; notes: string[] }> = []

  // Add chords from static chordGroups
  chordGroups.forEach((section) => {
    section.chords.forEach((chord) => {
      allChords.push({
        id: `${section.title}-${chord.id}`,
        label: `${chord.id} (${section.title})`,
        notes: chord.notes,
      })
    })
  })

  // Add chords from Firebase (all keys and all chord types)
  const firebaseChords = chordsStore.chords
  if (firebaseChords && typeof firebaseChords === 'object') {
    Object.keys(firebaseChords).forEach((key) => {
      const chordsForKey = firebaseChords[key]
      if (Array.isArray(chordsForKey)) {
        chordsForKey.forEach((chord: any) => {
          if (chord && chord.id && chord.notes) {
            const chordLabel = `${key}${chord.id}`
            // Only add if not already in the list (avoid duplicates)
            const existingIndex = allChords.findIndex(
              (c) => c.label === chordLabel || c.label.startsWith(`${chord.id} (`),
            )
            if (existingIndex === -1) {
              allChords.push({
                id: `${key}-${chord.id}`,
                label: chordLabel,
                notes: chord.notes,
              })
            }
          }
        })
      }
    })
  }

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

// Handle chord selection from autocomplete
const handleChordSelection = (chordId: string | null) => {
  if (!chordId) return

  if (currentBankIndex.value === null || currentSlotIndex.value === null) return

  const chordData = allChordsForSelect.value.find((c) => c.id === chordId)
  if (!chordData) return

  const bank = customBanks.value[currentBankIndex.value]
  if (bank) {
    bank.chords[currentSlotIndex.value] = {
      id: chordData.label.split(' ')[0], // Just the chord name (e.g., "C")
      notes: chordData.notes,
    }
    saveCustomBanks()
  }

  // Close dialog and reset state
  chordSelectorOpen.value = false
  selectedChordForSlot.value = null
  currentBankIndex.value = null
  currentSlotIndex.value = null
}

// Remove chord from slot
const removeChordFromSlot = (bankIndex: number, slotIndex: number) => {
  // Clear long press state
  longPressActiveBankIndex.value = null
  longPressActiveChordIndex.value = null

  const bank = customBanks.value[bankIndex]
  if (bank) {
    bank.chords[slotIndex] = null
    saveCustomBanks()
  }
}


// Drag and drop handlers
const handleDragStart = (bankIndex: number, chordIndex: number, event: DragEvent) => {
  draggedBankIndex.value = bankIndex
  draggedIndex.value = chordIndex
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', '')
  }
}

const handleDragOver = (bankIndex: number, chordIndex: number, event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  event.preventDefault()

  // Only update drag over if it's a different item and in the same bank
  if (draggedBankIndex.value === bankIndex && draggedIndex.value !== chordIndex) {
    dragOverBankIndex.value = bankIndex
    dragOverIndex.value = chordIndex
  }
}

const handleDragLeave = (bankIndex: number, chordIndex: number, event: DragEvent) => {
  // Only clear if we're actually leaving the element (not just moving to a child)
  const relatedTarget = event.relatedTarget as HTMLElement
  const currentTarget = event.currentTarget as HTMLElement
  if (!relatedTarget || !currentTarget?.contains(relatedTarget)) {
    if (dragOverBankIndex.value === bankIndex && dragOverIndex.value === chordIndex) {
      dragOverIndex.value = null
      dragOverBankIndex.value = null
    }
  }
}

const handleDrop = (bankIndex: number, dropIndex: number, event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()

  if (
    draggedBankIndex.value === null ||
    draggedIndex.value === null ||
    draggedBankIndex.value !== bankIndex ||
    draggedIndex.value === dropIndex
  ) {
    dragOverIndex.value = null
    dragOverBankIndex.value = null
    return
  }

  const bank = customBanks.value[bankIndex]
  if (!bank) return

  const draggedChord = bank.chords[draggedIndex.value]

  // Remove the dragged item from its original position
  bank.chords.splice(draggedIndex.value, 1)

  // Calculate the new insertion index
  let insertIndex = dropIndex
  if (draggedIndex.value < dropIndex) {
    // If dragging down, adjust drop index since we removed an item
    insertIndex = dropIndex - 1
  }

  // Insert it at the new position
  bank.chords.splice(insertIndex, 0, draggedChord)

  saveCustomBanks()

  // Reset drag state
  dragOverIndex.value = null
  dragOverBankIndex.value = null
}

const handleDragEnd = () => {
  // Reset all drag state
  draggedIndex.value = null
  draggedBankIndex.value = null
  dragOverIndex.value = null
  dragOverBankIndex.value = null
}

// Long press handlers for mobile
const handleTouchStart = (bankIndex: number, chordIndex: number, event: TouchEvent) => {
  // Clear any existing timer
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  }

  // Start long press timer
  touchTimer = setTimeout(() => {
    longPressActiveBankIndex.value = bankIndex
    longPressActiveChordIndex.value = chordIndex
    touchTimer = null
  }, LONG_PRESS_DURATION)
}

const handleTouchEnd = () => {
  // Clear the timer if touch ends before long press duration
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  }
  // Note: We don't clear longPressActiveBankIndex/longPressActiveChordIndex here
  // They will be cleared when the user taps elsewhere or clicks the remove button
}

// Function to select a chord and play it
const selectChord = async (chord: any) => {
  // Clear long press state when playing a chord
  longPressActiveBankIndex.value = null
  longPressActiveChordIndex.value = null

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
  border-color: rgba(var(--v-theme-primary), 0.4) !important;
  color: rgba(var(--v-theme-primary), 0.7) !important;

  :deep(.v-btn__content) {
    color: rgba(var(--v-theme-primary), 0.7) !important;
  }

  :deep(.v-icon) {
    color: rgba(var(--v-theme-primary), 0.7) !important;
  }

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.7) !important;
    background-color: rgba(var(--v-theme-primary), 0.1);
    color: rgba(var(--v-theme-primary), 0.9) !important;

    :deep(.v-btn__content) {
      color: rgba(var(--v-theme-primary), 0.9) !important;
    }

    :deep(.v-icon) {
      color: rgba(var(--v-theme-primary), 0.9) !important;
    }
  }
}

.drop-indicator {
  width: 4px;
  background-color: rgba(var(--v-theme-primary), 0.8);
  border-radius: 2px;
  height: 100%;
  animation: pulse 1s ease-in-out infinite;
  position: absolute;
  top: 0;
  z-index: 5;
}

.drop-indicator-left {
  left: -6px;
}

.drop-indicator-right {
  right: -6px;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.chord-button-wrapper {
  position: relative;
  cursor: move;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;

  &:hover:not(.dragging) {
    transform: translateY(-2px);
  }

  &:active {
    cursor: grabbing;
  }

  &.dragging {
    opacity: 0.5;
    cursor: grabbing;
  }

  &.drag-over {
    border: 2px solid rgba(var(--v-theme-primary), 0.6);
    border-style: dashed;
    border-radius: 4px;
  }

  .remove-chord-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    background-color: rgba(var(--v-theme-surface), 0.9) !important;
    backdrop-filter: blur(4px);
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
    z-index: 10;
    min-width: 28px;
    width: 28px;
    height: 28px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    
    &:hover {
      opacity: 1;
      transform: scale(1.1);
      background-color: rgba(var(--v-theme-error), 0.1) !important;
    }
    
    &:active {
      transform: scale(0.95);
    }
  }

  &:hover:not(.dragging) .remove-chord-btn {
    opacity: 1;
  }
  
  // On mobile, only show on long-press
  @media (hover: none) and (pointer: coarse) {
    .remove-chord-btn {
      opacity: 0;
      min-width: 32px;
      width: 32px;
      height: 32px;
    }
    
    &.show-remove .remove-chord-btn {
      opacity: 1;
    }
    
    .remove-chord-btn:active {
      transform: scale(0.9);
    }
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
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
  color: rgba(var(--v-theme-primary), 0.8) !important;

  :deep(.v-btn__content) {
    color: rgba(var(--v-theme-primary), 0.8) !important;
  }

  :deep(.v-icon) {
    color: rgba(var(--v-theme-primary), 0.8) !important;
  }

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.8) !important;
    background-color: rgba(var(--v-theme-primary), 0.05);
    color: rgba(var(--v-theme-primary), 1) !important;

    :deep(.v-btn__content) {
      color: rgba(var(--v-theme-primary), 1) !important;
    }

    :deep(.v-icon) {
      color: rgba(var(--v-theme-primary), 1) !important;
    }
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
