<!-- src/pages/Streams.vue（示例文件名，可自行调整） -->
<template>
    <v-container>
        <h2 class="text-h4 font-weight-bold mb-6">Your Follow Streams</h2>

        <!-- 顶部：流 Tabs + 新建按钮 -->
        <div class="d-flex align-center justify-space-between mb-4">
            <v-tabs v-model="selectedStreamId">
                <v-tab v-for="stream in streams" :key="stream.streamId" :value="stream.streamId">
                    {{ stream.streamName }}
                </v-tab>
            </v-tabs>

            <v-btn icon @click="dialog = true">
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </div>

        <!-- 瀑布流图片区 -->
        <PinMasonry :items="pins" @pin-click="handlePinClick" />

        <!-- 新建 Stream 对话框 -->
        <v-dialog v-model="dialog" max-width="400">
            <v-card>
                <v-card-title class="text-h6">Create New Stream</v-card-title>
                <v-card-text>
                    <v-text-field v-model="newStreamName" label="Stream name" />
                </v-card-text>

                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="dialog = false">Cancel</v-btn>
                    <v-btn text color="primary" @click="createStream">Create</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Snackbar 提示 -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
            {{ snackbar.text }}
        </v-snackbar>
    </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from '@/plugins/axios'
import PinMasonry from '@/components/PinMasonry.vue'

/* ======= state ======= */
const streams = ref([])              // 全部 Stream
const selectedStreamId = ref(null)            // 当前选中的 Stream
const pins = ref([])              // 瀑布流里的 pin
const dialog = ref(false)           // 创建 Stream 弹窗
const newStreamName = ref('')              // 新 Stream 名称
const snackbar = ref({ show: false, text: '', color: 'success' })

/* 用户信息（从 localStorage 取） */
const user = JSON.parse(localStorage.getItem('user') || '{}')
const userId = user.userId ?? null   // 若未登录请自行处理

/* ======= API ======= */

/** 加载用户所有 Stream */
async function fetchStreams() {
    const { data } = await axios.get('/iapi/api/stream/get', {
        params: { userId }
    })
    streams.value = data
    // 默认选中第一个 stream
    if (streams.value.length && !selectedStreamId.value) {
        selectedStreamId.value = streams.value[0].streamId
    }
}

/** 加载某个 Stream 下的 Pin */
async function fetchPinsByStream(streamId) {
    const { data } = await axios.get('/iapi/api/pin/getPinsByStream', {
        params: { streamId }
    })
    pins.value = data.map(p => ({
        pinId: p.pinId,
        imageUrl: p.pictureUrl
    }))
}

/** 创建 Stream */
async function createStream() {
    dialog.value = false
    try {
        await axios.post('/iapi/api/stream/createStream', {
            userId: userId,
            streamName: newStreamName.value
        })
        snackbar.value = { show: true, text: 'Created successfully!', color: 'success' }
        newStreamName.value = ''
        await fetchStreams()          // 重新拉取 Stream 列表
    } catch (e) {
        snackbar.value = { show: true, text: 'Create failed.', color: 'error' }
    }
}

/* ======= 生命周期 & 监听 ======= */
onMounted(fetchStreams)

/* 切换 Stream 时刷新 Pin 列表 */
watch(selectedStreamId, async id => {
    if (id) await fetchPinsByStream(id)
})

/* （可选）Pin 点击回调 */
function handlePinClick(pinId) {
    console.log('Pin clicked:', pinId)
    // router.push(`/pin/${pinId}`)  等等…
}
</script>

<style scoped>
/* 额外样式（如需） */
</style>