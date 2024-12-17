<template>
  <v-app>

    <div class="app-header">
      <v-container max-width="1200px" fluid class="container">
        <div class="app-title center-div">
          <RouterLink style="text-decoration: none; color: inherit;" to="/">
            <Logo />
          </RouterLink>
        </div>
        <div class="app-header-controls right-div">
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
        </div>
      </v-container>
    </div>

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
import Logo from './components/Logo.vue';

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
<!--<style>-->
<!--.v-theme&#45;&#45;dark .v-application__wrap {-->
<!--  &#45;&#45;s: 20px; /* control the size*/-->
<!--  &#45;&#45;c1: #000000;-->
<!--  &#45;&#45;c2: #070707;-->

<!--  &#45;&#45;l:var(&#45;&#45;c1) 20%,#0000 0;-->
<!--  &#45;&#45;g:35%,var(&#45;&#45;c2) 0 45%,var(&#45;&#45;c1) 0;-->
<!--  background:-->
<!--    linear-gradient(45deg,var(&#45;&#45;l) 45%,var(&#45;&#45;c1) 0 70%,#0000 0),-->
<!--    linear-gradient(-45deg,var(&#45;&#45;l) var(&#45;&#45;g) 70%,#0000 0),-->
<!--    linear-gradient(45deg,var(&#45;&#45;c1) var(&#45;&#45;g));-->
<!--  background-size: var(&#45;&#45;s) var(&#45;&#45;s);-->
<!--}-->
<!--</style>-->
<style lang="scss" scoped>

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.center-div {
  position: absolute; /* Centers horizontally */
  left: 50%;
  transform: translateX(-50%);
}

.right-div {
  margin-left: auto; /* Pushes to the far right */
}

.v-list-item {
  display: flex;
  align-items: center;
}

.logo {
  font-size: 2.25rem;
  .sup {
    position: relative;
    top: -0.35em;
    margin: 0 -0.05em 0 0;
    color: rgba(var(--v-theme-primary), 1);
    font-size: 0.75em;

  }
}
</style>
