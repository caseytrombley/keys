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
import { inject } from 'vue';

// Inject Vuetify's theme manager
const vuetify = inject('vuetify');

// Available themes
const themes = ['system', 'light', 'dark'];
const currentTheme = ref('light'); // Default theme

// Watch for changes in theme selection and apply them
watch(currentTheme, (newTheme) => {
  if (newTheme === 'system') {
    // Use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    vuetify.theme.global.name.value = prefersDark ? 'dark' : 'light';
  } else {
    vuetify.theme.global.name.value = newTheme;
  }
});
</script>



<style scoped>
/* Add your styles here */
</style>
