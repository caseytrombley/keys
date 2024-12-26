<script setup lang="ts">
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';

defineProps({
  activeKey: {
    type: String,
    required: true,
  },
});

const router = useRouter();

const goToKeyPage = (selectedKey: string) => {
  router.push(`/chords/${encodeURIComponent(selectedKey)}`);
};
</script>

<template>
  <v-container max-width="1200px" fluid class="container">
    <div class="key-nav">
      <v-btn
        v-for="key in ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']"
        :key="key"
        @click="goToKeyPage(key)"
        :class="{ active: key === activeKey }"
        flat
        size="large"
      >
        {{ key }}
      </v-btn>
    </div>
  </v-container>
</template>

<style lang="scss" scoped>
/* Mobile-First Layout: Buttons stack in rows */
.key-nav {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 buttons per row */
  gap: 0.5rem; /* Spacing between buttons */
  justify-content: center;
  padding: 1rem;
}

/* Tablet Layout: Buttons in two rows */
@media (min-width: 600px) {
  .key-nav {
    grid-template-columns: repeat(6, 1fr); /* 6 buttons per row */
  }
}

/* Desktop Layout: Buttons in a single row */
@media (min-width: 900px) {
  .key-nav {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }
}

/* Button Styles */
.v-btn {
  flex: 0 0 auto;
  margin: 0;
  border-radius: 50em;
}

/* Dark Theme */
.v-theme--dark {
  .key-nav {
    background-color: rgba(var(--v-theme-secondary), 0.1);
  }
  .active {
    background-color: rgba(var(--v-theme-secondary), 0.3);
  }
}

/* Light Theme */
.v-theme--light {
  .key-nav {
    background-color: rgb(255, 235, 182);
  }
  .active {
    background-color: rgba(var(--v-theme-secondary), 0.5);
  }
}
</style>
