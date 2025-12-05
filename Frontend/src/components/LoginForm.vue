<template>
    <form @submit.prevent="handleSubmit">
        <div class="mb-3">
            <label for="email" class="form-label" style="color: black;">Email address</label>
            <input 
                type="email" 
                class="form-control" 
                :class="{ 'is-invalid': errors.email }"
                id="email" 
                v-model="formData.email"
                style="color: black; background-color: white;"
                required
            >
            <div v-if="errors.email" class="invalid-feedback">{{ errors.email }}</div>
        </div>
        
        <div class="mb-3">
            <label for="password" class="form-label" style="color: black;">Password</label>
            <input 
                type="password" 
                class="form-control" 
                :class="{ 'is-invalid': errors.password }"
                id="password" 
                v-model="formData.password"
                style="color: black; background-color: white;"
                required
            >
            <div v-if="errors.password" class="invalid-feedback">{{ errors.password }}</div>
        </div>
        
        <div class="mb-3 form-check">
            <input 
                type="checkbox" 
                class="form-check-input" 
                id="rememberMe"
                v-model="formData.rememberMe"
            >
            <label class="form-check-label" for="rememberMe" style="color: black;">
                Remember me
            </label>
        </div>
        
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
        </div>
        
        <button 
            type="submit" 
            class="btn btn-primary w-100"
            :disabled="submitting"
            style="background-color: #0d6efd; border-color: #0d6efd;"
        >
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ submitting ? 'Logging in...' : 'Login' }}
        </button>
    </form>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const formData = reactive({
    email: '',
    password: '',
    rememberMe: false
});

const errors = reactive({
    email: '',
    password: ''
});

const errorMessage = ref('');
const submitting = ref(false);

const validateForm = () => {
    let isValid = true;
    
    errors.email = '';
    errors.password = '';
    errorMessage.value = '';
    
    if (!formData.email || typeof formData.email !== 'string' || formData.email.trim().length === 0) {
        errors.email = 'Email is required';
        isValid = false;
    } else if (!isValidEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
    }
    
    if (!formData.password || typeof formData.password !== 'string' || formData.password.trim().length === 0) {
        errors.password = 'Password is required';
        isValid = false;
    }
    
    return isValid;
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const handleSubmit = async () => {
    if (!validateForm()) {
        return;
    }
    
    submitting.value = true;
    errorMessage.value = '';
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: formData.email.trim(),
                password: formData.password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            const redirectPath = route.query.redirect || '/';
            router.push(redirectPath);
        } else {
            if (data.errors) {
                if (data.errors.email) {
                    errors.email = data.errors.email;
                }
                if (data.errors.password) {
                    errors.password = data.errors.password;
                }
            }
            errorMessage.value = data.message || 'Login failed. Please check your credentials.';
        }
    } catch (err) {
        errorMessage.value = 'An error occurred while logging in. Please try again.';
    } finally {
        submitting.value = false;
    }
};
</script>

<style scoped>
</style>

