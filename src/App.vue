<template>
  <v-app>
    <div class="app-header">
      <v-container max-width="1200px" fluid class="app-header-container">
        <!-- Center logo on mobile and align it to the left on larger screens -->
        <div class="app-title">
          <RouterLink style="text-decoration: none; color: inherit;" to="/">
            <Logo />
          </RouterLink>
        </div>

        <!-- Controls container (search and nav) -->
        <div class="app-header-controls">
          <!-- Search bar -->
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

          <v-btn
            to="/chord-player"
            router
            variant="text"
            class="chord-player-btn"
          >
            <v-icon start>mdi-piano</v-icon>
            Chord Player
          </v-btn>
        </div>
      </v-container>
    </div>

    <v-main>
      <RouterView />
    </v-main>

    <v-footer class="bg-grey-darken-4">
      <v-container max-width="1200px" fluid class="d-flex justify-space-between align-center py-4">
        <div>
          &copy; {{ new Date().getFullYear() }}
          <a href="https://www.caseytrombley.com" target="_blank" rel="noopener noreferrer" class="link">
            caseytrombley
          </a>
        </div>
        <!-- Theme switcher -->
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
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useChordsStore } from "./stores/chordsStore";
import { useTheme } from "vuetify";
import Logo from "./components/Logo.vue";

// Define theme-related types and logic
const themes = ["system", "light", "dark"] as const; // Define themes as a constant tuple
type Theme = (typeof themes)[number]; // Create a type from the tuple: 'system' | 'light' | 'dark'

const theme = useTheme();
const currentTheme = ref<Theme>("system"); // Ensure currentTheme is typed correctly

const themeIcons: Record<Theme, string> = {
  light: "mdi-white-balance-sunny",
  dark: "mdi-moon-waxing-crescent",
  system: "mdi-monitor",
};

const themeLabels: Record<Theme, string> = {
  light: "Light theme",
  dark: "Dark theme",
  system: "System theme",
};

const currentThemeIcon = ref(themeIcons.system);

const setTheme = (newTheme: Theme) => {
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
const searchQuery = ref<string | null>("");

// Computed property for filtered chords
const filteredChords = computed(() => {
  const query = searchQuery.value?.toUpperCase() || "";
  return Object.keys(chordsStore.chords)
    .flatMap((key) => {
      const chordsForKey = Object.values(chordsStore.chords[key]);
      return chordsForKey
        .filter((chord: any) => chord.longName.toUpperCase().startsWith(query))
        .map((chord: any) => ({
          key,
          longName: chord.longName,
          chord,
        }));
    });
});

const handleSelection = (): void => {
  searchQuery.value = "";
};

onMounted(async () => {
  await initializeChordsStore();
});
</script>

<style lang="scss" scoped>
.app-header {
  background-color: var(--v-theme-surface);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  padding: 1rem 0;
}

.app-header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 800;

}

.app-header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: flex-end;
}

.search-bar {
  width: 300px;
}

.chord-player-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
}

main {
  padding-top: 2rem;
}

/* Mobile-specific styles */
@media (max-width: 600px) {
  .app-header-container {
    flex-direction: column;
    align-items: center;
  }

  .app-title {
    width: 100%;
    text-align: center;
  }

  .app-header-controls {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    align-items: center;
  }

  .search-bar {
    width: 100%;
  }
}

/* Dark Theme */
.v-theme--dark {
  .app-header {
    background-color: rgba(var(--v-theme-surface), 0.8);
    backdrop-filter: blur(10px);
  }
  .link {
    color: rgba(var(--v-theme-primary), 1);
  }
}

/* Light Theme */
.v-theme--light {
  .app-header {
    background-color: rgba(var(--v-theme-surface), 0.8);
    backdrop-filter: blur(10px);
  }
  .link {
    color: rgba(var(--v-theme-primary), 1);
  }
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
