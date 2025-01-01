<script setup lang="ts">
import { defineProps } from 'vue';
import { getOrdinalSuffix } from "../utils/ordinal";


// Destructure the props object
const props = defineProps({
  inversion: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: true
  },
});
</script>

<template>
  <div class="inversion-header">
    <v-container max-width="1200px" fluid class="container">
      <!-- 4 Column Grid -->
      <div class="chord-details">
        <div class="name">
          <div class="label d-none">Name</div>
          <h3>{{ title }}</h3>
        </div>

        <div>
          <div class="label">Notes</div>
          <p>{{ inversion?.notes?.join(', ') }}</p>
        </div>
        <div>
          <div class="label">Intervals</div>
          <p>{{ inversion?.intervals?.join(', ') }}</p>
        </div>
      </div>
    </v-container>
  </div>
</template>

<style lang="scss" scoped>
.inversion-header {
  .container {
    display: flex;
    justify-content: center;
    flex-direction: column;
  }
}

h3 {
  display: inline-block;
  font-size: 1.5rem;
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
  //.chord-details {
  //  > div {
  //    background-color: #1e1e1e;
  //  }
  //  .name {
  //    background-color: rgba(var(--v-theme-secondary), 0.1);
  //  }
  //}

  h3 {
    //background-color: rgba(var(--v-theme-secondary), 0.3);
    border-bottom: 8px solid rgba(var(--v-theme-secondary), 0.3);
  }
}

/* Light Theme */
.v-theme--light {
  //.chord-details {
  //  > div {
  //    background-color: rgb(255, 235, 182);
  //  }
  //  .name {
  //    background-color: rgba(var(--v-theme-secondary), 0.4);
  //  }
  //}

  h3 {
    //background-color: rgb(255, 235, 182);
    border-bottom: 8px solid rgb(255, 235, 182);
  }
}
</style>
