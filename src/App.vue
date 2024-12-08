<template>
  <v-app>
    <v-app-bar app>
      <v-app-bar-title>Key Constructor</v-app-bar-title>
      <v-spacer></v-spacer>

      <!-- Theme switcher -->
      <v-select
        v-model="currentTheme"
        :items="themes"
        label="Theme"
        class="ms-4"
        outlined
        dense
        style="max-width: 200px;"
      ></v-select>
    </v-app-bar>

    <v-main>
      <RouterView />
    </v-main>

    <v-footer app>
      <span>&copy; 2024 caseytrombley</span>
    </v-footer>
  </v-app>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTheme } from 'vuetify/lib/framework.mjs'; // Use Vuetify's theme composable

const theme = useTheme(); // Access Vuetify's theme manager

// Available themes
const themes = ['system', 'light', 'dark'];
const currentTheme = ref('system'); // Default theme

// Watch for changes in theme selection
watch(currentTheme, (newTheme) => {
  if (newTheme === 'system') {
    // Detect system preference and set the theme accordingly
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme.global.name.value = prefersDark ? 'dark' : 'light';
  } else {
    theme.global.name.value = newTheme; // Set to 'light' or 'dark'
  }
});

// Initial check to apply system theme on load
if (currentTheme.value === 'system') {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  theme.global.name.value = prefersDark ? 'dark' : 'light';
}
</script>


<style scoped>
/* Add your styles here */
</style>
