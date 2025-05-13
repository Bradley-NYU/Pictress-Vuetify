<template>
    <v-container class="pl-12">
        <h2 class="text-h4 font-weight-bold mb-6">Your Follow Streams</h2>

        <div class="d-flex align-center justify-space-between mb-4">
            <template v-if="streams.length">
                <v-tabs v-model="selectedStreamId">
                    <v-tab v-for="stream in streams" :key="stream.streamId" :value="stream.streamId">
                        {{ stream.streamName }}
                    </v-tab>
                </v-tabs>
            </template>
            <template v-else>
                <v-alert type="info" variant="tonal" dense text style="margin-right: 24px;">
                    You have no follow-streams yet.
                </v-alert>
            </template>

            <v-btn icon @click="dialog = true">
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </div>

        <PinMasonry :items="pins" @pin-click="handlePinClick" />

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
const streams = ref([])             
const selectedStreamId = ref(null)            
const pins = ref([])             
const dialog = ref(false)           
const newStreamName = ref('')             
const snackbar = ref({ show: false, text: '', color: 'success' })

const user = JSON.parse(localStorage.getItem('user') || '{}')
const userId = user.userId ?? null   


async function fetchStreams() {
    const { data } = await axios.get('/iapi/api/stream/get', {
        params: { userId }
    })
    streams.value = data
    if (streams.value.length && !selectedStreamId.value) {
        selectedStreamId.value = streams.value[0].streamId
    }
}

async function fetchPinsByStream(streamId) {
    const { data } = await axios.get('/iapi/api/pin/getPinsByStream', {
        params: { streamId }
    })
    pins.value = data.map(p => ({
        pinId: p.pinId,
        imageUrl: p.pictureUrl
    }))
}

async function createStream() {
    dialog.value = false
    try {
        await axios.post('/iapi/api/stream/createStream', {
            userId: userId,
            streamName: newStreamName.value
        })
        snackbar.value = { show: true, text: 'Created successfully!', color: 'success' }
        newStreamName.value = ''
        await fetchStreams()          
    } catch (e) {
        snackbar.value = { show: true, text: 'Create failed.', color: 'error' }
    }
}


onMounted(fetchStreams)


watch(selectedStreamId, async id => {
    if (id) await fetchPinsByStream(id)
})


function handlePinClick(pinId) {
    console.log('Pin clicked:', pinId)
}
</script>

<style scoped>
</style>