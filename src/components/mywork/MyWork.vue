<template>
    <v-container class="pl-12">
        <h2 class="text-h4 font-weight-bold mb-6">My Boards</h2>

        <div class="d-flex align-center justify-space-between mb-4">
            <template v-if="boards.length">
                <v-tabs v-model="selectedBoardId">
                    <v-tab v-for="board in boards" :key="board.boardId" :value="board.boardId">
                        {{ board.boardName }}
                    </v-tab>
                </v-tabs>
            </template>
            <template v-else>
                <v-alert type="info" variant="tonal" text style="margin-right: 24px;">
                    You haven't create any board.
                </v-alert>
            </template>

            <v-btn icon @click="dialog = true">
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </div>
        <PinMasonry :items="pins" @pin-click="handlePinClick" />

        <v-dialog v-model="dialog" max-width="400">
            <v-card>
                <v-card-title>
                    <span class="text-h6">Create New Board</span>
                </v-card-title>

                <v-card-text>
                    <v-text-field label="Board Name" v-model="newBoardName" />
                </v-card-text>

                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="dialog = false">Cancel</v-btn>
                    <v-btn text color="primary" @click="createBoard">Create</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>

    <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor">
        {{ snackbarText }}
    </v-snackbar>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from '@/plugins/axios'
import PinMasonry from '@/components/PinMasonry.vue'


const dialog = ref(false)
const boards = ref([])
const selectedBoardId = ref(null)
const boardPins = ref([])
const newBoardName = ref('')
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const pins = ref([])
const user = JSON.parse(localStorage.getItem('user') || '{}')
const userId = user?.userId ?? null

async function getBoards() {
    const res = await axios.get('/iapi/api/board/get', {
        params: {
            userId: userId
        }
    })
    boards.value = res.data
    if (boards.value.length > 0) {
        selectedBoardId.value = boards.value[0].boardId
    }
}

async function fetchPinsByBoard(boardId) {
    const res = await axios.get('/iapi/api/pin/getPinsByBoard', {
        params: {
            boardId: boardId
        }
    })
    pins.value = res.data.map(pin => ({
        pinId: pin.pinId,
        imageUrl: pin.pictureUrl
    }))
}


async function createBoard() {
    dialog.value = false

    try {
        const res = await axios.post('/iapi/api/board/create', {
            userId: userId,
            boardName: newBoardName.value,
            description: null,
            allowComments: true
        })
        snackbarText.value = 'Created successful!'
        snackbarColor.value = 'success'
        snackbar.value = true
        getBoards()
    } catch (err) {
        snackbarText.value = 'Create failed.'
        snackbarColor.value = 'error'
        snackbar.value = true
    }
    newBoardName.value = ''
}

onMounted(() => {
    getBoards()
})

watch(selectedBoardId, async (newBoardId) => {
    if (newBoardId) {
        await fetchPinsByBoard(newBoardId)
    }
})
</script>