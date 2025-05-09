<template>
    <v-container class="fill-height" fluid>
        <v-row justify="center">
            <v-col cols="12" sm="8" md="4">
                <v-card class="pa-6" elevation="10">
                    <v-card-title class="text-h5 text-center mb-4">
                        Login
                    </v-card-title>

                    <v-form @submit.prevent="handleLogin" ref="form">
                        <v-text-field v-model="username" label="Username" prepend-inner-icon="mdi-account"
                            required></v-text-field>

                        <v-text-field v-model="password" label="Password" type="password" prepend-inner-icon="mdi-lock"
                            required></v-text-field>

                        <v-btn type="submit" color="primary" class="mt-4" block>
                            Login
                        </v-btn>
                    </v-form>

                    <v-alert v-if="errorMessage" type="error" class="mt-4" dense text>
                        {{ errorMessage }}
                    </v-alert>

                    <!-- ✅ Sign up 按钮 -->
                    <v-btn variant="text" color="primary" class="mt-2" block @click="goToSignup">
                        Don’t have an account? Sign up
                    </v-btn>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/plugins/axios'


const username = ref('')
const password = ref('')
const errorMessage = ref('')
const form = ref(null)

const router = useRouter()

async function handleLogin() {
    if (!username.value || !password.value) {
        errorMessage.value = 'Please fill in both fields.'
        return
    }

    try {
        const response = await axios.post('/iapi/api/auth/login', {
            username: username.value,
            password: password.value
        })

        const user = response.data.user
        localStorage.setItem("user", JSON.stringify(user))
        router.push('/')
    } catch (error) {
        errorMessage.value =
            error.response?.data?.message || 'Login failed. Please try again.'
    }
}

function goToSignup() {
    router.push('/SignupPage')
}
</script>