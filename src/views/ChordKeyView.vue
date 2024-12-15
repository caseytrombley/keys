<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import KeyNav from "../components/KeyNav.vue";
import ChordsList from "../components/ChordsList.vue";

// Access route parameters
const route = useRoute();
const selectedKey = ref(route.params.key as string); // Make it reactive
</script>

<template>
  <KeyNav :activeKey="selectedKey" />
  <ChordsList :baseKey="selectedKey" :enableAutocomplete="true" />
</template>
