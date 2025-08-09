<script setup lang="ts">
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';

defineProps({
  activeKey: {
    type: String,
    required: false,
  },
});

const router = useRouter();

const goToKeyPage = (selectedKey: string) => {
  router.push(`/chords/${encodeURIComponent(selectedKey)}`);
};
</script>

<template>
  <v-container max-width="1200px" fluid class="container px-3">
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
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  justify-content: center;
  padding: 1.5rem;
  margin: 2rem 0 0;
  border-radius: 10px;
}

@media (min-width: 600px) {
  .key-nav {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (min-width: 1000px) {
  .key-nav {
    display: flex;
    justify-content: space-around;
    gap: .5rem;
    border-radius: 50em;
  }
}

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
