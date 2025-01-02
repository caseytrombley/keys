<template>
  <div class="loader">
    <div class="piano">
      <!-- Piano keys -->
      <div class="keys">
        <div class="key" :data-order="1"></div>
        <div class="key black" :data-order="2"></div>
        <div class="key" :data-order="3"></div>
        <div class="key black" :data-order="4"></div>
        <div class="key" :data-order="5"></div>
        <div class="key" :data-order="6"></div>
        <div class="key black" :data-order="7"></div>
        <div class="key" :data-order="8"></div>
        <div class="key black" :data-order="9"></div>
        <div class="key" :data-order="10"></div>
        <div class="key black" :data-order="11"></div>
        <div class="key" :data-order="12"></div>
      </div>
    </div>
    <div class="dots">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.loader {
  padding: 2rem;
  min-height: 100vh;
  transform: scale(1.5) translateY(200px);
}
.piano {
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: skewX(-10deg) rotate(-5deg);
}

.dots {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dot {
  width: 10px;
  height: 10px;
  margin: 0 5px;
  border-radius: 50%;
  background-color: white;
  opacity: 0;
  animation: dotAnimation 1.5s infinite;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.5s;
}

.dot:nth-child(3) {
  animation-delay: 1s;
}

.keys {
  display: flex;
  position: relative;
}

.key {
  width: 40px;
  height: 200px;
  background-color: rgba(255, 255, 255, 1);
  margin: 0 1px;
  transition: background-color 0.3s ease, transform 0.3s ease;
  border-radius: 4px;
  animation: 1.4s press infinite ease-in-out;
}

.key.black {
  width: 30px;
  height: 120px;
  background-color: black;
  margin: 0 -15px;
  z-index: 1;
}


/* Dark Theme */
.v-theme--dark {
  .key {
    background-color: rgba(var(--v-theme-secondary), 0.1);
    &.black {
      background-color: #121212;
    }
  }
  .dot {
    background-color: rgba(var(--v-theme-secondary), 0.3);
  }
}

/* Light Theme */
.v-theme--light {
  .key {
    background-color: #fff2df;
    &.black {
      background-color: #fece7e;
    }
  }
  .dot {
    background-color: #fece7e;
  }
}

.key[data-order="1"] {
  animation-delay: -1.4s;
}
.key[data-order="2"] {
  animation-delay: -1.2s;
}
.key[data-order="3"] {
  animation-delay: -1s;
}
.key[data-order="4"] {
  animation-delay: -0.8s;
}
.key[data-order="5"] {
  animation-delay: -0.6s;
}
.key[data-order="6"] {
  animation-delay: -0.4s;
}
.key[data-order="7"] {
  animation-delay: -0.2s;
}
.key[data-order="8"] {
  animation-delay: 0s;
}
.key[data-order="9"] {
  animation-delay: 0.2s;
}
.key[data-order="10"] {
  animation-delay: 0.4s;
}
.key[data-order="11"] {
  animation-delay: 0.6s;
}
.key[data-order="12"] {
  animation-delay: 0.8s;
}

@keyframes press {
  0%, 40%, 100% {
    transform: translateY(0px);
  }

  10% {
    transform: translateY(6px);
  }
}

@keyframes dotAnimation {
  0%, 100% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}
</style>
