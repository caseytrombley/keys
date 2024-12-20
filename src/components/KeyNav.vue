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
    <nav class="key-nav">
      <v-btn
        v-for="key in ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']"
        :key="key"
        @click="goToKeyPage(key)"
        :class="{ active: key === activeKey }"
        flat
        size="large"
      >
        {{ key }}
      </v-btn>
    </nav>
  </v-container>
</template>

<style lang="scss" scoped>
.key-nav {
  display: flex;
  justify-content: center;
  padding: 1.25rem 0 1rem;
  border-radius: 5px;
}

.v-btn {
  margin: 0 0.2rem;
  border-radius: 50em;
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
    //background-color: rgba(var(--v-theme-secondary), 0.3);
    background-color: rgb(255, 235, 182);
  }
  .active {
    background-color: rgba(var(--v-theme-secondary), 0.5)
  }
}
</style>
