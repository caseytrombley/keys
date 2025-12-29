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
      <PianoControls />
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
            <v-col cols="12">
              <div class="custom-bank-header">
                <div class="d-flex align-center gap-2" style="flex: 1">
                  <v-text-field
                    v-if="editingCustomBanks.has(bankIndex)"
                    v-model="bank.title"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="bank-title-input bank-title-input-editing"
                    @blur="saveCustomBanks"
                    @keyup.enter="saveCustomBanks"
                    placeholder="Bank title"
                  ></v-text-field>
                  <div
                    v-else
                    class="bank-title-display"
                    @click="toggleEditCustomBank(bankIndex)"
                  >
                    {{ bank.title || 'Untitled Bank' }}
                  </div>
                </div>
                <div class="custom-bank-controls">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    :color="playingCustomBankIndex === bankIndex ? 'primary' : 'default'"
                    @click="toggleCustomBankPlayback(bankIndex)"
                    class="play-bank-btn"
                  >
                    <v-icon>
                      {{ playingCustomBankIndex === bankIndex ? 'mdi-pause' : 'mdi-play' }}
                    </v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    :color="isLoopingCustomBank && playingCustomBankIndex === bankIndex ? 'primary' : 'default'"
                    @click="toggleCustomBankLoop(bankIndex)"
                    class="loop-bank-btn"
                  >
                    <v-icon>mdi-repeat</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    :color="editingCustomBanks.has(bankIndex) ? 'primary' : 'default'"
                    @click="toggleEditCustomBank(bankIndex)"
                    class="edit-bank-btn"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="editingCustomBanks.has(bankIndex)"
                    icon
                    size="small"
                    variant="text"
                    color="error"
                    @click="confirmDeleteBank(bankIndex)"
                    class="delete-bank-btn"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>
              </div>
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
                }"
                draggable="true"
                @dragstart="handleDragStart(bankIndex, chordIndex, $event)"
                @dragover.prevent="handleDragOver(bankIndex, chordIndex, $event)"
                @dragleave="handleDragLeave(bankIndex, chordIndex, $event)"
                @drop="handleDrop(bankIndex, chordIndex, $event)"
                @dragend="handleDragEnd"
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
                    activeButtonId === `custom-${bankIndex}-${chordIndex}` &&
                    currentChord?.id === chord.id &&
                    currentChord?.notes?.join(',') === chord.notes.join(',')
                      ? 'primary'
                      : 'secondary'
                  "
                  @touchstart="preStartAudio()"
                  @mousedown="preStartAudio()"
                  @click.stop="selectChord(chord, `custom-${bankIndex}-${chordIndex}`)"
                  class="chord-btn"
                >
                  {{ chord.id }}
                </v-btn>
                <v-btn
                  v-if="editingCustomBanks.has(bankIndex)"
                  icon
                  size="x-small"
                  variant="text"
                  color="error"
                  class="remove-chord-btn"
                  @click.stop="removeChordFromSlot(bankIndex, chordIndex, $event)"
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
                v-else-if="editingCustomBanks.has(bankIndex)"
                block
                size="large"
                variant="outlined"
                class="empty-chord-btn"
                @click="openChordSelector(bankIndex, chordIndex)"
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-col>
            <!-- Add slot button at the end of each row (only in edit mode) -->
            <v-col v-if="editingCustomBanks.has(bankIndex)" class="col" cols="3" sm="3" md="2">
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
            <!-- Section title with controls -->
            <v-col cols="12">
              <div class="section-header">
                <h3>{{ section.title }}</h3>
                <div class="section-controls">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    :color="playingSectionIndex === sectionIndex ? 'primary' : 'default'"
                    @click="toggleSectionPlayback(sectionIndex)"
                    class="play-section-btn"
                  >
                    <v-icon>
                      {{ playingSectionIndex === sectionIndex ? 'mdi-pause' : 'mdi-play' }}
                    </v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    :color="isLooping && playingSectionIndex === sectionIndex ? 'primary' : 'default'"
                    @click="toggleLoop(sectionIndex)"
                    class="loop-section-btn"
                  >
                    <v-icon>mdi-repeat</v-icon>
                  </v-btn>
                </div>
              </div>
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
                :color="
                  isPlaying &&
                  activeButtonId === `regular-${sectionIndex}-${chord.id}` &&
                  currentChord?.id === chord.id &&
                  currentChord?.notes?.join(',') === chord.notes.join(',')
                    ? 'primary'
                    : 'secondary'
                "
                @touchstart="preStartAudio()"
                @mousedown="preStartAudio()"
                @click.stop="selectChord(chord, `regular-${sectionIndex}-${chord.id}`)"
              >
                {{ chord.id }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>

    <!-- Delete Bank Confirmation Dialog -->
    <v-dialog v-model="deleteBankDialogOpen" max-width="400" persistent>
      <v-card class="delete-confirm-dialog">
        <v-card-title class="dialog-title">
          <v-icon color="error" size="large" class="mr-2">mdi-alert-circle</v-icon>
          <span>Delete Bank?</span>
        </v-card-title>
        <v-card-text class="dialog-content">
          <p>Are you sure you want to delete "{{ bankToDelete?.title || 'this bank' }}"?</p>
          <p class="dialog-warning">This action cannot be undone.</p>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="deleteBankDialogOpen = false"
            class="cancel-btn"
          >
            Cancel
          </v-btn>
          <v-btn
            variant="flat"
            color="error"
            @click="confirmDeleteBankAction"
            class="confirm-btn"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { usePianoStore } from '../stores/pianoStore'
import { chordGroups } from '../utils/chordGroups'
import { useChordsStore } from '../stores/chordsStore'
import backgroundImage from '../assets/images/pexels-danielspase-734918.jpg'

const piano = ref<InstanceType<typeof Piano> | null>(null)
const currentChord = ref<any>(null)
const currentChordNotes = ref<string[]>([])
const isPlaying = ref(false)
const activeButtonId = ref<string | null>(null) // Track which specific button is active

const chordsStore = useChordsStore()
const pianoStore = usePianoStore()

// Section playback state
const playingSectionIndex = ref<number | null>(null)
const isLooping = ref<boolean>(false)
const sectionPlaybackTimeout = ref<number | null>(null)

// Custom bank playback and edit state
const playingCustomBankIndex = ref<number | null>(null)
const isLoopingCustomBank = ref<boolean>(false)
const customBankPlaybackTimeout = ref<number | null>(null)
const editingCustomBanks = ref<Set<number>>(new Set())

// Delete bank confirmation dialog
const deleteBankDialogOpen = ref(false)
const bankToDelete = ref<{ index: number; title: string } | null>(null)

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
})

