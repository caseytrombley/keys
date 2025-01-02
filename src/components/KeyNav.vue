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
        variant="text"
        size="large"
      >
        {{ key }}
      </v-btn>
    </div>
  </v-container>
</template>

<style lang="scss" scoped>
.container {
  padding: 0;
}
.key-nav {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 buttons per row */
  gap: 1rem;
  justify-content: center;
  padding: 1.5rem;
}

/* Tablet Layout: Buttons in two rows */
@media (min-width: 600px) {
  .key-nav {
    grid-template-columns: repeat(6, 1fr); /* 6 buttons per row */
  }
}

/* Desktop Layout: Buttons in a single row */
@media (min-width: 1000px) {
  .key-nav {
    display: flex;
    justify-content: space-around;
    gap: .5rem;
    border-radius: 50em;
  }
}

/* Button Styles */
.v-btn {
  flex: 0 0 auto;
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  border-radius: 50em;
}

/* Dark Theme */
.v-theme--dark {
  .key-nav {
    background-color: rgba(0,0,0, 0.75);
  }
  .active {
    background-color: rgba(var(--v-theme-secondary), 0.3);
  }
}

/* Light Theme */
.v-theme--light {
  .key-nav {
    background-color: #ffe0b0;
  }
  .active {
    background-color: rgba(var(--v-theme-secondary), 0.5);
  }
}
</style>
