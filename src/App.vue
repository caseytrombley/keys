<template>
  <v-app>
    <div class="app-header">
      <v-container max-width="1200px" fluid class="app-header-container">
        <div class="app-title">
          <RouterLink style="text-decoration: none; color: inherit;" to="/">
            <Logo />
          </RouterLink>
        </div>
        <div class="app-header-controls right-div">
          <!-- Smart search with autocomplete -->
          <v-autocomplete
            v-if="filteredChords.length"
            :items="filteredChords"
            item-title="longName"
            item-value="longName"
            item-key="key"
            label="Search Chords"
            v-model="searchQuery"
            :clearable="false"
            class="search-bar"
            size="small"
            variant="underlined"
            @change="handleSelection"
            :menu-props="{closeOnContentClick:true}"
          >
            <template #item="{ item }">
              <v-card
                :to="`/chords/piano/${encodeURIComponent(item.raw.key)}/${encodeURIComponent(item.raw.key)}${encodeURIComponent(item.raw.chord.id)}`"
                router
                class="hover-card"
                elevation="0"
              >
                <div class="search-auto-item">
                  <span>{{ item.raw.key }}{{ item.raw.chord.id }}</span>
                </div>
              </v-card>
            </template>
          </v-autocomplete>

          <!-- Theme switcher (unchanged) -->
          <v-menu offset-y max-width="300px">
            <template #activator="{ props }">
              <v-btn icon v-bind="props" elevation="0" variant="plain">
                <v-icon :icon="currentThemeIcon"></v-icon>
                <v-tooltip activator="parent" location="end">
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
                <v-list-item-title>
                  <v-icon :icon="themeIcons[theme]" class="me-3"></v-icon>
                  {{ themeLabels[theme] }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </v-container>
    </div>

    <v-main>
      <RouterView />
    </v-main>

    <v-footer class="bg-grey-darken-4">
      <v-container max-width="1200px" fluid>
        <div>
          &copy; {{ new Date().getFullYear() }}
          <a href="https://www.caseytrombley.com" target="_blank" rel="noopener noreferrer">
            caseytrombley
          </a>
        </div>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useChordsStore } from "./stores/chordsStore";
import { useTheme } from "vuetify";
import Logo from "./components/Logo.vue";

// Theme-related logic (unchanged)
const themes = ["system", "light", "dark"];
const theme = useTheme();
const currentTheme = ref("system");
const themeIcons = {
  light: "mdi-white-balance-sunny",
  dark: "mdi-moon-waxing-crescent",
  system: "mdi-monitor",
};
const themeLabels = {
  light: "Light theme",
  dark: "Dark theme",
  system: "System theme",
};
const currentThemeIcon = ref(themeIcons.system);

const setTheme = (newTheme: string) => {
  currentTheme.value = newTheme;
  if (newTheme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    theme.global.name.value = prefersDark ? "dark" : "light";
    currentThemeIcon.value = themeIcons.system;
  } else {
    theme.global.name.value = newTheme;
    currentThemeIcon.value = themeIcons[newTheme];
  }
};

const initializeTheme = () => {
  if (currentTheme.value === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    theme.global.name.value = prefersDark ? "dark" : "light";
    currentThemeIcon.value = themeIcons.system;
  } else {
    currentThemeIcon.value = themeIcons[currentTheme.value];
  }
};
initializeTheme();

// Chord search-related logic
const chordsStore = useChordsStore();

// Fetch chords for all keys on initialization
const initializeChordsStore = async () => {
  if (!chordsStore.allKeysLoaded) {
    await chordsStore.fetchAllChords(); // Fetch all chords if not already loaded
  }
};

// Search query state
const searchQuery = ref<string | null>(""); // Allow null and empty strings

// Computed property for filtered chords
const filteredChords = computed(() => {
  const query = searchQuery.value?.toUpperCase() || "";  // Get the search query and ensure it's uppercase

  // Now we map the original key to its chords while filtering
  return Object.keys(chordsStore.chords)
    .flatMap((key) => {
      // Get the chords for this key
      const chordsForKey = Object.values(chordsStore.chords[key]);

      // Filter the chords for this key based on the query and preserve the key
      return chordsForKey
        .filter((chord: any) => chord.longName.toUpperCase().startsWith(query))  // Filter chords by query
        .map((chord: any) => ({
          key,        // Preserve the key
          longName: chord.longName,   // Chord name
          chord,      // The full chord data
        }));
    });
});

const handleSelection = (): void => {
  searchQuery.value = ""; // Clear the search query
};


onMounted(async () => {
  await initializeChordsStore();  // Ensure chords are loaded
  //console.log('Filtered Chords:', filteredChords);  // Log the actual array
});
</script>


<style lang="scss" scoped>
.app-header-container {
  display: block;

}
@media (min-width: 768px) {
  .app-header-container {
    display: flex;
    position: relative;
    justify-content: space-between;
  }
}
.app-title {
  padding: 0 0 1rem;
}
@media (min-width: 900px) {
  .app-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    padding: 0;
  }
}

.right-div {
  display: flex;
  margin-left: auto;
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

.search-bar {
  width: 300px;
  margin-right: 1rem;
}

.hover-card {
  display: flex;
  padding: 1rem;
  gap: 5px;
  border-radius: 0;
}

.search-auto-item {

  align-self: initial;
  text-align: left;
}

</style>
