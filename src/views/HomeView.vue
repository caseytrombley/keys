<script setup lang="ts">
import KeyNav from "../components/KeyNav.vue";
import ChordsList from "../components/ChordsList.vue";
import backgroundImage from '../assets/images/pexels-danielspase-734918.jpg';
//import backgroundImage from '../assets/images/pexels-bryan-geraldo-184369-586415.jpg';
</script>

<template>
  <KeyNav />
  <div class="intro" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <v-container max-width="1200px" fluid class="container">
      <h1>Explore Piano Chords</h1>
      <p>
        Unlock the world of piano chords and their underlying theory. Whether you're using a piano, keyboard, or synthesizer, this site offers an easy way to explore different chords by key/note and category. Each chord comes with clear visuals and concise explanations to enhance your learning experience and broaden your musical knowledge.
      </p>
    </v-container>
  </div>
  <ChordsList :enableAutocomplete="true" />
</template>

<style lang="scss" scoped>
.intro {
  position: relative;
  margin: 2rem 0;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  background-blend-mode: overlay;
  .container {
    padding: 3rem 2rem;
    position: relative;
    z-index: 1;
  }
  h1 {
    font-size: 2rem;
  }
  p {
    font-size: 1.125rem;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 0;
  }
}

/* Dark Theme */
.v-theme--dark {
  .intro {
    background-color: rgba(var(--v-theme-secondary), 0.3);
    border-bottom: 2rem solid rgba(var(--v-theme-secondary), 0.05);
  }
}

/* Light Theme */
.v-theme--light {
  .intro {
    background-color: #ffe0b0;
    border-bottom: 2rem solid rgba(255, 235, 182, 0.05);
    &::before {
      background-color: rgba(255,255,255, 0.6);
    }
  }
}
</style>
