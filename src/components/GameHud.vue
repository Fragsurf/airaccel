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
  <div id="game-hud" :class=" [ speedStage ] ">
    <div class="timer hud-element">{{ timerText }}</div>
    <div class="velocity hud-element" :class=" { 'pulse-element': speedStage !== 'normal' } ">
      <span class="velocity-label">Speed</span>
      <span class="velocity-value">{{ velocity }}</span>
      <span class="velocity-unit">u/s</span>
    </div>
    <div class="stats hud-element">
      <span class="stat">Jumps: {{ jumps }}</span>
      <span class="stat">Strafes: {{ strafes }}</span>
    </div>
    <div class="crosshair"></div>
  </div>
</template>

<style scoped lang="scss">
  @import "./styles.scss";

  #game-hud {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    font-family: $font-primary;
    color: $color-text;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding: 20px;
  }

  .timer {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 48px;
    font-weight: 300;
    letter-spacing: 2px;
    padding: 10px 20px;
    background: none;
    border: none;
    text-shadow: 0 0 10px rgba($color-primary, 0.5);
  }

  .bottom-hud {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 800px;
    margin-bottom: 20px;
  }

  .velocity {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 15px;

    .velocity-label {
      font-size: 12px;
      text-transform: uppercase;
      opacity: 0.7;
      letter-spacing: 1px;
    }

    .velocity-value {
      font-size: 36px;
      font-weight: 700;
      line-height: 1;
    }

    .velocity-unit {
      font-size: 12px;
      opacity: 0.7;
    }
  }

  .stats {
    display: flex;
    gap: 20px;

    .stat {
      font-size: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .stat-label {
        font-size: 12px;
        text-transform: uppercase;
        opacity: 0.7;
        letter-spacing: 1px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 700;
      }
    }
  }

  .crosshair {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4px;
    height: 4px;
    background: $color-primary;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.7;

    &::before,
    &::after {
      content: '';
      position: absolute;
      background: $color-primary;
    }

    &::before {
      width: 1px;
      height: 16px;
      left: 1.5px;
      top: -6px;
    }

    &::after {
      width: 16px;
      height: 1px;
      left: -6px;
      top: 1.5px;
    }
  }

  // Speed stages
  #game-hud {
    &.normal {
      --speed-color: #{$color-primary};
    }

    &.medium {
      --speed-color: #{mix($color-primary, $color-secondary, 25%)};
    }

    &.fast {
      --speed-color: #{$color-secondary};
    }

    .velocity {
      .velocity-value {
        color: var(--speed-color);
        text-shadow: 0 0 10px var(--speed-color), 2px 2px 1px black;
      }
    }
  }
</style>