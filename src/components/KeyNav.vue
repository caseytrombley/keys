<script setup lang="ts">
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';

// Props to receive the active key from the parent
defineProps({
  activeKey: {
    type: String,
    required: true,
  },
});

// Use router to navigate internally within the KeyNav component
const router = useRouter();

// Handle navigation when a key is clicked in the KeyNavBar
const goToKeyPage = (selectedKey: string) => {
  router.push(`/chords/${encodeURIComponent(selectedKey)}`);
};
</script>

<template>
  <nav class="key-nav">
    <v-btn
      v-for="key in ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']"
      :key="key"
      @click="goToKeyPage(key)"
      :class="{ active: key === activeKey }"
      flat
    >
      {{ key }}
    </v-btn>
  </nav>
</template>

<style lang="scss" scoped>
.key-nav {
  display: flex;
  justify-content: center;
  padding: 1.25rem 0 1rem;
}

.v-btn {
  margin: 0 0.2rem;
}

.v-theme--dark {
  .key-nav {
    background-color: rgba(var(--v-theme-secondary), 0.1);
  }
  .active {
    background-color: rgba(var(--v-theme-secondary), 0.3);
  }
}

.v-theme--light {
  .key-nav {
    background-color: #d9d9d9;
  }
  .active {
    background-color: rgba(var(--v-theme-secondary), 0.5)
  }
}
</style>
