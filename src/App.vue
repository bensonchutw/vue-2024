<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="wrapper">
      <h1>Schedule Check-in App</h1>
      <nav>
        <RouterLink to="/calendar">行事曆</RouterLink>
        <RouterLink to="/map">地圖</RouterLink>
        <RouterLink to="/discussion">討論區</RouterLink>
      </nav>
    </div>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
  background: var(--color-background-soft);
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
}

.wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  color: var(--color-heading);
  font-size: 1.5rem;
  font-weight: 600;
}

nav {
  display: flex;
  gap: 1rem;
}

nav a {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-decoration: none;
  color: var(--color-text);
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

nav a:hover,
nav a.router-link-active {
  color: var(--color-heading);
  background: var(--color-background);
  border-color: var(--color-border);
}

main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
