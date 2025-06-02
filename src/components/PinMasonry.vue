<!-- components/PinMasonry.vue -->
<template>
    <div class="masonry">
        <div class="masonry-item" v-for="(item, index) in items" :key="item.pinId">
            <div class="image-wrapper">
                <v-card class="image-card">
                    <v-img :src="'https://' + item.imageUrl" :height="itemHeight(index)"
                        @click="handleCardClick(item.pinId)" cover class="image"></v-img>
                </v-card>
            </div>
        </div>
    </div>

</template>

<script setup>
import { defineProps, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/plugins/axios'

const router = useRouter()
const props = defineProps({
    items: {
        type: Array,
        required: true
    }
})



const itemHeight = () => `${200 + Math.floor(Math.random() * 150)}px`

function handleCardClick(pinId) {
    router.push(`/pin/${pinId}`)
}

</script>

<style scoped>
.masonry {
    column-count: 5;
    column-gap: 1rem;
}

.masonry-item {
    break-inside: avoid;
    margin-bottom: 1rem;
}

.image-wrapper {
    position: relative;
    overflow: hidden;
}

.image-card {
    transition: opacity 0.3s ease;
}

.image-wrapper:hover .image {
    opacity: 0.6;
}

.pin-btn {
    display: flex;
    /* 让内部 flex 布局 */
    align-items: center;
    /* 垂直居中 */
    justify-content: center;
    /* 水平居中 */
    font-size: 1.2rem;
    padding: 1.5rem 1.5rem;
    /* 可按需调节 */
    min-width: 0;
    /* 防止 Vuetify 默认 min-width 撑宽 */
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 2;
    opacity: 0;
    transition: opacity 0.3s;
}

.image-wrapper:hover .pin-btn {
    opacity: 1;
}
</style>