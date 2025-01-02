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
      <v-chip-group>
        <v-chip
          class="type-chip"
          size="small"
          :class="[
            {'bg-orange': props.chord.type === 'major'},
            {'bg-indigo': props.chord.type === 'minor'},
          ]"
        >
          {{ chord.type }}
        </v-chip>
      </v-chip-group>
    </div>
  </v-card>
</template>

<style lang="scss" scoped>
.card-item {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 16px;
}

.chord-title {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  .chord-key {
    margin: 0 .125em 0 0;
    font-size: 1.5rem;
    font-weight: 800;
  }
  .chord-id {
    font-size: 1.125rem;
  }
}

.v-card {
  text-align: center;
  transition: transform 0.2s, background-color 0.2s;
  height: 100%;
}

.v-card:hover {
  transform: scale(1.05);
}

.hover-card {
  cursor: pointer;
  text-decoration: none;
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
