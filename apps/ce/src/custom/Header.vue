<script setup lang="ts">
import { computed } from 'vue'
import type { HeaderData, MenuComponent } from "./../helpers/menu/menu-component";

const props = defineProps<{
  node: MenuComponent,
}>()

const data = computed(() => props.node.data as HeaderData)

const headingTag = computed(() => {
  const level = Math.min(6, Math.max(1, data.value?.level ?? 2))
  return `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
})

const gapStyle = computed(() => ({
  gap: `${data.value?.gap ?? 4}px`,
}))
</script>

<template>
  <header class="header" :style="gapStyle">
    <component :is="headingTag" class="header__title">
      {{ data?.header ?? node.id }}
    </component>
    <p v-if="data?.subheader" class="header__subheader">
      {{ data.subheader }}
    </p>
    <p v-if="data?.description" class="header__description">
      {{ data.description }}
    </p>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  flex-direction: column;
  margin: 0 0 0.75rem;
}

.header__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
}

.header__subheader {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #444;
}

.header__description {
  margin: 0;
  font-size: 0.75rem;
  color: #666;
}
</style>
