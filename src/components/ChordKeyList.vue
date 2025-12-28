<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useChordsStore } from '../stores/chordsStore';

const props = defineProps({
  baseKey: {
    type: String,
    required: true,
  },
  currentChordId: {
    type: String,
    required: true,
  },
});

const router = useRouter();
const chordsStore = useChordsStore();
const isLoading = ref(false);

// Get all chords in the current key
const chordsInKey = computed(() => {
  const chords = chordsStore.chords[props.baseKey];
  if (!chords || !Array.isArray(chords)) {
    return [];
  }
  return chords;
});

// Ensure chords for this key are loaded
const ensureChordsLoaded = async () => {
  if (!chordsStore.chords[props.baseKey]) {
    isLoading.value = true;
    await chordsStore.fetchChordsForKey(props.baseKey);
    isLoading.value = false;
  }
};

const goToChord = (chordId: string) => {
  router.push({
    name: 'ChordDetail',
    params: { key: props.baseKey, id: `${props.baseKey}${chordId}` },
  });
};

const isCurrentChord = (chordId: string) => {
  return `${props.baseKey}${chordId}` === props.currentChordId;
};

onMounted(() => {
  ensureChordsLoaded();
});

watch(() => props.baseKey, ensureChordsLoaded);
</script>

<template>
  <v-container max-width="1200px" fluid>
    <div class="chord-key-list">
      <div class="chord-key-list-header">
        <span class="header-text">Chords in {{ baseKey }}</span>
      </div>
      <div v-if="isLoading" class="loading">Loading...</div>
      <div v-else class="chord-buttons">
        <v-btn
          v-for="chord in chordsInKey"
          :key="chord.id"
          size="small"
          variant="flat"
          :class="{ 'active-chord': isCurrentChord(chord.id) }"
          @click="goToChord(chord.id)"
          class="chord-btn"
        >
          {{ baseKey }}{{ chord.id }}
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<style lang="scss" scoped>
.chord-key-list {
  margin: 2rem 0;
  padding: 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, 
    rgba(var(--v-theme-surface), 0.8) 0%, 
    rgba(var(--v-theme-surface), 0.6) 100%);
  border: 2px solid rgba(var(--v-theme-on-surface), 0.08);
}

.chord-key-list-header {
  margin-bottom: 1rem;
  
  .header-text {
    font-size: 0.875rem;
    font-weight: 700;
    color: rgba(var(--v-theme-on-surface), 0.8);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}

.loading {
  text-align: left;
  padding: 0.5rem 0;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.chord-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-start;
  align-items: flex-start;
}

.chord-btn {
  min-width: 70px;
  font-weight: 600;
  transition: all 0.2s ease;
  border-radius: 6px;
  
  // Use accent/success colors instead of primary/secondary to differentiate
  &:not(.active-chord) {
    background-color: rgba(var(--v-theme-on-surface), 0.1) !important;
    color: rgba(var(--v-theme-on-surface), 0.8) !important;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
    
    &:hover {
      background-color: rgba(var(--v-theme-on-surface), 0.15) !important;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
  
  &.active-chord {
    background: linear-gradient(135deg, 
      rgba(var(--v-theme-accent), 0.9) 0%, 
      rgba(var(--v-theme-accent), 0.7) 100%) !important;
    color: white !important;
    border: 1px solid rgba(var(--v-theme-accent), 1);
    transform: scale(1.05);
    box-shadow: 0 3px 12px rgba(var(--v-theme-accent), 0.4);
    font-weight: 700;
    
    &:hover {
      transform: scale(1.08);
      box-shadow: 0 4px 16px rgba(var(--v-theme-accent), 0.5);
    }
  }
}

/* Dark Theme */
.v-theme--dark {
  .chord-key-list {
    background: linear-gradient(135deg, 
      rgba(var(--v-theme-surface), 0.4) 0%, 
      rgba(var(--v-theme-surface), 0.2) 100%);
    border-color: rgba(var(--v-theme-on-surface), 0.12);
  }
  
  .chord-btn {
    &:not(.active-chord) {
      background-color: rgba(var(--v-theme-on-surface), 0.08) !important;
      color: rgba(var(--v-theme-on-surface), 0.9) !important;
      border-color: rgba(var(--v-theme-on-surface), 0.2);
    }
  }
}

/* Light Theme */
.v-theme--light {
  .chord-key-list {
    background: linear-gradient(135deg, 
      rgba(var(--v-theme-surface), 0.9) 0%, 
      rgba(var(--v-theme-surface), 0.7) 100%);
    border-color: rgba(var(--v-theme-on-surface), 0.1);
  }
  
  .chord-btn {
    &:not(.active-chord) {
      background-color: rgba(var(--v-theme-on-surface), 0.12) !important;
      color: rgba(var(--v-theme-on-surface), 0.7) !important;
      border-color: rgba(var(--v-theme-on-surface), 0.2);
    }
  }
}
</style>

