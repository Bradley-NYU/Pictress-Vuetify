<template>
    <v-navigation-drawer app permanent expand-on-hover rail>
        <v-list>
            <v-list-item prepend-avatar="https://www.svgrepo.com/show/452030/avatar-default.svg" :subtitle="user.email"
                :title="user.username"></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
            <v-list-item prepend-icon="mdi-pine-tree-box" title="For You" value="home" :to="'/'"></v-list-item>
            <v-list-item prepend-icon="mdi-folder" title="My Boards" value="myfiles" :to="'/myWorksPage'"></v-list-item>
            <v-list-item prepend-icon="mdi-plus" title="Upload a Pin" value="shared" :to="'/addPage'"></v-list-item>
            <v-list-item prepend-icon="mdi-account" title="Friend" value="friend" :to="'/friendPage'"></v-list-item>
            <v-list-item prepend-icon="mdi-billboard" title="All Boards" value="board" :to="'/boardPage'"></v-list-item>
            <v-list-item prepend-icon="mdi-waves" title="Stream" value="stream" :to="'/streamPage'"></v-list-item>

            <v-divider class="my-2"></v-divider>
            <v-list-item prepend-icon="mdi-logout" title="Logout" value="logout" @click="logout" />
        </v-list>
    </v-navigation-drawer>
</template>

<script setup>
import { useRouter } from 'vue-router'
const user = JSON.parse(localStorage.getItem('user') || '{}')

const router = useRouter()

function logout() {
    localStorage.removeItem('user')
    router.push('/loginPage')
}
</script>