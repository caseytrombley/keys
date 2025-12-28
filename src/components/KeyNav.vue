<script setup lang="ts">
import { defineProps, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  activeKey: {
    type: String,
    required: false,
  },
  collapsible: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const route = useRoute()

// Check if we're on a detail page (has /piano/ in the path)
const isDetailPage = ref(false)
// Check if mobile - collapsed by default on mobile
const checkIsMobile = () => typeof window !== 'undefined' && window.innerWidth < 768
// Initialize as collapsed on mobile, expanded on desktop
const isExpanded = ref(!checkIsMobile())

onMounted(() => {
  // Check if we're on a detail page
  isDetailPage.value = route.path.includes('/piano/')

  // On detail pages with collapsible enabled, collapse by default on mobile
  if (isDetailPage.value && props.collapsible) {
    // Collapse on mobile, expand on desktop
    isExpanded.value = !checkIsMobile()
  } else if (!props.collapsible) {
    // If not collapsible, always expanded
    isExpanded.value = true
  }
})

const goToKeyPage = (selectedKey: string) => {
  router.push(`/chords/${encodeURIComponent(selectedKey)}`)
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <v-container max-width="1200px" fluid class="container px-3">
    <div class="key-nav-wrapper">
      <!-- Toggle button - only show on detail pages when collapsible -->
      <div v-if="collapsible && isDetailPage" class="key-nav-toggle">
        <v-btn icon variant="text" size="small" @click="toggleExpanded" class="toggle-btn">
          <v-icon>{{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
        <span v-if="!isExpanded" class="toggle-label" @click="toggleExpanded"> All Keys </span>
      </div>

      <!-- Key navigation -->
      <div class="key-nav" :class="{ collapsed: !isExpanded && collapsible && isDetailPage }">
        <v-btn
          v-for="key in ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']"
          :key="key"
          @click="goToKeyPage(key)"
          :class="{ active: key === activeKey }"
          flat
          variant="text"
          size="large"
        >
          {{ key }}
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<style lang="scss" scoped>
.container {
  padding: 0;
}

.key-nav-wrapper {
  position: relative;
  margin: 2rem 0 0;
}

.key-nav-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;

  .toggle-btn {
    min-width: auto;
    width: 32px;
    height: 32px;
  }

  .toggle-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(var(--v-theme-on-surface), 0.7);
    user-select: none;
  }
}

.key-nav {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  justify-content: center;
  padding: 1.5rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  overflow: hidden;
  max-height: 500px;
  opacity: 1;
}

.key-nav.collapsed {
  max-height: 0;
  padding: 0 1.5rem;
  margin: 0;
  opacity: 0;
  pointer-events: none;
}

@media (min-width: 600px) {
  .key-nav {
    grid-template-columns: repeat(6, 1fr);
  }

  .key-nav.collapsed {
    max-height: 0;
    padding: 0 1.5rem;
  }
}

@media (min-width: 1000px) {
  .key-nav {
    display: flex;
    justify-content: space-around;
    gap: 0.5rem;
    border-radius: 50em;
  }

  .key-nav.collapsed {
    max-height: 0;
    padding: 0;
  }
}

.v-btn {
  flex: 0 0 auto;
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  border-radius: 50em;
}

/* Mobile-specific: Hide toggle on non-detail pages or when not collapsible */
@media (max-width: 767px) {
  .key-nav-toggle {
    display: flex;
  }
}

@media (min-width: 768px) {
  .key-nav-toggle {
    display: none;
  }

  .key-nav.collapsed {
    max-height: 500px;
    opacity: 1;
    padding: 1.5rem;
    pointer-events: auto;
  }
}

/* Dark Theme */
.v-theme--dark {
  .key-nav {
    background-color: rgba(0, 0, 0, 0.75);
  }
  .active {
    background-color: rgba(var(--v-theme-secondary), 0.3);
  }

  .key-nav-toggle .toggle-label {
    color: rgba(var(--v-theme-on-surface), 0.7);
  }
}

/* Light Theme */
.v-theme--light {
  .key-nav {
    background-color: #ffe0b0;
  }
  .active {
    background-color: rgba(var(--v-theme-secondary), 0.5);
  }

  .key-nav-toggle .toggle-label {
    color: rgba(var(--v-theme-on-surface), 0.7);
  }
}
</style>
