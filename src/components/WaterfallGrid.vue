<template>
  <v-container fluid>
    <PinMasonry :items="images" style="padding-left: 16px;" />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/plugins/axios'
import PinMasonry from '@/components/PinMasonry.vue'

const images = ref([])
const page = ref(1)
const hasMore = ref(true)

async function getPicturesByPage() {
  const res = await axios.get('/iapi/api/pin/getPinsByPage', {
    params: { pageIdx: page.value }
  })
  const pageData = res.data
  if (!pageData.records || pageData.records.length === 0) {
    hasMore.value = false
    return
  }
  images.value.push(
    ...pageData.records.map((item) => ({
      pinId: item.pinId,
      imageUrl: item.pictureUrl
    }))
  )
  page.value += 1
}

onMounted(() => {
  getPicturesByPage()
})

function handlePinClick(pinId) {
  console.log('Clicked pinId:', pinId)
}
</script>