<!-- src/pages/pin/[id].vue -->
<template>
    <v-container class="py-8">
        <v-row>
            <!-- 左侧大图 -->
            <v-col cols="12" md="8">
                <v-card flat rounded="lg" class="overflow-hidden">
                    <v-img :src="'https://' + detail.pictureUrl" height="600px" cover></v-img>
                </v-card>
            </v-col>

            <!-- 右侧信息区 -->
            <v-col cols="12" md="4" class="d-flex flex-column">
                <!-- 操作按钮 -->
                <div class="d-flex align-center justify-space-between mb-4">
                    <v-btn :color="detail.isOriginal ? 'grey-lighten-1' : 'pink'" size="large" rounded="lg"
                        class="pin-btn-text me-4" :disabled="detail.isOriginal" @click="handleRepin">
                        {{ pinBtnText }}
                    </v-btn>
                    <!-- 右：其它操作放一起 -->
                    <div class="d-flex align-center">
                        <v-btn icon @click="toggleLike">
                            <v-icon>{{ detail.isLikedByMe ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
                        </v-btn>
                        <span class="ms-1 me-4">{{ detail.likes }}</span>

                        <v-btn icon><v-icon>mdi-share-variant</v-icon></v-btn>
                        <v-btn icon><v-icon>mdi-dots-horizontal</v-icon></v-btn>
                    </div>
                </div>

                <!-- 标题&描述 -->
                <h2 class="text-h4 mb-2">{{ detail.title || 'Untitled Pin' }}</h2>
                <p class="text-subtitle-2 text-grey-darken-1">
                    {{ detail.description || 'No description.' }}
                </p>

                <div v-if="detail.tags?.length" class="mb-4" style="margin-top: 24px;">
                    <v-chip v-for="t in detail.tags" :key="t" size="small" class="me-2 mb-2" variant="outlined"
                        color="grey-darken-1">
                        {{ t }}
                    </v-chip>
                </div>

                <!-- 作者信息 -->
                <div class="d-flex align-center mt-8">
                    <v-avatar size="48" class="me-3">
                        <!-- 若后端未返回头像，可用占位图 -->
                        <v-img :src="authorAvatar" />
                    </v-avatar>
                    <div>
                        <div class="font-weight-medium">{{ detail.userName }}</div>
                    </div>
                </div>
            </v-col>
        </v-row>

        <!-- 加载失败提示 -->
        <v-alert v-if="loadError" type="error" variant="tonal" class="mt-6" text="Failed to load pin detail." />


        <!-- 选择图板弹窗 -->
        <v-dialog v-model="dialog" max-width="400">
            <v-card>
                <v-card-title class="text-h6">Save Pin to Board</v-card-title>

                <v-card-text>
                    <v-select v-model="selectedBoardId" :items="boards" item-title="boardName" item-value="boardId"
                        label="Select a board" :loading="boardsLoading" :disabled="boardsLoading" />
                </v-card-text>

                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="dialog = false">Cancel</v-btn>
                    <v-btn text color="primary" :disabled="!selectedBoardId" @click="confirmRepin">
                        Confirm
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/plugins/axios'

const route = useRoute()
const pinId = Number(route.params.id)
const user = JSON.parse(localStorage.getItem('user') || '{}')
const userId = user?.userId ?? null

const detail = ref({
    pinId: pinId,
    userId: 0,
    userName: '',
    pictureUrl: '',
    title: '',
    description: '',
    likes: 0,
    isPinedByMe: false,
    isLikedByMe: false,
    isOriginal: false,
    tags: [],
})

const loadError = ref(false)

const dialog = ref(false)
const currentPinId = ref(null)
const boards = ref([])
const boardsLoading = ref(false)
const selectedBoardId = ref(null)
const pinBtnText = computed(() => {
    if (detail.value.isOriginal) return 'Posted by me'
    return detail.value.isPinedByMe ? 'Pined' : 'Pin'
})

onMounted(fetchDetail)

async function fetchDetail() {
    try {
        const { data } = await axios.get('/iapi/api/pin/getPinDetail', {
            params: {
                pinId: pinId,
                userId: userId
            }
        })
        detail.value = data
        console.log(detail.value)
    } catch (e) {
        console.error('load pin detail error', e)
        loadError.value = true
    }
}

async function fetchBoards() {
    try {
        boardsLoading.value = true
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const res = await axios.get('/iapi/api/board/get', {
            params: {
                userId: userId
            }
        })
        boards.value = res.data
    } catch (e) {
        console.error('load boards error', e)
    } finally {
        boardsLoading.value = false
    }
}

function handleRepin() {
    if (detail.value.isOriginal) return
    if (detail.value.isPinedByMe) {
        confirmRemoveRepin()
    } else {
        dialog.value = true
        selectedBoardId.value = null
        if (boards.value.length === 0) fetchBoards()
    }
}

async function confirmRepin() {
    if (!selectedBoardId.value) return
    try {
        await axios.post('/iapi/api/pin/repin', {
            userId,
            pinId,
            boardId: selectedBoardId.value
        })
        dialog.value = false
        fetchDetail();
    } catch (e) {
        console.error('repin error', e)
    }
}

async function confirmRemoveRepin() {
    try {
        await axios.post('/iapi/api/pin/removeRepin', {
            userId: userId,
            originalPinId: pinId,
        })
        dialog.value = false
        // 更新本地状态，让按钮显示「Pined」
        fetchDetail();
    } catch (e) {
        console.error('repin error', e)
    }
}

/* 占位头像（可换成用户表里的头像字段） */
const authorAvatar =
    'https://cdn.vuetifyjs.com/images/profiles/marcus.jpg'

/* 点赞切换示例——这里只做本地状态演示 */
async function toggleLike() {
    if (detail.value.isLikedByMe) {
        removelike();
    } else {
        like();
    }
}

async function like() {
    try {
        const response = await axios.post('/iapi/api/pin/like', {
            userId: userId,
            pinId: pinId
        })
        fetchDetail()
    } catch (err) {

    }
}

async function removelike() {
    try {
        const response = await axios.post('/iapi/api/pin/removeLike', {
            userId: userId,
            pinId: pinId
        })
        fetchDetail()
    } catch (err) {

    }
}
</script>

<style scoped>
/* 让图片区域始终铺满左列 */
.v-card>.v-img {
    object-position: center;
}

.pin-btn-text {
    font-size: 1.0rem;
    /* 更大的字号 */
    padding: 0.5rem 1.4rem;
    /* 加宽内边距，视觉更大 */
}
</style>