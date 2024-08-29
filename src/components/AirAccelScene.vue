<template>
    <div class="airaccel-app">
        <canvas id="renderCanvas" ref="bjsCanvas" />
        <AirAccelInterface v-if="isInitialized && app" :airaccel="app" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import { AirAccel } from '../game/airaccel';
import AirAccelInterface from './AirAccelInterface.vue';

const bjsCanvas = ref<HTMLCanvasElement | null>(null);
const app = shallowRef<AirAccel | null>(null);
const isInitialized = ref(false);

onMounted(async () => {
    if (bjsCanvas.value) {
        app.value = new AirAccel(bjsCanvas.value);
        await app.value.initialize();
        isInitialized.value = true;
    }
});
</script>

<style scoped>
.airaccel-app {
    width: 100%;
    height: 100%;
}

#renderCanvas {
    width: 100%;
    height: 100%;
}
</style>