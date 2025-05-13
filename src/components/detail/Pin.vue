<!-- src/pages/pin/[id].vue -->
<template>
    <v-container class="py-8">
        <v-row>
            <v-col cols="12" md="8">
                <v-card flat rounded="lg" class="overflow-hidden">
                    <v-img :src="'https://' + detail.pictureUrl" height="600px" cover></v-img>
                </v-card>
            </v-col>

            <v-col cols="12" md="4" class="d-flex flex-column">
                <div class="d-flex align-center justify-space-between mb-4">
                    <v-btn :color="'pink'" size="large" rounded="lg" class="pin-btn-text me-4" @click="handleRepin">
                        {{ pinBtnText }}
                    </v-btn>
                    <div class="d-flex align-center">
                        <v-btn icon @click="toggleLike">
                            <v-icon>{{ detail.isLikedByMe ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
                        </v-btn>
                        <span class="ms-1 me-4">{{ detail.likes }}</span>

                        <v-btn icon><v-icon>mdi-share-variant</v-icon></v-btn>
                        <v-btn icon><v-icon>mdi-dots-horizontal</v-icon></v-btn>
                    </div>
                </div>

                <p class="text-subtitle-1 text-grey-darken-1 d-flex align-center" v-if="detail.isOriginal">
                    Post by Myself
                    <v-icon class="ms-2" size="18">mdi-medal</v-icon>
                </p>

                <h2 class="text-h4 mb-3 mt-3">{{ detail.title || 'Untitled Pin' }}</h2>
                <p class="text-subtitle-2 text-grey-darken-1">
                    {{ detail.description || 'No description.' }}
                </p>

                <div v-if="detail.tags?.length" class="mb-4" style="margin-top: 24px;">
                    <v-chip v-for="t in detail.tags" :key="t" size="small" class="me-2 mb-2" variant="outlined"
                        color="grey-darken-1">
                        {{ t }}
                    </v-chip>
                </div>

                <div class="d-flex align-center mt-8">
                    <v-avatar size="48" class="me-3">
                        <v-img :src="authorAvatar" />
                    </v-avatar>
                    <div>
                        <div class="font-weight-medium">{{ detail.userName }}</div>
                    </div>
                </div>

                <v-card class="mt-6 pa-3" flat outlined rounded="lg">
                    <h3 class="text-subtitle-1 mb-2">评论</h3>

                    <!-- 评论列表 -->
                    <div style="max-height: 200px; overflow-y: auto;">
                        <v-list density="compact">
                            <v-list-item v-for="c in comments" :key="c.timestamp + c.userId">
                                <v-list-item-content>
                                    <v-list-item-title class="text-body-2 font-weight-medium">
                                        {{ c.userName }}
                                        <span class="text-caption text-grey-darken-1 ms-2">{{ formatTime(c.timestamp)
                                            }}</span>
                                    </v-list-item-title>
                                    <v-list-item-subtitle class="text-body-2">
                                        {{ c.content }}
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </div>

                    <!-- 评论输入框 -->
                    <div class="d-flex align-center mt-3">
                        <v-text-field v-model="newComment" placeholder="写下你的评论..." variant="solo" hide-details
                            density="compact" class="me-2" style="flex: 1" @keyup.enter="submitComment" />
                        <v-btn color="primary" :disabled="!newComment.trim()" @click="submitComment">发送</v-btn>
                    </div>
                </v-card>
            </v-col>

        </v-row>



        <v-alert v-if="loadError" type="error" variant="tonal" class="mt-6" text="Failed to load pin detail." />

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
    return detail.value.isPinedByMe ? 'Pinged' : 'Pin'
})

const comments = ref([])
const newComment = ref('')
const defaultAvatar = 'https://cdn.vuetifyjs.com/images/profiles/default-avatar.png'

onMounted(() => {
    fetchDetail()
    fetchComments()
})

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
            pinId: pinId,
        })
        dialog.value = false
        window.history.back();
    } catch (e) {
        console.error('repin error', e)
    }
}

const authorAvatar =
    'https://cdn.vuetifyjs.com/images/profiles/marcus.jpg'

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

async function fetchComments() {
    try {
        const res = await axios.get('/iapi/api/pin/comment/get', {
            params: {
                pinId,
            }
        })
        comments.value = res.data
    } catch (e) {
        console.error('fetchComments error', e)
    }
}

async function submitComment() {
    if (!newComment.value.trim()) return
    try {
        await axios.post('/iapi/api/pin/comment/add', {
            userId: userId,
            pinId: detail.value.pinId,
            content: newComment.value.trim()
        })
        newComment.value = ''
        fetchComments()
    } catch (e) {
        console.error('submitComment error', e)
    }
}

function formatTime(ms) {
    const d = new Date(ms)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mi = String(d.getMinutes()).padStart(2, '0')
    return `${yyyy}/${mm}/${dd} ${hh}:${mi}`
}
</script>

<style scoped>
.v-card>.v-img {
    object-position: center;
}

.pin-btn-text {
    font-size: 1.0rem;
    padding: 0.5rem 1.4rem;
}
</style>