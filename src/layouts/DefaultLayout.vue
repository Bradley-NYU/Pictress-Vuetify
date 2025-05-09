<!-- src/layouts/default.vue -->
<template>
    <v-app>
        <v-layout class="h-screen">
            <Sidebar />
            <v-main class="pa-4 overflow-y-auto">
                <Searchbar style="padding-left: 80px;" />
                <router-view style="padding-left: 64px;" />
            </v-main>
        </v-layout>
    </v-app>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import Searchbar from '@/components/Searchbar.vue';
console.log("default layout")
</script>

<style scoped>
.h-screen {
    height: 100vh;

}
</style>
