<script setup lang="ts">
import { defineProps, computed } from "vue";

const props = defineProps({
  chord: {
    type: Object,
    required: true,
  },
  baseKey: {
    type: String,
    required: true,
  },
});

// Computed property to dynamically determine the chord type class
const chordClass = computed(() => {
  return {
    major: props.chord.type === 'major',
    minor: props.chord.type === 'minor',
  };
});
</script>

<template>
  <v-card
    :to="`/chords/piano/${encodeURIComponent(baseKey)}/${encodeURIComponent(baseKey)}${encodeURIComponent(chord.id)}`"
    router
    class="d-flex flex-column justify-center align-center hover-card card-item"
    :class="chordClass"
    elevation="0"
  >
    <div class="chord-title">
      <div class="chord-key">{{ baseKey }}</div>
      <div class="chord-id">{{ chord.id }}</div>
    </div>

    <div class="attributes">
      <v-chip
        class="type-chip"
        size="x-small"
        :class="[
          {'bg-orange': props.chord.type === 'major'},
          {'bg-indigo': props.chord.type === 'minor'},
        ]"
      >
        {{ chord.type }}
      </v-chip>
    </div>
  </v-card>
</template>

<style lang="scss" scoped>
.card-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 80px;
  padding: 0.75rem 0.5rem;
  gap: 0.25rem;
}

.chord-title {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.25rem 0;
  gap: 0.125em;
  .chord-key {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
  }
  .chord-id {
    font-size: 0.875rem;
    font-weight: 500;
  }
}

.v-card {
  text-align: center;
  transition: transform 0.2s, background-color 0.2s;
  min-height: auto;
}

.v-card:hover {
  transform: scale(1.05);
}

.hover-card {
  cursor: pointer;
  text-decoration: none;
}

.attributes {
  margin-top: 0.125rem;
  
  .type-chip {
    height: 22px;
    font-size: 0.75rem;
    padding: 0 0.5rem;
    font-weight: 600;
  }
}

.major {
  .type-chip {
    background-color: rgba(var(--v-theme-amber), 1);
  }
}

.minor {
  .type-chip {
    background-color: var(--v-theme-indigo-5);
  }
}
</style>
