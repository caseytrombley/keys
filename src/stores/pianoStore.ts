import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePianoStore = defineStore('piano', () => {
  const selectedInstrument = ref<string>('piano');
  const tempo = ref<number>(120);
  const volume = ref<number>(-15); // Volume in dB, 0 = full volume, -15 = 75% volume

  return {
    selectedInstrument,
    tempo,
    volume
  };
});
