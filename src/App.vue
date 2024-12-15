<template>
  <v-app>
    <v-app-bar app>
      <v-container max-width="1200px" fluid class="d-flex align-center">
        <v-app-bar-title>
          <RouterLink style="text-decoration: none; color: inherit;" to="/">

            <v-icon icon="mdi-piano" class="mr-2"></v-icon>
            <span class="logo font-weight-bold">key <span><sup>&</sup></span> chord</span>
          </RouterLink>

        </v-app-bar-title>
        <nav>
          <RouterLink to="/">Home</RouterLink>
        </nav>
        <v-spacer></v-spacer>

        <!-- Theme switcher icon -->
        <v-menu offset-y max-width="300px">
          <template #activator="{ props }">
            <v-btn icon v-bind="props">
              <v-icon :icon="currentThemeIcon"></v-icon>

              <!-- Tooltip showing the current theme -->
              <v-tooltip
                activator="parent"
                location="end"
              >
                <template #default>
                  <span>{{ themeLabels[currentTheme] }}</span>
                </template>
              </v-tooltip>
            </v-btn>
          </template>

          <v-list>
            <v-list-item
              v-for="theme in themes"
              :key="theme"
              @click="setTheme(theme)"
              :class="[{ 'v-list-item--active': currentTheme === theme }, 'd-flex']"
            >
              <v-list-item-title><v-icon :icon="themeIcons[theme]" class="me-3"></v-icon>{{ themeLabels[theme] }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-container>

    </v-app-bar>

    <v-main>

      <RouterView />

    </v-main>

    <v-footer app>
      <v-container max-width="1200px" fluid>
        <span>&copy; 2024 caseytrombley</span>
      </v-container>

    </v-footer>
  </v-app>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTheme } from 'vuetify';

const themes = ['system', 'light', 'dark'];
const theme = useTheme();
const currentTheme = ref('system'); // Default to system preference

// Icons for light, dark, and system themes
const themeIcons = {
  light: 'mdi-white-balance-sunny', // Light theme icon
  dark: 'mdi-moon-waxing-crescent', // Dark theme icon
  system: 'mdi-monitor', // System preference icon
};

// Descriptive labels for the themes
const themeLabels = {
  light: 'Light theme',
  dark: 'Dark theme',
  system: 'System theme',
};

// Reactive icon for the current theme
const currentThemeIcon = ref(themeIcons.system);

// Set theme function
const setTheme = (newTheme) => {
  currentTheme.value = newTheme;
  if (newTheme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme.global.name.value = prefersDark ? 'dark' : 'light';
    currentThemeIcon.value = themeIcons.system; // Show system icon when system is selected
  } else if (newTheme === 'dark') {
    theme.global.name.value = 'dark';
    currentThemeIcon.value = themeIcons.dark; // Show moon icon when dark is selected
  } else {
    theme.global.name.value = 'light';
    currentThemeIcon.value = themeIcons.light; // Show sun icon when light is selected
  }
};

// Initialize to match system preference on load
const initializeTheme = () => {
  if (currentTheme.value === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme.global.name.value = prefersDark ? 'dark' : 'light';
    currentThemeIcon.value = themeIcons.system; // Show system icon when system is selected
  } else {
    currentThemeIcon.value = themeIcons[currentTheme.value];
  }
};

// Initialize theme on component mount
initializeTheme();

// Watch for changes in system preference (optional for dynamic system theme switching)
if (currentTheme.value === 'system') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    if (currentTheme.value === 'system') {
      const prefersDark = mediaQuery.matches;
      theme.global.name.value = prefersDark ? 'dark' : 'light';
      currentThemeIcon.value = themeIcons.system; // Keep system icon when system is selected
    }
  });
}

// Utility function for capitalizing theme names
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
</script>

<style lang="scss" scoped>
.logo {
  //font-family: "Marck Script", cursive;
  //font-weight: 800;
  //font-style: normal;
  //font-size: 3em;
  //line-height: 1.05;
}
.v-list-item {
  display: flex;
  align-items: center;
}
</style>
