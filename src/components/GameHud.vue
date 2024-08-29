<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { Vector3 } from "@babylonjs/core";
  import { PlayerController } from '../game/player/playercontroller';

  const props = defineProps<{ playerController: PlayerController }>();

  const timerText = ref( '00:00.000' );
  const velocity = ref( 0 );
  const jumps = ref( 0 );
  const strafes = ref( 0 );

  const startTime = ref( 0 );
  const isRunning = ref( false );

  const startTimer = () =>
  {
    startTime.value = Date.now();
    isRunning.value = true;
  };

  const stopTimer = () =>
  {
    isRunning.value = false;
  };

  const resetTimer = () =>
  {
    startTime.value = 0;
    isRunning.value = false;
    timerText.value = '00:00.000';
  };

  const speedStage = computed( () =>
  {
    if ( velocity.value > 1000 ) return 'fast';
    if ( velocity.value > 500 ) return 'medium';
    return 'normal';
  } );

  const updateHUD = () =>
  {
    if ( isRunning.value )
    {
      const elapsedTime = Date.now() - startTime.value;
      const minutes = Math.floor( elapsedTime / 60000 );
      const seconds = Math.floor( ( elapsedTime % 60000 ) / 1000 );
      const milliseconds = elapsedTime % 1000;
      timerText.value = `${ minutes.toString().padStart( 2, '0' ) }:${ seconds.toString().padStart( 2, '0' ) }.${ milliseconds.toString().padStart( 3, '0' ) }`;
    }

    const playerVelocity = props.playerController.velocity;
    const horizontalVelocity = new Vector3( playerVelocity.x, 0, playerVelocity.z );
    velocity.value = Math.floor( horizontalVelocity.length() / 0.0254 );

    jumps.value = 0;
    strafes.value = 0;
    //jumps.value = props.playerController.jumps || 0;
    //strafes.value = props.playerController.strafes || 0;
  };

  let intervalId: NodeJS.Timeout;

  onMounted( () =>
  {
    intervalId = setInterval( updateHUD, 16 ); // Update at ~60fps
  } );

  onUnmounted( () =>
  {
    clearInterval( intervalId );
  } );

  watch( () => props.playerController, updateHUD, { deep: true } );
</script>

<template>
  <div id="game-hud" :class=" speedStage ">
    <div class="hud-element timer">{{ timerText }}</div>
    <div class="hud-element velocity">{{ velocity }} u/s</div>
    <div class="hud-element stats">
      <span class="stat">Jumps: {{ jumps }}</span>
      <span class="stat">Strafes: {{ strafes }}</span>
    </div>
    <div class="crosshair"></div>
  </div>
</template>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto+Mono&display=swap');

  #game-hud {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    font-family: 'Orbitron', sans-serif;
    color: #00ffff;
    transition: all 0.3s ease;
  }

  .hud-element {
    position: absolute;
    border-radius: 10px;
    padding: 10px;
    backdrop-filter: blur(5px);
    transition: all 0.3s ease;
  }

  .timer {
    top: 5%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 36px;
    font-weight: 700;
    letter-spacing: 2px;
  }

  .velocity {
    bottom: 15%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 28px;
    font-weight: 700;
  }

  .stats {
    bottom: 5%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 20px;
    display: flex;
    gap: 20px;
  }

  .stat {
    padding: 5px 10px;
    border-radius: 5px;
    transition: all 0.3s ease;
  }

  .crosshair {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    background: rgba(0, 255, 255, 0.7);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.3s ease;
  }

  /* Speed stages */
  #game-hud.normal {
    --hud-color: #00ffff;
  }

  #game-hud.medium {
    --hud-color: #ffff00;
  }

  #game-hud.fast {
    --hud-color: #ff3300;
  }

  #game-hud .hud-element {
    color: var(--hud-color);
    text-shadow: 0 0 10px var(--hud-color), 2px 2px 1px black;
  }

  .crosshair::before,
  .crosshair::after {
    content: '';
    position: absolute;
    background: var(--hud-color);
  }

  .crosshair::before {
    width: 2px;
    height: 20px;
    left: 2px;
    top: -7px;
  }

  .crosshair::after {
    width: 20px;
    height: 2px;
    left: -7px;
    top: 2px;
  }

  @keyframes pulse {

    0%,
    100% {
      opacity: 0.7;
      transform: translateX(-50%) scale(1);
    }

    50% {
      opacity: 1;
      transform: translateX(-50%) scale(1.05);
    }
  }

  #game-hud.medium .velocity {
    animation: pulse 1.5s ease-in-out infinite;
  }

  #game-hud.fast .velocity {
    animation: pulse 0.75s ease-in-out infinite;
  }
</style>