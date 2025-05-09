<template>
    <v-navigation-drawer app permanent expand-on-hover rail>
        <v-list>
            <v-list-item prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
                subtitle="sandra_a88@gmailcom" title="Sandra Adams"></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
            <v-list-item prepend-icon="mdi-pine-tree-box" title="For You" value="home" :to="'/'"></v-list-item>
            <v-list-item prepend-icon="mdi-folder" title="My Works" value="myfiles" :to="'/myWorksPage'"></v-list-item>
            <v-list-item prepend-icon="mdi-plus" title="Create a Pin" value="shared" :to="'/addPage'"></v-list-item>
            <v-list-item prepend-icon="mdi-account" title="Friend" value="starred" :to="'/friendPage'"></v-list-item>
            <v-list-item prepend-icon="mdi-billboard" title="Board" value="board" :to="'/boardPage'"></v-list-item>
            <v-list-item prepend-icon="mdi-waves" title="Stream" value="stream" :to="'/streamPage'"></v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<script setup>


</script>