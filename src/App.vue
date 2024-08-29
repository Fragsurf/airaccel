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

<template>
  <div id="app" class="dark-theme">
    <header>
      <nav>
        <router-link to="/" class="logo">{{ gameTitle }}</router-link>
        <div class="nav-links">
          <router-link to="/" exact>Home</router-link>
          <router-link to="/news">News</router-link>
          <router-link to="/maps">Maps</router-link>
          <router-link to="/leaderboards">Leaderboards</router-link>
          <button @click=" openAirAccelScene " class="play-button">Play Now</button>
        </div>
      </nav>
    </header>

    <main>
      <router-view></router-view>
    </main>

    <footer>
      <p>&copy; {{ new Date().getFullYear() }} {{ gameTitle }}. All rights reserved.</p>
    </footer>

    <Modal v-if=" showAirAccelScene " @close=" closeAirAccelScene ">
      <AirAccelScene />
    </Modal>
  </div>
</template>

<style lang="scss">
  @import 'styles/variables';

  body {
    margin: 0;
    padding: 0;
  }

  #app {
    font-family: $font-family;
    @include smooth-text;
    color: $color-text;
    background-color: $color-background;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    background-color: rgba(0, 0, 0, 0.2);
    padding: 1rem;
  }

  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: $max-width;
    margin: 0 auto;
  }

  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: $color-accent;
    text-decoration: none;
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
    transition: background-color 0.3s;

    &:hover {
      background-color: $color-accent-dark;
    }
  }

  main {
    flex-grow: 1;
    padding: 2rem;
    max-width: $max-width;
    margin: 0 auto;
    width: 100%;
  }

  footer {
    background-color: rgba(0, 0, 0, 0.2);
    padding: 1rem;
    text-align: center;
  }
</style>