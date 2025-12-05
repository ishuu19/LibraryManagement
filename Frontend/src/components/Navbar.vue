<template>
    <header class="header">
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark" style="width: 100%; padding: 1rem 2rem;">
            <div class="container-fluid">
                <router-link class="navbar-brand text-white" to="/" style="font-size: 1.8rem; font-weight: 700;">Online Library</router-link>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup"
                    aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div class="navbar-nav me-auto">
                        <router-link class="nav-item nav-link text-white" to="/"
                            active-class="active"
                            style="font-size: 1.2rem; font-weight: 600; margin: 0 3rem;">Home</router-link>
                        <router-link class="nav-item nav-link text-white" to="/books"
                            active-class="active"
                            style="font-size: 1.2rem; font-weight: 600; margin: 0 3rem;">Books</router-link>
                        <router-link class="nav-item nav-link text-white" to="/search"
                            active-class="active"
                            style="font-size: 1.2rem; font-weight: 600; margin: 0 3rem;">Search</router-link>
                        <router-link 
                            v-if="isAdmin"
                            class="nav-item nav-link text-white" 
                            to="/admin/users"
                            active-class="active"
                            style="font-size: 1.2rem; font-weight: 600; margin: 0 3rem;">Users</router-link>
                    </div>
                    <div class="navbar-nav ms-auto">
                        <div v-if="!isAuthenticated" class="nav-item">
                            <router-link class="nav-link text-white" to="/login" style="font-size: 1.2rem; font-weight: 600;">
                                Login
                            </router-link>
                        </div>
                        <div v-else class="d-flex align-items-center">
                            <button 
                                class="btn btn-outline-light" 
                                @click="handleLogout"
                                :disabled="loggingOut"
                                style="font-size: 1rem; font-weight: 600;"
                            >
                                <span v-if="loggingOut" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                {{ loggingOut ? 'Logging out...' : 'Logout' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isAuthenticated = ref(false);
const userEmail = ref('');
const loggingOut = ref(false);
const isAdmin = ref(false);

const checkAuth = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        isAuthenticated.value = false;
        userEmail.value = '';
        isAdmin.value = false;
        return;
    }
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    isAuthenticated.value = !!token;
    
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            userEmail.value = user.email || '';
            isAdmin.value = user.role === 'admin';
        } catch {
            userEmail.value = '';
            isAdmin.value = false;
        }
    } else {
        userEmail.value = '';
        isAdmin.value = false;
    }
};

const handleLogout = async () => {
    loggingOut.value = true;
    
    try {
        const token = localStorage.getItem('token');
        
        if (token) {
            const response = await fetch('http://localhost:3000/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            await response.json();
        }
    } catch (err) {
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        isAuthenticated.value = false;
        userEmail.value = '';
        isAdmin.value = false;
        loggingOut.value = false;
        router.push('/');
    }
};

const storageListener = (e) => {
    if (e.key === 'token' || e.key === 'user') {
        checkAuth();
    }
};

onMounted(() => {
    checkAuth();
    window.addEventListener('storage', storageListener);
    window.addEventListener('login', checkAuth);
});

onUnmounted(() => {
    window.removeEventListener('storage', storageListener);
    window.removeEventListener('login', checkAuth);
});

setInterval(checkAuth, 1000);
</script>

<style scoped>
</style>