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
import { useTheme } from 'vuetify'; // Correct composable for theme management

const themes = ['system', 'light', 'dark'];
const currentTheme = ref('system'); // Default to system preference
const theme = useTheme(); // Vuetify's theme manager

// Watch for changes to the theme selector
watch(currentTheme, (newTheme) => {
  if (newTheme === 'system') {
    // Automatically detect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme.global.name.value = prefersDark ? 'dark' : 'light';
  } else {
    // Apply selected theme
    theme.global.name.value = newTheme;
  }
});

// Initialize the theme to match system preference on load
if (currentTheme.value === 'system') {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  theme.global.name.value = prefersDark ? 'dark' : 'light';
}
</script>

<style scoped>
/* Scoped styles */
</style>
