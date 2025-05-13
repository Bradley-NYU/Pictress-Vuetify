<!-- src/pages/board/[id].vue -->
<template>
    <v-container fluid class="py-8">

        <v-row class="mb-8">
            <v-col cols="12" md="8" class="d-flex align-center">
                <div>
                    <h1 class="text-h4 font-weight-bold mb-1">
                        {{ boardInfo.title || 'Untitled Board' }}
                    </h1>
                    <p v-if="boardInfo.description" class="text-body-2 text-grey-darken-1 mb-3">
                        {{ boardInfo.description }}
                    </p>

                    <div class="d-flex align-center">
                        <v-avatar size="32" class="me-2">
                            <v-icon color="grey">mdi-account</v-icon>
                        </v-avatar>
                        <span class="text-subtitle-2">{{ boardInfo.userName }}</span>
                    </div>
                </div>
            </v-col>

            <!-- 右：Add to stream 按钮 -->
            <v-col cols="12" md="4" class="d-flex justify-end align-start">
                <v-btn color="primary" variant="elevated" rounded="lg" size="large" @click="handleAddToStream">
                    <v-icon start class="me-1">mdi-plus</v-icon>
                    Add&nbsp;to&nbsp;stream
                </v-btn>
            </v-col>
        </v-row>

        <!-- ===== Pins Masonry ===== -->
        <PinMasonry :items="pins" />

        <v-alert v-if="error" type="error" variant="tonal" class="mt-6" :text="error" />
        <v-dialog v-model="dialog" max-width="400">
            <v-card>
                <v-card-title class="text-h6">Save Pin to Board</v-card-title>

                <v-card-text>
                    <v-select v-model="selectedStreamId" :items="streams" item-title="streamName" item-value="streamId"
                        label="Select a board" :loading="boardsLoading" :disabled="boardsLoading" />
                </v-card-text>

                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="dialog = false">Cancel</v-btn>
                    <v-btn text color="primary" :disabled="!selectedStreamId" @click="confirmAdd">
                        Confirm
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/plugins/axios'
import PinMasonry from '@/components/PinMasonry.vue'

const route = useRoute()
const boardId = Number(route.params.id)

const boardInfo = ref({
    boardId,
    title: '',
    description: '',
    userName: '',
    userId: 0,
})

const pins = ref<Array<{ pinId: number; imageUrl: string }>>([])
const error = ref('')


const dialog = ref(false)
const streams = ref([])
const boardsLoading = ref(false)
const selectedStreamId = ref(null)
const user = JSON.parse(localStorage.getItem('user') || '{}')
const userId = user?.userId ?? null

onMounted(async () => {
    await fetchBoardInfo()
    await fetchPins()
})

/* --- 看板基本信息 --- */
async function fetchBoardInfo() {
    try {
        const { data } = await axios.get('/iapi/api/board/getBoardInfo', {
            params: { boardId },
        })
        boardInfo.value = data
    } catch (e) {
        console.error(e)
        error.value = 'Failed to load board info.'
    }
}

async function fetchPins() {
    try {
        const { data } = await axios.get('/iapi/api/pin/getPinsByBoard', {
            params: { boardId },
        })
        pins.value = (data || []).map((it: any) => ({
            pinId: it.pinId,
            imageUrl: it.pictureUrl,
        }))
    } catch (e) {
        console.error(e)
        error.value = 'Failed to load pins.'
    }
}

function handleAddToStream() {
    dialog.value = true
    selectedStreamId.value = null
    if (streams.value.length === 0) fetchBoards()
}

async function fetchBoards() {
    try {
        boardsLoading.value = true
        const res = await axios.get('/iapi/api/stream/get', {
            params: {
                userId: userId
            }
        })
        streams.value = res.data
    } catch (e) {
        console.error('load boards error', e)
    } finally {
        boardsLoading.value = false
    }
}


async function confirmAdd() {
    if (!selectedStreamId.value) return
    try {
        await axios.post('/iapi/api/stream/addBoardToStream', {
            boardId: boardId,
            streamId: selectedStreamId.value
        })
        dialog.value = false
    } catch (e) {
        console.error('repin error', e)
    }
}
</script>