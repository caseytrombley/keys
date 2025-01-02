<template>
  <div class="piano">
    <!-- Piano keys -->
    <div class="keys">
      <div
        v-for="(key, index) in keys"
        :key="`${key.note}${key.octave}`"
        class="key"
        ref="pianoKeys"
        :class="{ black: key.note.includes('#') }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { gsap } from "gsap";

// Keys definition
const keys = [
  { note: "C", octave: 3 },
  { note: "C#", octave: 3 },
  { note: "D", octave: 3 },
  { note: "D#", octave: 3 },
  { note: "E", octave: 3 },
  { note: "F", octave: 3 },
  { note: "F#", octave: 3 },
  { note: "G", octave: 3 },
  { note: "G#", octave: 3 },
  { note: "A", octave: 3 },
  { note: "A#", octave: 3 },
  { note: "B", octave: 3 }
];

const activeKeyIndex = ref(0);
let interval: ReturnType<typeof setInterval> | null = null;

// Reference to piano keys
const pianoKeys = ref<HTMLDivElement[]>([]);

// Function to update the active key index
const updateActiveKey = () => {
  const currentIndex = activeKeyIndex.value;
  activeKeyIndex.value = (currentIndex + 1) % keys.length;

  // Animate the active key
  animateKeyTransition(currentIndex, activeKeyIndex.value);
};

// GSAP Animation for Key Transition
const animateKeyTransition = (oldIndex: number, newIndex: number) => {
  const oldKey = pianoKeys.value[oldIndex];
  const newKey = pianoKeys.value[newIndex];

  // Reset the old key (both black and white keys)
  gsap.to(oldKey, {
    backgroundColor: oldKey.classList.contains("black") ? "black" : "rgba(255, 255, 255, 1)",
    y: 0,
    duration: 0.5,
    ease: "power2.out"
  });

  // Highlight the new key with different animations for black and white keys
  if (newKey.classList.contains("black")) {
    gsap.to(newKey, {
      backgroundColor: "rgba(255, 0, 0, 1)", // Different color for black keys
      y: -10,
      duration: 0.4,
      ease: "elastic.out(1, 0.3)"
    });
  } else {
    gsap.to(newKey, {
      backgroundColor: "rgba(255, 200, 0, 1)", // Different color for white keys
      y: -15,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)"
    });
  }
};

// Start the animation on mount
onMounted(() => {
  interval = setInterval(updateActiveKey, 100); // Adjust interval as needed

  // Collect references to all keys
  pianoKeys.value = document.querySelectorAll(".key") as unknown as HTMLDivElement[];
});

// Cleanup on unmount
onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>



<style lang="scss" scoped>
.piano {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.keys {
  display: flex;
  position: relative;
}

.key {
  width: 30px;
  height: 180px;
  background-color: rgba(255, 255, 255, 1);
  margin: 0 1px;
  transition: background-color 0.3s ease, transform 0.3s ease;
  border-radius: 4px;
  //box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.2);

  &.black {
    width: 20px;
    height: 100px;
    background-color: black;
    margin: 0 -10px;
    z-index: 1;
  }
  //
  //&.active {
  //  background-color: rgba(255, 200, 0, 1);
  //  transform: translateY(-15px);
  //  //box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.4);
  //}
}
</style>
