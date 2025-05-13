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

const route = useRoute()
const layoutComponent = computed(() =>
  route.meta.layout === 'blank' ? 'router-view' : DefaultLayout,
)
</script>
