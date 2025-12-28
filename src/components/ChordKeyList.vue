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
        :color="isCurrentChord(chord.id) ? 'primary' : 'secondary'"
        :class="{ 'active-chord': isCurrentChord(chord.id) }"
        @click="goToChord(chord.id)"
        class="chord-btn"
      >
        {{ baseKey }}{{ chord.id }}
      </v-btn>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chord-key-list {
  margin: 2rem 0;
  padding: 1rem;
  border-radius: 8px;
  background-color: rgba(var(--v-theme-surface), 0.5);
}

.chord-key-list-header {
  margin-bottom: 0.75rem;
  
  .header-text {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(var(--v-theme-on-surface), 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.loading {
  text-align: center;
  padding: 1rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.chord-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.chord-btn {
  min-width: 60px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &.active-chord {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.4);
  }
}

/* Dark Theme */
.v-theme--dark {
  .chord-key-list {
    background-color: rgba(var(--v-theme-surface), 0.3);
    border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  }
}

/* Light Theme */
.v-theme--light {
  .chord-key-list {
    background-color: rgba(var(--v-theme-surface), 0.6);
    border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  }
}
</style>

