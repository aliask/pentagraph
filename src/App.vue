<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Header from './components/Header.vue'
import Keys from './components/Keys.vue'
</script>

<template>
  <header>
    <Header msg="Local PGP in your browser that doesn't suck" />

    <nav>
      <RouterLink to="/decrypt">Decrypt</RouterLink>
      <RouterLink to="/encrypt">Encrypt</RouterLink>
    </nav>
  </header>

  <Keys />

  <section>
    <RouterView />
  </section>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

nav {
  width: 100%;
  font-size: 24px;
  text-align: center;
  margin-top: 1rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

section {
  display: flex;
  flex-direction: column;
  width: 100%;
}

header {
  display: flex;
  flex-direction: column;
  place-items: center;
}
</style>
