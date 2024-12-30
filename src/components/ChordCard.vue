<script setup lang="ts">
import { defineProps } from "vue";

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
</script>

<template>
  <v-card
    :to="`/chords/piano/${encodeURIComponent(baseKey)}/${encodeURIComponent(chord.longName)}`"
    router
    class="d-flex flex-column justify-center align-center hover-card"
    elevation="0"
  >
    <div class="chord-title">
      <div class="chord-key">{{ baseKey }}</div>
      <div class="chord-id">{{ chord.id }}</div>
    </div>
  </v-card>
</template>

<style lang="scss" scoped>
.chord-title {
  display: flex;
  justify-items: center;
  align-items: center;
  padding: 1rem;
  .chord-key {
    margin: 0 .125em 0 0;
    font-size: 1.5rem;
    font-weight: 800;
  }
  .chord-id {
    //border-bottom: 4px solid #444444;
    font-size: 1.125rem;
  }
}

.v-card {
  text-align: center;
  padding: 8px;
  transition: transform 0.2s, background-color 0.2s;
}
.v-card:hover {
  transform: scale(1.05);
}
.hover-card {
  cursor: pointer;
  text-decoration: none;
}
</style>
