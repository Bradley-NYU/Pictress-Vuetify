<template>
    <v-container fluid>
        <PinMasonry :items="images" />
    </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from '@/plugins/axios'
import PinMasonry from '@/components/PinMasonry.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const images = ref([])

async function getPicturesByPage() {
    const kw = route.params.keyword

    try {
        const res = await axios.get('/iapi/api/pin/searchPins', {
            params: {
                keyword: kw
            }
        })

        images.value = res.data.map(item => ({
            pinId: item.pinId,
            imageUrl: item.pictureUrl
        }))
    } catch (err) {
        console.error('search error', err)
    }
}

onMounted(() => {
    getPicturesByPage()
})

watch(
    () => route.params.keyword,
    (newKW) => {
        if (newKW) getPicturesByPage()
    },
    { immediate: true }
)
</script>