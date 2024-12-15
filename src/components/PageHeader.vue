<script setup lang="ts">
import { defineProps } from 'vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  pre: {
    type: String,
    required: false
  },
});

</script>

<template>
  <div class="detail-header">
    <v-container max-width="1200px" fluid class="detail-container">
      <div v-if="pre">{{ pre }}</div>
      <h2>{{ title }}</h2>
      <slot />
    </v-container>
  </div>
</template>

<style lang="scss" scoped>
.detail-header {
  display: block;
  text-align: center;
  padding: 1rem 0 0;
  //background-color: rgba(var(--v-theme-secondary), 0.1);

  h2 {
    font-family: "Marck Script", cursive;
    font-weight: 800;
    font-style: normal;
    font-size: 3em;
    line-height: 1.05;
  }
}


</style>
