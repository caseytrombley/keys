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
          <!-- Search icon button -->
          <v-btn
            icon
            variant="text"
            class="search-icon-btn"
            @click="openSearchModal"
          >
            <v-icon>mdi-magnify</v-icon>
            <v-tooltip activator="parent" location="bottom">
              <template #default>
                <span>Search Chords <kbd>{{ isMac ? '⌘' : 'Ctrl' }}</kbd>+<kbd>K</kbd></span>
              </template>
            </v-tooltip>
          </v-btn>

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

    <!-- Search Modal -->
    <v-dialog
      v-model="searchModalOpen"
      max-width="600"
      :scrim="true"
      @click:outside="closeSearchModal"
    >
      <v-card class="search-modal">
        <v-card-text class="pa-0">
          <div class="search-modal-content">
            <div class="search-input-wrapper">
              <v-text-field
                ref="searchInput"
                v-model="searchQuery"
                placeholder="Search chords..."
                variant="solo"
                class="search-modal-input"
                autofocus
                clearable
                @keydown.esc="closeSearchModal"
                @keydown.enter="handleEnterKey"
                @keydown.down.prevent="navigateResults(1)"
                @keydown.up.prevent="navigateResults(-1)"
              >
                <template #prepend-inner>
                  <v-icon>mdi-magnify</v-icon>
                </template>
                <template #append-inner>
                  <kbd class="search-shortcut-hint">{{ isMac ? '⌘' : 'Ctrl' }}</kbd><kbd class="search-shortcut-hint">K</kbd>
                </template>
              </v-text-field>
            </div>
            <div class="search-results-container">
              <v-list v-if="filteredChords.length > 0" class="search-results-list">
                <v-list-item
                  v-for="(item, index) in filteredChords"
                  :key="`${item.key}-${item.chord.id}-${index}`"
                  :class="{ 'search-result-active': index === selectedResultIndex }"
                  class="search-result-item"
                  @click="selectChord(item)"
                >
                  <div class="search-result-content">
                    <span class="search-result-chord">{{ item.key }}{{ item.chord.id }}</span>
                    <span class="search-result-name">{{ item.longName }}</span>
                  </div>
                </v-list-item>
              </v-list>
              <div v-else-if="searchQuery && searchQuery.trim().length > 0" class="search-no-results">
                <v-icon class="mb-2">mdi-music-note-off</v-icon>
                <div>No chords found</div>
              </div>
              <div v-else class="search-empty-state">
                <v-icon class="mb-2">mdi-magnify</v-icon>
                <div>Start typing to search chords...</div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

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
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
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
  // Force reload if not all keys are loaded or if we only have one key (likely C)
  const currentKeys = Object.keys(chordsStore.chords);
  if (!chordsStore.allKeysLoaded || currentKeys.length <= 1) {
    console.log('Initializing chords store. Current keys:', currentKeys);
    // Force reload
    await chordsStore.fetchAllChords(true); // Force fetch all chords
    console.log('Chords loaded. All keys:', Object.keys(chordsStore.chords));
  }
};

// Search modal state
const searchModalOpen = ref(false);
const searchInput = ref<any>(null);

// Search query state
const searchQuery = ref<string>("");
const selectedResultIndex = ref<number>(-1);

// Detect if user is on Mac for keyboard shortcut display
const isMac = ref(false);

// Computed property for filtered chords - completely rewritten
const filteredChords = computed(() => {
  const query = (searchQuery.value || "").trim().toUpperCase();
  
  // Get all chords from store
  const allChordsData = chordsStore.chords;
  
  // If no chords loaded, return empty
  if (!allChordsData || typeof allChordsData !== 'object') {
    return [];
  }
  
  const allKeys = Object.keys(allChordsData);
  
  // If no query, return empty (don't show all chords)
  if (!query) {
    return [];
  }
  
  const results: any[] = [];
  
  // Iterate through all keys
  for (const key of allKeys) {
    const chordsForKey = allChordsData[key];
    
    // Skip if not an array
    if (!Array.isArray(chordsForKey)) {
      continue;
    }
    
    const keyUpper = key.toUpperCase();
    
    // Check if key matches query
    const keyMatches = keyUpper === query || keyUpper.startsWith(query);
    
    // Process each chord
    for (const chord of chordsForKey) {
      if (!chord) continue;
      
      const longName = chord.longName || `${key}${chord.id || ''}`;
      const longNameUpper = longName.toUpperCase();
      
      const chordItem = {
        key,
        longName,
        chord,
        matchType: 'none' as 'key' | 'name' | 'none'
      };
      
      // Priority 1: Exact key match
      if (keyUpper === query) {
        chordItem.matchType = 'key';
        results.push(chordItem);
      }
      // Priority 2: Key starts with query
      else if (keyMatches) {
        chordItem.matchType = 'key';
        results.push(chordItem);
      }
      // Priority 3: Long name starts with query
      else if (longNameUpper.startsWith(query)) {
        chordItem.matchType = 'name';
        results.push(chordItem);
      }
    }
  }
  
  // Sort: key matches first, then name matches
  results.sort((a, b) => {
    if (a.matchType === 'key' && b.matchType !== 'key') return -1;
    if (a.matchType !== 'key' && b.matchType === 'key') return 1;
    return 0;
  });
  
  return results;
});

