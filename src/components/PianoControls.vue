<script setup lang="ts">
import { usePianoStore } from '../stores/pianoStore';
import { computed } from 'vue';

const pianoStore = usePianoStore();

const instruments = [
  { value: 'piano', label: 'Triangle Synth' },
  { value: 'organ', label: 'Sine Synth' },
  { value: 'synth', label: 'Square Synth' },
  { value: 'electricPiano', label: 'Sawtooth Synth' },
  { value: 'bass', label: 'Sawtooth Synth 2' }
];

const currentInstrumentIndex = computed(() => {
  return instruments.findIndex(i => i.value === pianoStore.selectedInstrument);
});

const currentInstrumentLabel = computed(() => {
  return instruments[currentInstrumentIndex.value]?.label || 'Triangle Synth';
});

const previousInstrument = () => {
  const newIndex = currentInstrumentIndex.value - 1;
  if (newIndex >= 0) {
    pianoStore.selectedInstrument = instruments[newIndex].value;
  }
};

const nextInstrument = () => {
  const newIndex = currentInstrumentIndex.value + 1;
  if (newIndex < instruments.length) {
    pianoStore.selectedInstrument = instruments[newIndex].value;
  }
};
</script>

<template>
  <div class="piano-controls">
    <div class="control-group">
      <label>Sound:</label>
      <div class="instrument-selector">
        <button
          class="arrow-btn"
          @click="previousInstrument"
          :disabled="currentInstrumentIndex === 0"
          aria-label="Previous instrument"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <div class="instrument-display">
          {{ currentInstrumentLabel }}
        </div>

        <button
          class="arrow-btn"
          @click="nextInstrument"
          :disabled="currentInstrumentIndex === instruments.length - 1"
          aria-label="Next instrument"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="control-group">
      <label for="tempo-input">Tempo: {{ pianoStore.tempo }} BPM</label>
      <input
        id="tempo-input"
        type="range"
        v-model.number="pianoStore.tempo"
        min="40"
        max="240"
        step="5"
        class="tempo-slider"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.piano-controls {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 15px;
  background: #333333;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 0 auto 20px;
  width: fit-content;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;

  label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #999;
  }
}

.instrument-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border-radius: 6px;
  padding: 4px 8px;
  border: 2px solid #ddd;
  transition: border-color 0.2s;

  &:hover {
    border-color: #4CAF50;
  }

  &:focus-within {
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }
}

.instrument-display {
  min-width: 140px;
  padding: 4px 8px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  user-select: none;
}

.arrow-btn {
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border-radius: 4px;

  &:hover:not(:disabled) {
    background: #f0f0f0;
    color: #4CAF50;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  svg {
    display: block;
  }
}

.tempo-slider {
  width: 200px;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4CAF50;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #45a049;
    }
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4CAF50;
    cursor: pointer;
    border: none;
    transition: background 0.2s;

    &:hover {
      background: #45a049;
    }
  }
}

@media (max-width: 459px) {
  .piano-controls {
    gap: 15px;
    padding: 10px;
  }

  .tempo-slider {
    width: 150px;
  }

  .instrument-display {
    min-width: 120px;
    font-size: 0.85rem;
  }
}
</style>