onUnmounted(() => {
  // Cleanup section playback
  if (sectionPlaybackTimeout.value !== null) {
    clearTimeout(sectionPlaybackTimeout.value)
    sectionPlaybackTimeout.value = null
  }
  // Cleanup custom bank playback
  if (customBankPlaybackTimeout.value !== null) {
    clearTimeout(customBankPlaybackTimeout.value)
    customBankPlaybackTimeout.value = null
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

// Show delete confirmation dialog
const confirmDeleteBank = (index: number) => {
  const bank = customBanks.value[index]
  if (bank) {
    bankToDelete.value = { index, title: bank.title }
    deleteBankDialogOpen.value = true
  }
}

// Confirm and delete bank
const confirmDeleteBankAction = () => {
  if (bankToDelete.value !== null) {
    customBanks.value.splice(bankToDelete.value.index, 1)
    saveCustomBanks()
    deleteBankDialogOpen.value = false
    bankToDelete.value = null
  }
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
const removeChordFromSlot = (bankIndex: number, slotIndex: number, event?: Event) => {
  // Stop event propagation to prevent chord from playing
  if (event) {
    event.stopPropagation()
  }

  const bank = customBanks.value[bankIndex]
  if (bank && bank.chords[slotIndex] !== null) {
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

// Pre-start audio context on touch/mouse down for instant playback
const preStartAudio = () => {
  // Start audio context immediately on touch/mousedown (before click)
  if (piano.value && typeof (piano.value as any).preStartAudioContext === 'function') {
    ;(piano.value as any).preStartAudioContext()
  }
}

// Function to select a chord and play it
const selectChord = (chord: any, buttonId: string) => {
  // Set the active button ID so only this specific button highlights
  activeButtonId.value = buttonId

  // Update state (for visual feedback)
  currentChordNotes.value = chord.notes
  currentChord.value = chord
  isPlaying.value = true

  // Play immediately with direct notes - no waiting for Vue reactivity
  if (piano.value && typeof (piano.value as any).playChordDirect === 'function') {
    ;(piano.value as any).playChordDirect(chord.notes)
  } else if (piano.value) {
    // Fallback to props-based method if direct method not available
    piano.value.playChordOnly()
  }
}

// Reset after the sample finishes playing
const onSampleFinish = () => {
  isPlaying.value = false
}

// Play through all chords in a section
const playSectionChords = async (sectionIndex: number) => {
  const section = chordGroups[sectionIndex]
  if (!section || !section.chords || section.chords.length === 0) return

  let currentChordIndex = 0

  const playNextChord = async () => {
    // Check if we should still be playing
    if (playingSectionIndex.value !== sectionIndex) {
      return
    }

    const chord = section.chords[currentChordIndex]
    if (!chord) {
      // If looping, start over
      if (isLooping.value && playingSectionIndex.value === sectionIndex) {
        currentChordIndex = 0
        await playNextChord()
      } else {
        // Stop playback
        playingSectionIndex.value = null
        isLooping.value = false
      }
      return
    }

    // Play the chord
    const buttonId = `regular-${sectionIndex}-${chord.id}`
    selectChord(chord, buttonId)

    // Calculate delay based on tempo (play each chord for 2 beats)
    const quarterNoteMs = (60 / pianoStore.tempo) * 1000
    const delay = quarterNoteMs * 2

    // Wait for the chord to finish, then play next
    sectionPlaybackTimeout.value = setTimeout(async () => {
      currentChordIndex++
      await playNextChord()
    }, delay) as unknown as number
  }

  // Start playing
  await playNextChord()
}

// Toggle section playback
const toggleSectionPlayback = (sectionIndex: number) => {
  if (playingSectionIndex.value === sectionIndex) {
    // Stop playback
    if (sectionPlaybackTimeout.value !== null) {
      clearTimeout(sectionPlaybackTimeout.value)
      sectionPlaybackTimeout.value = null
    }
    playingSectionIndex.value = null
    isLooping.value = false
  } else {
    // Stop any other playback that might be playing
    if (sectionPlaybackTimeout.value !== null) {
      clearTimeout(sectionPlaybackTimeout.value)
      sectionPlaybackTimeout.value = null
    }
    if (customBankPlaybackTimeout.value !== null) {
      clearTimeout(customBankPlaybackTimeout.value)
      customBankPlaybackTimeout.value = null
    }
    playingCustomBankIndex.value = null
    // Start playing this section
    playingSectionIndex.value = sectionIndex
    playSectionChords(sectionIndex)
  }
}

// Toggle loop for section
const toggleLoop = (sectionIndex: number) => {
  if (playingSectionIndex.value === sectionIndex) {
    // Toggle loop for currently playing section
    isLooping.value = !isLooping.value
  } else {
    // Start playing with loop enabled
    isLooping.value = true
    toggleSectionPlayback(sectionIndex)
  }
}

// Play through all chords in a custom bank
const playCustomBankChords = async (bankIndex: number) => {
  const bank = customBanks.value[bankIndex]
  if (!bank || !bank.chords || bank.chords.length === 0) return

  // Create array of valid chords with their original indices
  const validChords: Array<{ chord: { id: string; notes: string[] }; originalIndex: number }> = []
  bank.chords.forEach((chord, index) => {
    if (chord !== null) {
      validChords.push({ chord, originalIndex: index })
    }
  })

  if (validChords.length === 0) return

  let currentChordIndex = 0

  const playNextChord = async () => {
    // Check if we should still be playing
    if (playingCustomBankIndex.value !== bankIndex) {
      return
    }

    const chordData = validChords[currentChordIndex]
    if (!chordData) {
      // If looping, start over
      if (isLoopingCustomBank.value && playingCustomBankIndex.value === bankIndex) {
        currentChordIndex = 0
        await playNextChord()
      } else {
        // Stop playback
        playingCustomBankIndex.value = null
        isLoopingCustomBank.value = false
      }
      return
    }

    const buttonId = `custom-${bankIndex}-${chordData.originalIndex}`
    
    // Play the chord
    selectChord(chordData.chord, buttonId)

    // Calculate delay based on tempo (play each chord for 2 beats)
    const quarterNoteMs = (60 / pianoStore.tempo) * 1000
    const delay = quarterNoteMs * 2

    // Wait for the chord to finish, then play next
    customBankPlaybackTimeout.value = setTimeout(async () => {
      currentChordIndex++
      await playNextChord()
    }, delay) as unknown as number
  }

  // Start playing
  await playNextChord()
}

// Toggle custom bank playback
const toggleCustomBankPlayback = (bankIndex: number) => {
  if (playingCustomBankIndex.value === bankIndex) {
    // Stop playback
    if (customBankPlaybackTimeout.value !== null) {
      clearTimeout(customBankPlaybackTimeout.value)
      customBankPlaybackTimeout.value = null
    }
    playingCustomBankIndex.value = null
    isLoopingCustomBank.value = false
  } else {
    // Stop any other playback that might be playing
    if (sectionPlaybackTimeout.value !== null) {
      clearTimeout(sectionPlaybackTimeout.value)
      sectionPlaybackTimeout.value = null
    }
    if (customBankPlaybackTimeout.value !== null) {
      clearTimeout(customBankPlaybackTimeout.value)
      customBankPlaybackTimeout.value = null
    }
    playingSectionIndex.value = null
    // Start playing this bank
    playingCustomBankIndex.value = bankIndex
    playCustomBankChords(bankIndex)
  }
}

// Toggle loop for custom bank
const toggleCustomBankLoop = (bankIndex: number) => {
  if (playingCustomBankIndex.value === bankIndex) {
    // Toggle loop for currently playing bank
    isLoopingCustomBank.value = !isLoopingCustomBank.value
  } else {
    // Start playing with loop enabled
    isLoopingCustomBank.value = true
    toggleCustomBankPlayback(bankIndex)
  }
}

// Toggle edit mode for custom bank
const toggleEditCustomBank = (bankIndex: number) => {
  if (editingCustomBanks.value.has(bankIndex)) {
    editingCustomBanks.value.delete(bankIndex)
  } else {
    editingCustomBanks.value.add(bankIndex)
  }
}
</script>

<style lang="scss" scoped>
/* Prevent double-tap zoom and horizontal scrolling */
.v-app {
  touch-action: manipulation;
  overflow-x: hidden;
  max-width: 100vw;
}

/* Prevent double-tap zoom on buttons */
.v-btn {
  touch-action: manipulation;
}
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
    z-index: 20;
    background-color: rgba(var(--v-theme-surface), 0.9) !important;
    backdrop-filter: blur(4px);
    min-width: 24px;
    width: 24px;
    height: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    opacity: 0.6;
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;

    &:hover {
      opacity: 1;
      transform: scale(1.1);
      background-color: rgba(var(--v-theme-error), 0.1) !important;
    }

    &:active {
      transform: scale(0.95);
    }

    // On mobile, make it always visible and slightly larger
    @media (hover: none) and (pointer: coarse) {
      opacity: 0.8;
      min-width: 28px;
      width: 28px;
      height: 28px;
      top: 2px;
      right: 2px;
    }
  }

  // On desktop, show on hover
  @media (hover: hover) {
    .chord-button-wrapper:hover .remove-chord-btn {
      opacity: 1;
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

.bank-title-input-editing {
  :deep(.v-field) {
    border: 2px solid rgba(var(--v-theme-primary), 0.5);
    border-radius: 8px;
    background-color: rgba(var(--v-theme-surface), 0.5);
    transition: all 0.2s ease;
    min-height: 38px; // Match h3 height with padding
    
    &:focus-within {
      border-color: rgba(var(--v-theme-primary), 1);
      background-color: rgba(var(--v-theme-surface), 0.8);
      box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.1);
    }
  }
  
  :deep(.v-field__input) {
    padding: 0.5rem 0.75rem;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.5;
  }
}

.bank-title-display {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.5;
  padding: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(var(--v-theme-on-surface), 0.9);
  user-select: none;
  display: flex;
  align-items: center;
  min-height: 30px; // Match h3 height
  
  &:hover {
    color: rgba(var(--v-theme-primary), 0.8);
  }
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  margin: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  margin-top: 1rem;
  padding: 0;
}

.section-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.play-section-btn,
.loop-section-btn {
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
}

.custom-bank-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0;
  gap: 1rem;
}

.custom-bank-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
}

.play-bank-btn,
.loop-bank-btn,
.edit-bank-btn,
.delete-bank-btn {
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
}

/* Delete Confirmation Dialog */
.delete-confirm-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.dialog-title {
  display: flex;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 1);
}

.dialog-content {
  padding: 0 1.5rem 1rem;
  
  p {
    margin: 0.5rem 0;
    font-size: 1rem;
    color: rgba(var(--v-theme-on-surface), 0.9);
    line-height: 1.5;
  }
  
  .dialog-warning {
    font-size: 0.875rem;
    color: rgba(var(--v-theme-error), 0.8);
    font-weight: 500;
    margin-top: 0.75rem;
  }
}

.dialog-actions {
  padding: 1rem 1.5rem 1.5rem;
  gap: 0.75rem;
}

.cancel-btn {
  font-weight: 600;
  text-transform: none;
}

.confirm-btn {
  font-weight: 600;
  text-transform: none;
  min-width: 100px;
}

/* Dark Theme Dialog */
.v-theme--dark {
  .delete-confirm-dialog {
    background-color: rgba(var(--v-theme-surface), 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  }
}

/* Light Theme Dialog */
.v-theme--light {
  .delete-confirm-dialog {
    background-color: rgba(var(--v-theme-surface), 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  }
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
  /* Don't add overflow-x: hidden here as it breaks sticky positioning of piano above */
  max-width: 100vw;
  touch-action: manipulation;
}

.chord-grid {
  gap: 1rem;
  margin-top: 1rem;
  overflow-x: hidden;
  max-width: 100%;
  @media (min-width: 480px) {
    padding: 2rem;
    gap: 2rem;
  }
  .col {
    padding: 0.25rem;
  }
}

/* Prevent horizontal overflow on containers - but only on specific containers, not all */
.chord-grid :deep(.v-container) {
  overflow-x: hidden;
  max-width: 100%;
}

.chord-grid :deep(.v-row) {
  margin-left: 0;
  margin-right: 0;
  max-width: 100%;
}

.chord-grid :deep(.v-col) {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  max-width: 100%;
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
