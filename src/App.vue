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
          <!-- Smart search with autocomplete -->
          <v-autocomplete
            v-if="filteredChords.length"
            :items="filteredChords"
            item-title="longName"
            item-value="longName"
            item-key="key"
            label="Search Chords"
            v-model="searchQuery"
            clearable
            class="search-bar"
            size="sm"
            @change="handleSelection"
            :menu-props="{closeOnContentClick:true}"

          >
            <template #item="{ item }">
              <v-card
                :to="`/chords/piano/${encodeURIComponent(item.raw.key)}/${encodeURIComponent(item.title)}`"
                router
                class="d-flex flex-column justify-center align-center hover-card"
                elevation="2"
              >
                <div class="d-flex align-center">
                  <span>{{ item.title }}</span> <!-- Displaying chord name -->
                </div>
              </v-card>
<!--              <router-link-->
<!--                :to="{-->
<!--                  name: 'ChordDetail',-->
<!--                  params: {-->
<!--                    key: item.title.charAt(0).toUpperCase(),-->
<!--                    id: item.title-->
<!--                  } -->
<!--                }"-->
<!--              >-->
<!--                <div class="d-flex align-center">-->
<!--                  <span>{{ item.title }}</span> &lt;!&ndash; Displaying chord name &ndash;&gt;-->
<!--                </div>-->
<!--              </router-link>-->
<!--              <div class="d-flex align-center">-->
<!--                <span>{{ item.title }}</span> &lt;!&ndash; Displaying chord name &ndash;&gt;-->
<!--              </div>-->
            </template>
          </v-autocomplete>

          <!-- Theme switcher (unchanged) -->
          <v-menu offset-y max-width="300px">
            <template #activator="{ props }">
              <v-btn icon v-bind="props">
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

    <v-footer app>
      <v-container max-width="1200px" fluid>
        <span>&copy; 2024 caseytrombley</span>
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
  console.log('Filtered Chords:', filteredChords);  // Log the actual array
});
</script>


<style lang="scss" scoped>
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.center-div {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.right-div {
  display: flex;
  margin-left: auto;
}

.search-bar {
  width: 300px;
  margin-right: 1rem;
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
