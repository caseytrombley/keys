import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePianoStore = defineStore('piano', () => {
  const selectedInstrument = ref<string>('piano');
  const tempo = ref<number>(120);

  return {
    selectedInstrument,
    tempo
  };
});
