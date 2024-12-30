<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import KeyNav from "../components/KeyNav.vue";
import PageHeader from "../components/PageHeader.vue";
import ChordsList from "../components/ChordsList.vue";

// Access route parameters
const route = useRoute();
const selectedKey = ref(route.params.key as string); // Make it reactive
</script>

<template>
  <KeyNav :activeKey="selectedKey" />
  <PageHeader pre="Chords in the key of" :title="selectedKey" />
  <ChordsList :baseKey="selectedKey" />
</template>

<style lang="scss" scoped>
.intro {
  padding: 2rem;
  margin: 1rem auto;
  border-radius: 10px;
}
/* Dark Theme */
.v-theme--dark {
  .intro {
    background-color: rgba(var(--v-theme-secondary), 0.3);
  }
}

/* Light Theme */
.v-theme--light {
  .intro {
    background-color: rgb(255, 235, 182);
  }
}
</style>
