<template>
    <v-container class="pl-12">
        <!-- page title -->
        <h2 class="text-h4 font-weight-bold mb-6">Friends</h2>

        <!-- ─────────── Search + Add friend ─────────── -->
        <div class="d-flex align-center mb-6">
            <v-text-field v-model="addUserId" label="Enter user ID" density="compact" hide-details class="me-2" />
            <v-btn color="primary" @click="sendFriendRequest" :disabled="!addUserId">
                Add
            </v-btn>
        </div>

        <!-- ─────────── Tabs ─────────── -->
        <v-tabs v-model="tab" class="mb-4">
            <v-tab value="friends">Friends ({{ friends.length }})</v-tab>
            <v-tab value="requests">Requests ({{ requests.length }})</v-tab>
        </v-tabs>

        <!-- ─────────── Content panes ─────────── -->
        <v-window v-model="tab">
            <!-- Friends list -->
            <v-window-item value="friends">
                <v-list v-if="friends.length">
                    <v-list-item v-for="f in friends" :key="f.requesterId" :title="f.requesterUserName">
                        <template #prepend>
                            <v-avatar size="36">
                                <v-icon color="grey">mdi-account</v-icon>
                            </v-avatar>
                        </template>
                    </v-list-item>
                </v-list>
                <v-alert v-else type="info" variant="tonal" text="You have no friends yet." />
            </v-window-item>

            <!-- Pending requests -->
            <v-window-item value="requests">
                <v-list v-if="requests.length">
                    <v-list-item v-for="r in requests" :key="r.requesterId" :title="r.requesterUserName"
                        :subtitle="r.email">
                        <template #prepend>
                            <v-avatar size="36">
                                <v-icon color="grey">mdi-account</v-icon>
                            </v-avatar>
                        </template>

                        <template #append>
                            <v-btn size="small" color="success" icon="mdi-check" class="me-2"
                                @click="answerRequest(r.requesterId, true)" />
                            <v-btn size="small" color="error" icon="mdi-close"
                                @click="answerRequest(r.requesterId, false)" />
                        </template>
                    </v-list-item>
                </v-list>
                <v-alert v-else type="info" variant="tonal" text="No pending requests." />
            </v-window-item>
        </v-window>

        <!-- Snackbar feedback -->
        <v-snackbar v-model="snackbar.visible" :timeout="2000" :color="snackbar.color">
            {{ snackbar.text }}
        </v-snackbar>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/plugins/axios'

/* ------- state ------- */
const tab = ref('friends')
const friends = ref([])
const requests = ref([])
const addUserId = ref('')         
const snackbar = ref({ visible: false, text: '', color: 'green' })

const user = JSON.parse(localStorage.getItem('user') || '{}')
const userId = user?.userId ?? null

/* ------- fetch lists ------- */
onMounted(() => {
    loadFriends();
    loadRequests()
})

async function loadFriends() {
    try {
        const { data } = await axios.get('/iapi/api/user/getFriends', {
            params: { userId }
        })
        friends.value = data        // recv list<FriendshipResultDTO>
    } catch (e) { console.error(e) }
}

async function loadRequests() {
    try {
        const { data } = await axios.get('/iapi/api/user/getPendingRequest', {
            params: { userId }
        })
        requests.value = data
    } catch (e) { console.error(e) }
}

async function sendFriendRequest() {
    try {
        await axios.post('/iapi/api/user/request', {
            requesterId: userId,
            receiverId: Number(addUserId.value)
        })
        snackbar.value = { visible: true, text: 'Request sent.', color: 'green' }
        addUserId.value = ''
    } catch (e) {
        snackbar.value = { visible: true, text: 'Failed to send request.', color: 'error' }
    }
}

async function answerRequest(requesterId, accept) {
    try {
        await axios.post('/iapi/api/user/answer', {
            requesterId,
            receiverId: userId,
            accept
        })
        snackbar.value = {
            visible: true,
            text: accept ? 'Friend request accepted.' : 'Friend request declined.',
            color: accept ? 'green' : 'orange'
        }
        loadFriends(); loadRequests()
    } catch (e) {
        snackbar.value = { visible: true, text: 'Operation failed.', color: 'error' }
    }
}
</script>

<style scoped>
</style>