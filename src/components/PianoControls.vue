<script setup lang="ts">
import { usePianoStore } from '../stores/pianoStore';
import { computed, ref } from 'vue';

const pianoStore = usePianoStore();

const instruments = [
  { value: 'piano', label: 'Triangle Synth', icon: 'mdi-sine-wave' },
  { value: 'organ', label: 'Sine Synth', icon: 'mdi-sine-wave' },
  { value: 'synth', label: 'Square Synth', icon: 'mdi-square-wave' },
  { value: 'electricPiano', label: 'Sawtooth Synth', icon: 'mdi-sawtooth-wave' },
  { value: 'bass', label: 'Sawtooth Synth 2', icon: 'mdi-sawtooth-wave' }
];

const currentInstrumentIndex = computed(() => {
  return instruments.findIndex(i => i.value === pianoStore.selectedInstrument);
});

const currentInstrument = computed(() => {
  return instruments[currentInstrumentIndex.value] || instruments[0];
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

const isDragging = ref(false);
const dragStartY = ref(0);
const dragStartVolume = ref(0);

const startVolumeDrag = (e: MouseEvent | TouchEvent) => {
  e.preventDefault();
  isDragging.value = true;
  
  // Store initial position and volume
  const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  dragStartY.value = startY;
  dragStartVolume.value = pianoStore.volume;
  
  const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
    if (!isDragging.value) return;
    
    const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
    const deltaY = dragStartY.value - currentY; // Positive = up = increase volume
    
    // Use a larger pixel range for less sensitivity (120px = full range)
    const maxDelta = 120;
    const volumeRange = 60; // -60 to 0 dB
    
    // Calculate change from starting volume
    const volumeChange = (deltaY / maxDelta) * volumeRange;
    const newVolume = Math.max(-60, Math.min(0, dragStartVolume.value + volumeChange));
    pianoStore.volume = Math.round(newVolume);
  };
  
  const handleEnd = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('touchend', handleEnd);
  };
  
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleEnd);
  document.addEventListener('touchmove', handleMove);
  document.addEventListener('touchend', handleEnd);
};
</script>

<template>
  <v-container max-width="1200px" fluid class="piano-controls-container">
    <div class="piano-controls">
      <!-- Volume Control -->
      <div class="control-item volume-control">
        <div class="control-label">
          <v-icon size="small" class="mr-1">mdi-volume-high</v-icon>
          <span>Volume</span>
        </div>
        <div class="volume-knob-wrapper">
          <div 
            class="volume-knob" 
            :style="{ '--rotation': `${270 + ((pianoStore.volume ?? 0) + 60) * 3}deg` }"
            @mousedown="startVolumeDrag"
            @touchstart="startVolumeDrag"
          >
            <div class="knob-indicator"></div>
          </div>
          <div class="knob-value">{{ Math.max(0, Math.min(100, Math.round((((pianoStore.volume ?? 0) + 60) / 60) * 100))) }}%</div>
        </div>
      </div>

      <!-- Sound/Instrument Control -->
      <div class="control-item">
        <div class="control-label">
          <v-icon size="small" class="mr-1">mdi-music-note</v-icon>
          <span>Sound</span>
        </div>
        <div class="instrument-control">
          <v-btn
            icon
            variant="text"
            size="small"
            :disabled="currentInstrumentIndex === 0"
            @click="previousInstrument"
            class="nav-btn"
          >
            <v-icon size="small">mdi-chevron-left</v-icon>
          </v-btn>
          
          <div class="instrument-display">
            <v-icon size="small" class="instrument-icon">{{ currentInstrument.icon }}</v-icon>
            <span class="instrument-name">{{ currentInstrument.label }}</span>
          </div>
          
          <v-btn
            icon
            variant="text"
            size="small"
            :disabled="currentInstrumentIndex === instruments.length - 1"
            @click="nextInstrument"
            class="nav-btn"
          >
            <v-icon size="small">mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Tempo Control -->
      <div class="control-item">
        <div class="control-label">
          <v-icon size="small" class="mr-1">mdi-metronome</v-icon>
          <span>Tempo</span>
        </div>
        <div class="tempo-control">
          <span class="tempo-value">{{ pianoStore.tempo }}</span>
          <span class="tempo-unit">BPM</span>
          <v-slider
            v-model="pianoStore.tempo"
            :min="40"
            :max="240"
            :step="5"
            hide-details
            class="tempo-slider"
            color="primary"
          />
        </div>
      </div>
    </div>
  </v-container>
