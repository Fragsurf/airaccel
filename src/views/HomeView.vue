<template>
  <main class="home">
    <section class="hero">
      <img src="assets/images/airaccel_logo.png" alt="AIRACCEL Logo" class="hero-logo" />
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;

  section {
    text-align: center;
  }

  h1, h2 {
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

  .hero-logo {
    max-width: 400px;
    width: 100%;
    height: auto;
  }
}

.info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.card {
  background: linear-gradient(
    135deg, 
    rgba($color-accent, 0.1) 0%, 
    rgba($color-accent, 0.05) 100%
  );
  padding: 2rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: default;
  border: 1px solid rgba($color-accent, 0.1);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba($color-accent, 0.05) inset,
    0 0 20px rgba($color-accent, 0.03) inset;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 
      0 8px 12px rgba(0, 0, 0, 0.15),
      0 3px 6px rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba($color-accent, 0.1) inset,
      0 0 30px rgba($color-accent, 0.05) inset;
  }

  h2 {
    position: relative;
    display: inline-block;
    margin-bottom: 1rem;

    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
      width: 50px;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent,
        $color-accent,
        transparent
      );
    }
  }
}

.btn {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(
    135deg, 
    $color-accent 0%, 
    darken($color-accent, 10%) 100%
  );
  color: $color-background;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: linear-gradient(
      135deg, 
      lighten($color-accent, 5%) 0%, 
      $color-accent 100%
    );
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
}
</style>