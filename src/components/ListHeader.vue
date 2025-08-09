<script setup lang="ts">
import { defineProps } from 'vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  pre: {
    type: String,
    required: false
  },
});

</script>

<template>
  <div class="detail-header">
    <v-container max-width="1200px" fluid class="detail-container">
      <h3>
        <div v-if="pre" class="pre">{{ pre }}</div>
        <div class="key-name">{{ title }}</div>
        <slot />
      </h3>
    </v-container>
  </div>
</template>

<style lang="scss" scoped>
.detail-header {
  display: block;
  text-align: center;
  padding: 1rem 0 0;
}
h3 {
  display: inline-block;
  padding: 0 .25rem .5rem;
  font-weight: 400;
  font-style: normal;
  font-size: 1rem;
}
.pre {
  font-weight: 400;
  padding: .5rem 1rem;
  margin: 0 0 .25rem;
  //border-radius: 50em;
  line-height: 1;
}
.key-name {
  font-weight: 800;
  font-style: normal;
  font-size: 3em;
  line-height: 1.05;
}

/* Dark Theme */
.v-theme--dark {
  .pre {
    background: #1e1e1e;
    color: rgba(var(--v-theme-secondary), 0.3);
  }
  h3 {
    //background-color: rgba(var(--v-theme-secondary), 0.3);
    border-bottom: 8px solid rgba(var(--v-theme-secondary), 0.3);
  }
}

/* Light Theme */
.v-theme--light {
  .pre {
    background: #ffe0b0;
    color: rgb(33, 32, 30);
  }
  h3 {
    //background-color: rgb(255, 235, 182);
    border-bottom: 8px solid rgb(255, 235, 182);
  }
}


</style>
