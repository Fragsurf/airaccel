<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { AirAccel } from '../game/airaccel';

const props = defineProps<{ airaccel: AirAccel }>();

const fps = ref(0);

const updateFPS = () => {
  fps.value = Math.round(props.airaccel.getEngine().getFps());
};

let intervalId: NodeJS.Timeout;

onMounted(() => {
  intervalId = setInterval(updateFPS, 1000); // Update every second
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<template>
  <div class="fps-display">
    {{ fps }} FPS
  </div>
</template>

<style scoped>
.fps-display {
  position: absolute;
  top: 10px;
  right: 10px;
  font-family: 'Roboto Mono', monospace;
  font-size: 18px;
  color: #00ff00;
  background: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 5px;
  backdrop-filter: blur(5px);
}
</style>