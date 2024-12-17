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
  <nav class="key-nav">
    <v-container max-width="1200px" fluid class="container">
      <v-btn
        v-for="key in ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']"
        :key="key"
        @click="goToKeyPage(key)"
        :class="{ active: key === activeKey }"
        flat
      >
        {{ key }}
      </v-btn>
    </v-container>

  </nav>
</template>

<style lang="scss" scoped>
.key-nav {

}

.container {
  display: flex;
  justify-content: center;
  padding: 1.25rem 0 1rem;
  border-radius: 5px;
}
.v-btn {
  margin: 0 0.2rem;
}

.v-theme--dark {
  .container {
    background-color: rgba(var(--v-theme-secondary), 0.1);
  }
  .active {
    background-color: rgba(var(--v-theme-secondary), 0.3);
  }
}

.v-theme--light {
  .container {
    background-color: #d9d9d9;
  }
  .active {
    background-color: rgba(var(--v-theme-secondary), 0.5)
  }
}
</style>
