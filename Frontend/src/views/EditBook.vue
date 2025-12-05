<template>
    <div>
        <div class="container mt-4">
            <div class="row mt-4">
                <div class="col-12">
                    <div style="font-family: 'Courier New', monospace; font-size: 14px; color: #333;" class="mb-3">
                        <div>Book/</div>
                        <div style="margin-left: 20px;">└── Edit: {{ book?.title || 'Loading...' }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="loading" class="text-center mt-4">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <div v-else-if="error" class="alert alert-danger mt-4" role="alert">
            {{ error }}
        </div>

        <div v-else-if="!isAdmin" class="alert alert-warning mt-4" role="alert">
            Access denied. Admin privileges required.
        </div>

        <BookForm v-else-if="book && isAdmin" :book="book" @success="handleSuccess" @cancel="handleCancel" />
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BookForm from '@/components/BookForm.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const route = useRoute();
const router = useRouter();
const book = ref(null);
const loading = ref(true);
const error = ref(null);

const API_BASE = 'http://localhost:3000/api/books';

const isAdmin = computed(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return false;
    }
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    try {
        const user = JSON.parse(userStr);
        return user.role === 'admin';
    } catch {
        return false;
    }
});

const getAuthToken = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }
    return localStorage.getItem('token');
};

const fetchBook = async () => {
    loading.value = true;
    error.value = null;

    try {
        const bookId = props.id || route.params.id;
        const token = getAuthToken();
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_BASE}/${bookId}`, {
            headers
        });

        if (!response.ok) {
            throw new Error('Failed to fetch book');
        }

        const data = await response.json();

        if (data.success) {
            book.value = data.data;
        } else {
            throw new Error(data.message || 'Book not found');
        }
    } catch (err) {
        error.value = err.message || 'An error occurred while fetching the book';
    } finally {
        loading.value = false;
    }
};

const handleSuccess = (data) => {
    if (data?.deleted) {
        router.push('/books');
    } else {
        router.push('/books');
    }
};

const handleCancel = () => {
    router.push('/books');  
};

watch(() => route.params.id, () => {
    fetchBook();
});

onMounted(() => {
    fetchBook();
});
</script>

<style scoped>
</style>
