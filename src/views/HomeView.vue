<script setup lang="ts">
import KeyNav from "../components/KeyNav.vue";
import ChordsList from "../components/ChordsList.vue";
</script>

<template>
  <KeyNav />
  <ChordsList :enableAutocomplete="true" />
</template>
