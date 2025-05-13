<template>
    <v-container class="fill-height" fluid>
        <v-row justify="center">
            <v-col cols="12" sm="8" md="4">
                <v-card class="pa-6" elevation="10">
                    <v-card-title class="text-h5 text-center mb-4">
                        Sign Up
                    </v-card-title>

                    <v-form @submit.prevent="handleSignup" ref="form">
                        <v-text-field v-model="username" label="Username" prepend-inner-icon="mdi-account"
                            required></v-text-field>

                        <v-text-field v-model="email" label="Email" prepend-inner-icon="mdi-email"
                            required></v-text-field>

                        <v-text-field v-model="password" label="Password" type="password" prepend-inner-icon="mdi-lock"
                            required></v-text-field>

                        <v-btn type="submit" color="primary" class="mt-4" block>
                            Sign Up
                        </v-btn>
                    </v-form>

                    <v-alert v-if="errorMessage" type="error" class="mt-4" dense text>
                        {{ errorMessage }}
                    </v-alert>

                    <v-btn variant="text" color="primary" class="mt-2" block @click="goToLogin">
                        Already have an account? Login
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
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const form = ref(null)

const router = useRouter()

async function handleSignup() {
    if (!username.value || !email.value || !password.value) {
        errorMessage.value = 'Please fill in all fields.'
        return
    }

    try {
        const response = await axios.post('/iapi/api/auth/signup', {
            username: username.value,
            email: email.value,
            password: password.value
        })
            
        router.push('/loginPage')
    } catch (error) {
        errorMessage.value =
            error.response?.data?.message || 'Signup failed. Please try again.'
    }
}

function goToLogin() {
    router.push('/LoginPage')
}
</script>