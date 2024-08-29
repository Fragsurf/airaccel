<template>
  <main class="home">
    <section class="hero">
      <h1>{{ gameTitle }}</h1>
      <p>Precision bunnyhop. Fluid surfing. Pure speed.</p>
    </section>

    <section class="info">
      <div class="card">
        <h2>About</h2>
        <p>{{ gameTitle }} fuses bunnyhopping precision with surfing fluidity. Master the mechanics. Dominate
          leaderboards.</p>
      </div>
      <div class="card">
        <h2>Inspiration</h2>
        <p>Built on classic mods and community passion. {{ gameTitle }} evolves movement-based gameplay with new
          challenges.</p>
      </div>
    </section>

    <section class="github card">
      <h2>Open Source</h2>
      <p>Shape the future of speedrunning. Contribute to {{ gameTitle }}.</p>
      <a href="https://github.com/cr4yz/airaccel" target="_blank" rel="noopener noreferrer" class="btn">GitHub
        Repository</a>
    </section>
  </main>
</template>

<script setup lang="ts">
  const gameTitle = 'AIRACCEL';
</script>

<style lang="scss" scoped>
  @import "../styles/variables";

  .home {
    display: grid;
    gap: 4rem;
    padding: 2rem 2rem;
    max-width: 1000px;
    margin: 0 auto;

    section {
      text-align: center;
    }

    h1,
    h2 {
      color: $color-accent;
      margin-bottom: 0.5rem;
    }

    p {
      margin: 0;
      line-height: 1.6;
    }
  }

  .hero {
    h1 {
      font-size: 4rem;
      letter-spacing: -1px;
    }

    p {
      font-size: 1.25rem;
      color: rgba($color-text, 0.8);
    }
  }

  .info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .card {
    background-color: rgba($color-accent, 0.05);
    padding: 2rem;
    border-radius: 8px;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }
  }

  .btn {
    display: inline-block;
    margin-top: 1.5rem;
    padding: 0.75rem 1.5rem;
    background-color: $color-accent;
    color: $color-background;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: darken($color-accent, 10%);
    }
  }
</style>