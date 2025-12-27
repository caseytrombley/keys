import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePianoStore = defineStore('piano', () => {
  const selectedInstrument = ref<string>('piano');
  const tempo = ref<number>(120);
  const volume = ref<number>(0); // Volume in dB, 0 = full volume, negative values reduce volume

  return {
    selectedInstrument,
    tempo,
    volume
  };
});
