<script setup lang="ts">
import { defineProps } from 'vue';

// Destructure the props object
const props = defineProps({
  chord: {
    type: Object,
    required: true,
  },
  baseKey: {
    type: String,
    required: false
  },
});
</script>

<template>
  <div class="chord-header">
    <v-container max-width="1200px" fluid class="container">
      <!-- 4 Column Grid -->
      <div class="chord-details">
        <div class="name">
          <div class="label d-none">Name</div>
          <h3>{{ baseKey }}{{ chord?.id }}</h3>
        </div>
        <div>
          <div class="label">Type</div>
          <p>{{ chord?.type }}</p>
        </div>
        <div>
          <div class="label">Notes</div>
          <p>{{ chord?.notes?.join(', ') }}</p>
        </div>
        <div>
          <div class="label">Intervals</div>
          <p>{{ chord?.intervals?.join(', ') }}</p>
        </div>
      </div>
    </v-container>
  </div>
</template>

<style lang="scss" scoped>
.chord-header {
  .container {
    display: flex;
    justify-content: center;
    flex-direction: column;
  }
}

h3 {
  display: inline-block;
  text-align: left;
  font-size: 1.5rem;
  border-bottom: 8px solid transparent;
}

.chord-details {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: .5rem;
  > div {
    padding: 1rem;
    border-radius: 4px;
    text-align: center;
  }
  .label {
    font-size: .75em;
  }
}

/* Dark Theme */
.v-theme--dark {
  h3 {
    border-color: rgba(var(--v-theme-secondary), 0.3);
  }
}

/* Light Theme */
.v-theme--light {
  h3 {
    border-color: #ffe0b0;
  }
}
</style>