const openSearchModal = async () => {
  // Force reload all chords
  await chordsStore.fetchAllChords(true);
  
  searchModalOpen.value = true;
  searchQuery.value = "";
  selectedResultIndex.value = -1;
  
  await nextTick();
  // Focus the input
  if (searchInput.value && searchInput.value.$el) {
    const input = searchInput.value.$el.querySelector('input');
    if (input) {
      input.focus();
    }
  }
};

const closeSearchModal = () => {
  searchModalOpen.value = false;
  searchQuery.value = "";
  selectedResultIndex.value = -1;
};

const router = useRouter();

const selectChord = (item: any) => {
  // Navigate to chord
  router.push(`/chords/piano/${encodeURIComponent(item.key)}/${encodeURIComponent(item.key)}${encodeURIComponent(item.chord.id)}`);
  closeSearchModal();
};

const handleEnterKey = () => {
  if (selectedResultIndex.value >= 0 && selectedResultIndex.value < filteredChords.value.length) {
    selectChord(filteredChords.value[selectedResultIndex.value]);
  } else if (filteredChords.value.length > 0) {
    selectChord(filteredChords.value[0]);
  }
};

const navigateResults = (direction: number) => {
  const maxIndex = filteredChords.value.length - 1;
  selectedResultIndex.value = Math.max(-1, Math.min(maxIndex, selectedResultIndex.value + direction));
};

// Keyboard shortcut handler
const handleKeyDown = (event: KeyboardEvent) => {
  // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault();
    if (searchModalOpen.value) {
      closeSearchModal();
    } else {
      openSearchModal();
    }
  }
  // Close modal on Escape
  if (event.key === 'Escape' && searchModalOpen.value) {
    closeSearchModal();
  }
};

// Detect Mac
const detectMac = () => {
  isMac.value = /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
};

onMounted(async () => {
  await initializeChordsStore();
  detectMac();
  // Add keyboard event listener
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  // Remove keyboard event listener
  window.removeEventListener('keydown', handleKeyDown);
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

.search-icon-btn {
  transition: all 0.2s ease;
}

.search-icon-btn:hover {
  transform: scale(1.1);
}

.chord-player-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
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
    flex-direction: row;
    gap: 0.5rem;
    width: 100%;
    align-items: center;
    justify-content: center;
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

/* Search Modal Styles */
.search-modal {
  border-radius: 12px;
  overflow: hidden;
}

.search-modal-content {
  padding: 0;
  display: flex;
  flex-direction: column;
}

.search-input-wrapper {
  padding: 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.search-modal-input {
  width: 100%;
}

.search-results-container {
  max-height: 400px;
  overflow-y: auto;
}

.search-results-list {
  padding: 0;
}

.search-result-item {
  cursor: pointer;
  transition: background-color 0.15s ease;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}

.search-result-item:hover,
.search-result-active {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.search-modal-input :deep(.v-field) {
  border-radius: 0;
  box-shadow: none;
}

.search-modal-input :deep(.v-field__input) {
  padding: 1rem 1.5rem;
  font-size: 1rem;
}

.search-shortcut-hint {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  margin: 0 0.125rem;
  font-size: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  background-color: rgba(var(--v-theme-on-surface), 0.1);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 4px;
  color: rgba(var(--v-theme-on-surface), 0.7);
  min-width: 1.5rem;
  height: 1.5rem;
}

.search-result-item {
  padding: 0;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.search-result-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.search-result-content {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1rem;
  gap: 0.25rem;
}

.search-result-chord {
  font-weight: 600;
  font-size: 1rem;
  color: rgba(var(--v-theme-on-surface), 1);
}

.search-result-name {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.search-no-results,
.search-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  text-align: center;
}

.search-no-results .v-icon,
.search-empty-state .v-icon {
  font-size: 3rem;
  opacity: 0.5;
}

/* Dark Theme Modal */
.v-theme--dark {
  .search-modal {
    background-color: rgba(var(--v-theme-surface), 0.95);
    backdrop-filter: blur(20px);
  }
  
  .search-shortcut-hint {
    background-color: rgba(var(--v-theme-on-surface), 0.15);
    border-color: rgba(var(--v-theme-on-surface), 0.3);
  }
}

/* Light Theme Modal */
.v-theme--light {
  .search-modal {
    background-color: rgba(var(--v-theme-surface), 0.98);
    backdrop-filter: blur(20px);
  }
  
  .search-shortcut-hint {
    background-color: rgba(var(--v-theme-on-surface), 0.08);
    border-color: rgba(var(--v-theme-on-surface), 0.15);
  }
}

/* Tooltip kbd styling */
kbd {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  margin: 0 0.125rem;
  font-size: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  background-color: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  color: inherit;
}
</style>