</template>

<style scoped lang="scss">
.piano-controls-container {
  padding: 0 1rem;
  margin-top: 1rem;
}

.piano-controls {
  display: flex;
  gap: 1.5rem;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: flex-start;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 200px;
  flex: 1;
  max-width: 300px;
}

.volume-control {
  min-width: 110px;
  max-width: 130px;
  flex: 0 0 auto;
  align-items: center;
}

.volume-knob-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background-color: rgba(var(--v-theme-surface), 0.5);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  width: 100%;
  min-height: 48px;
  
  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.3);
    background-color: rgba(var(--v-theme-surface), 0.8);
  }
}

.volume-knob {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    rgba(var(--v-theme-surface), 0.95) 0%, 
    rgba(var(--v-theme-on-surface), 0.15) 100%);
  border: 2px solid rgba(var(--v-theme-on-surface), 0.2);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
  flex-shrink: 0;
  
  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.5);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.knob-indicator {
  position: absolute;
  top: 3px;
  left: 50%;
  transform: translateX(-50%) rotate(var(--rotation));
  transform-origin: center 17px;
  width: 3px;
  height: 7px;
  background-color: rgba(var(--v-theme-primary), 1);
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: transform 0.1s ease;
}

.knob-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(var(--v-theme-primary), 1);
  user-select: none;
  flex: 1;
  text-align: left;
  line-height: 1;
  min-width: 45px;
}

.control-label {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.instrument-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: rgba(var(--v-theme-surface), 0.5);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.3);
    background-color: rgba(var(--v-theme-surface), 0.8);
  }
}

.nav-btn {
  flex-shrink: 0;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.3;
  }
}

.instrument-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  min-height: 32px;
}

.instrument-icon {
  color: rgba(var(--v-theme-primary), 0.8);
}

.instrument-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 1);
  user-select: none;
}

.tempo-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background-color: rgba(var(--v-theme-surface), 0.5);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.3);
    background-color: rgba(var(--v-theme-surface), 0.8);
  }
}

.tempo-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(var(--v-theme-primary), 1);
  min-width: 45px;
  text-align: right;
}

.tempo-unit {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tempo-slider {
  flex: 1;
  margin: 0;
}

/* Dark Theme */
.v-theme--dark {
  .piano-controls {
    background-color: rgba(var(--v-theme-surface), 0.6);
    border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  }
}

/* Light Theme */
.v-theme--light {
  .piano-controls {
    background-color: rgba(var(--v-theme-surface), 0.8);
    border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  }
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .piano-controls-container {
    padding: 0 0.75rem;
  }
  
  .piano-controls {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem;
  }
  
  .control-item {
    min-width: calc(50% - 0.5rem);
    max-width: calc(50% - 0.5rem);
  }
  
  .volume-control {
    min-width: 100%;
    max-width: 100%;
  }
  
  .volume-knob-wrapper {
    justify-content: center;
  }
  
  .tempo-control {
    flex-wrap: wrap;
  }
  
  .tempo-value {
    font-size: 1.125rem;
  }
  
  .instrument-display {
    min-height: 28px;
  }
  
  .instrument-name {
    font-size: 0.875rem;
  }
}

@media (max-width: 400px) {
  .piano-controls {
    padding: 0.75rem;
    gap: 1rem;
  }
  
  .control-label {
    font-size: 0.75rem;
  }
}
</style>
