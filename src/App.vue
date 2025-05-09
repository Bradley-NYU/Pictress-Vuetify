<template>
  <!-- <v-app>
    <v-main>
      <router-view />
      

    </v-main>
  </v-app> -->
  <component :is="layoutComponent" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

// 如果为极少数页面（如 LoginPage）想要“空”布局，可在页面 meta 里标记
const route = useRoute()
const layoutComponent = computed(() =>
  route.meta.layout === 'blank' ? 'router-view' : DefaultLayout,
)
</script>
