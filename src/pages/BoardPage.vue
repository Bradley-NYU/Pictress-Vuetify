<!-- src/pages/boards/index.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/plugins/axios'

interface BoardDTO {
    boardId: number
    boardName: string
    pictureUrl: string
}

const boards = ref<BoardDTO[]>([])
const loading = ref(false)
const router = useRouter()
const userId = JSON.parse(localStorage.getItem('user') || '{}')?.userId ?? null

onMounted(async () => {
    loading.value = true
    try {
        const { data } = await axios.get<BoardDTO[]>('/iapi/api/board/getAll')
        boards.value = data
    } catch (e) { console.error(e) }
    loading.value = false
})

function goBoard(id: number) {
    router.push(`/board/${id}`)      
}
</script>

<template>
    <v-container class="pl-12">
        <h2 class="text-h4 font-weight-bold mb-6">All Boards</h2>

        <v-row dense>
            <v-col v-for="b in boards" :key="b.boardId" cols="12" sm="6" md="4" lg="3">
                <v-card class="board-card" rounded="lg" elevation="5" @click="goBoard(b.boardId)">
                    <!-- 占位封面 -->
                    <v-img
                        :src="b.pictureUrl ? `https://${b.pictureUrl}` : 'https://via.placeholder.com/400x240?text=Board'"
                        height="180" cover gradient="to bottom, rgba(0,0,0,.05), rgba(0,0,0,.45)">
                        <!-- 标题覆盖 -->
                        <h2 class="board-title text-white">
                            {{ b.boardName }}
                        </h2>
                    </v-img>
                </v-card>
            </v-col>
        </v-row>

        <v-progress-linear v-if="loading" indeterminate color="primary" class="mt-4" />
        <v-alert v-else-if="!boards.length" type="info" variant="tonal" text="You haven't created any boards yet." />
    </v-container>
</template>

<style scoped>
.board-card {
    cursor: pointer;
    transition: transform .25s
}

.board-card:hover {
    transform: translateY(-4px)
}

.board-title {
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 12px;
    font-weight: 700
}
</style>