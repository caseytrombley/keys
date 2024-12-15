<script setup lang="ts">
import { defineProps } from "vue";

// Define the props for the component
defineProps({
  chords: {
    type: Array,
    required: true,
  },
  baseKey: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <v-container max-width="1200px" fluid>
    <v-row dense>
      <v-col
        v-for="(chord, chordId) in chords"
        :key="chordId"
        cols="auto"
      >
        <v-card
          :to="`/chords/piano/${encodeURIComponent(baseKey)}/${encodeURIComponent(chordId)}`"
          router
          class="d-flex flex-column justify-center align-center hover-card"
          elevation="2"
        >
          <div class="chord-name">{{ chord.name }}</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.chord-name {
  font-size: 1.3rem;
  font-weight: bold;
  text-align: center;
}

.v-card {
  text-align: center;
  padding: 8px;
  width: 80px;
  height: 80px;
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
