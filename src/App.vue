<template>
  <div id="app" class="dark-theme">
    <header>
      <nav>
        <router-link to="/" class="logo">
          <img src="/images/airaccel_logo_3.png" alt="AIRACCEL Logo" class="game-logo" />
        </router-link>
        <div class="nav-links">
          <router-link to="/" exact>Home</router-link>
          <router-link :class="{ disabled: true }" to="/news">News</router-link>
          <router-link :class="{ disabled: true }" to="/maps">Maps</router-link>
          <router-link :class="{ disabled: true }" to="/leaderboards">Leaderboards</router-link>
          <router-link :class="{ disabled: true }" to="/graybox">Level Editor</router-link>
          <button @click=" openAirAccelScene " class="play-button">Play Now</button>
        </div>
      </nav>
    </header>

    <main>
      <router-view></router-view>
    </main>

    <footer>
      <p>&copy; 2024 {{ gameTitle }}. All rights reserved.</p>
    </footer>

    <Modal v-if=" showAirAccelScene " @close=" closeAirAccelScene ">
      <AirAccelScene />
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import AirAccelScene from './components/AirAccelScene.vue';
  import Modal from './components/Modal.vue';

  const gameTitle = 'AIRACCEL';
  const showAirAccelScene = ref( false );

  const openAirAccelScene = () =>
  {
    showAirAccelScene.value = true;
  };

  const closeAirAccelScene = () =>
  {
    showAirAccelScene.value = false;
  };
</script>

<style lang="scss">
@import './styles/variables';

body {
  margin: 0;
  padding: 0;
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}

#app {
  font-family: $font-family;
  @include smooth-text;
  color: $color-text;
  background-color: $color-background;

  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &:before {
    content: '';
    background-image: radial-gradient(circle at top left, rgba($color-accent, 0.03) 0%, $color-background 50%);
    background-size: 100%;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

header {
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 1000;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: $max-width;
  margin: 0 auto;
  padding: 0.5rem 1rem;
}

.logo {
  font-weight: bold;
  color: $color-accent;
  text-decoration: none;

  img {
    width: 64px;
    height: 64px;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
}

.nav-links {
  display: flex;
  gap: 1rem;

  a {
    color: $color-text;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.3s ease;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 2px;
      background-color: $color-accent;
      transition: all 0.3s ease;
      transform: translateX(-50%);
    }

    &:hover,
    &.router-link-active {
      background-color: rgba($color-accent, 0.1);

      &::after {
        width: 80%;
      }
    }

    &.router-link-exact-active {
      color: $color-accent;
      font-weight: bold;

      &::after {
        width: 100%;
      }
    }
  }
}

.play-button {
  background-color: $color-accent;
  color: $color-text;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: $color-accent-dark;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
}

main {
  flex-grow: 1;
  padding: 2rem;
  max-width: $max-width;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 50% 50%, rgba($color-accent, 0.03) 0%, transparent 70%);
    filter: blur(40px);
    opacity: 0.7;
    z-index: -1;
  }
}

footer {
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  padding: 1rem;
  text-align: center;
}
</style>