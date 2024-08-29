<template>
  <AirAccelScene />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AirAccelScene from './components/AirAccelScene.vue';

export default defineComponent({
  name: 'App',
  components: {
    AirAccelScene,
  },
});
</script>

<style>
#app {
  width: 100%;
  height: 100%;
}
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>