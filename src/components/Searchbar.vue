<template>
  <v-text-field v-model="search" label="search" prepend-inner-icon="mdi-magnify" variant="outlined" clearable
    hide-details @keyup.enter="onSearch"></v-text-field>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const search = ref('')

async function onSearch() {
  const kw = search.value.trim()
  console.log(kw)
  if (!kw || kw == "") {
    router.push("/")
    return;
  }
  router.push(`/search/${kw}`)
}
</script>