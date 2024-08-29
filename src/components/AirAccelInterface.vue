<script setup lang="ts">
import { ref } from 'vue';
import FPSCounter from './FPSCounter.vue';
import GameHUD from './GameHud.vue';
import { AirAccel } from '../game/airaccel';

const props = defineProps<{ airaccel: AirAccel }>();
</script>

<template>
  <div class="main-ui">
    <FPSCounter :airaccel="airaccel" />
    <GameHUD :playerController="airaccel.getPlayerController()" />
  </div>
</template>

<style scoped>
.main-ui {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Position the FPS component */
:deep(.fps-container) {
  position: absolute;
  top: 10px;
  left: 10px;
}
</style>