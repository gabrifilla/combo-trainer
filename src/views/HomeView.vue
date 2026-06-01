<script setup lang="ts">
import { fighters } from '@/data/combos';
</script>

<template>
  <main class="screen">
    <header class="app-header">
      <div>
        <p class="eyebrow">Keyboard MVP</p>
        <h1>Combo Rhythm Trainer</h1>
      </div>
      <p class="header-note">P1 side: arrows for direction, Z X C V for buttons 1 2 3 4.</p>
    </header>

    <section class="fighter-grid" aria-label="Fighter selection">
      <RouterLink
        v-for="fighter in fighters"
        :key="fighter.id"
        class="fighter-card"
        :to="{ name: 'combos', params: { character: fighter.name } }"
        :style="{ '--accent': fighter.accent }"
      >
        <span class="fighter-mark">{{ fighter.name.slice(-1) }}</span>
        <div>
          <h2>{{ fighter.name }}</h2>
          <p>{{ fighter.archetype }}</p>
        </div>
      </RouterLink>
    </section>
  </main>
</template>
