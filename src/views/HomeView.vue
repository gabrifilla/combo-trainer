<script setup lang="ts">
import { computed, ref } from 'vue';
import { fighters } from '@/data/combos';

const search = ref('');
const filteredFighters = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return fighters;

  return fighters.filter((fighter) => {
    return `${fighter.name} ${fighter.archetype}`.toLowerCase().includes(query);
  });
});

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
}
</script>

<template>
  <main class="screen">
    <header class="app-header">
      <div>
        <p class="eyebrow">Tekken 8 roster</p>
        <h1>Select Fighter</h1>
      </div>
      <p class="header-note">Choose a fighter, then practice rhythm-based generic Tekken inputs.</p>
    </header>

    <label class="fighter-search">
      <span>Search</span>
      <input v-model="search" type="search" placeholder="Name or style" />
    </label>

    <section class="fighter-grid" aria-label="Fighter selection">
      <RouterLink
        v-for="fighter in filteredFighters"
        :key="fighter.id"
        class="fighter-card"
        :to="{ name: 'combos', params: { character: fighter.name } }"
        :style="{ '--accent': fighter.accent }"
      >
        <span class="fighter-mark">{{ initials(fighter.name) }}</span>
        <div>
          <h2>{{ fighter.name }}</h2>
          <p>{{ fighter.archetype }}</p>
        </div>
      </RouterLink>
    </section>
  </main>
</template>
