<template>
    <div class="card h-100">
        <router-link :to="`/book/detail/${book._id}`" class="text-decoration-none">
            <img v-if="book.coverImage" class="card-img-top" :src="book.coverImage" :alt="book.title"
                style="height: 200px; object-fit: cover;">
        </router-link>
        <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ book.title }}</h5>
            <h5 class="card-text text-muted fst-italic fs-6">{{ book.author }}</h5>
            <p class="card-text flex-grow-1">{{ truncateDescription(book.description) }}</p>
            <div class="mt-auto d-flex justify-content-between align-items-center">
                <div class="d-flex justify-content-between align-items-center">
                    <button 
                        v-if="isAdmin" 
                        class="btn btn-secondary"
                        @click="handleEdit"
                    >
                        Edit
                    </button>
                    <button 
                        v-else 
                        class="btn btn-secondary"
                        @click="showAdminModal = true"
                    >
                        Edit
                    </button>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <p class="card-text fw-bold border border-dark p-2 rounded" :class="isCurrentlyBorrowed ? 'text-danger' : 'text-success'">
                        {{ isCurrentlyBorrowed ? 'Borrowed' : 'Available' }}
                    </p>
                </div>
            </div>
        </div>
        <div class="card-footer">
            <small class="text-muted">Last updated {{ daysAgo }} days ago</small>
        </div>
        
        <Modal
            :show="showAdminModal"
            title="Admin Functionality"
            message="This feature is only available for administrators."
            @close="showAdminModal = false"
        />
    </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Modal from '@/components/Modal.vue';

const props = defineProps({
    book: {
        type: Object,
        required: true
    }
});

const router = useRouter();
const showAdminModal = ref(false);
const isCurrentlyBorrowed = ref(false);
const checkingStatus = ref(false);

const API_BASE = 'http://localhost:3000/api/books';

const isAdmin = ref(false);

const updateAdminStatus = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        isAdmin.value = false;
        return;
    }
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        isAdmin.value = false;
        return;
    }
    try {
        const user = JSON.parse(userStr);
        isAdmin.value = user.role === 'admin';
    } catch {
        isAdmin.value = false;
    }
};

updateAdminStatus();

const getAuthToken = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }
    return localStorage.getItem('token');
};

const checkBorrowStatus = async () => {
    if (checkingStatus.value || !props.book?._id) return;
    
    if (props.book.isBorrowed !== undefined) {
        isCurrentlyBorrowed.value = props.book.isBorrowed;
        return;
    }
    
    checkingStatus.value = true;
    const token = getAuthToken();
    
    if (!token || !isAdmin.value) {
        isCurrentlyBorrowed.value = false;
        checkingStatus.value = false;
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/${props.book._id}/borrow-history?page=1&limit=10`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {  
            const data = await response.json();
            if (data.success && data.data.items) {
                const activeBorrows = data.data.items.filter(
                    borrow => borrow.status === 'active'
                );
                isCurrentlyBorrowed.value = activeBorrows.length > 0;
            } else {
                isCurrentlyBorrowed.value = false;
            }
        } else {
            isCurrentlyBorrowed.value = false;
        }
    } catch (err) {
        isCurrentlyBorrowed.value = false;
    } finally {
        checkingStatus.value = false;
    }
};

const daysAgo = computed(() => {
    if (!props.book.updatedAt) return 0;
    const updatedDate = new Date(props.book.updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now - updatedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

const truncateDescription = (description) => {
    if (!description) return '';
    return description.length > 150 ? description.substring(0, 150) + '...' : description;
};

const handleEdit = () => {
    router.push(`/book/edit/${props.book._id}`);
};

watch(() => props.book.isBorrowed, (newVal) => {
    if (newVal !== undefined) {
        isCurrentlyBorrowed.value = newVal;
    }
}, { immediate: true });

const handleStorageChange = () => {
    updateAdminStatus();
};

onMounted(() => {
    checkBorrowStatus();
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('login', handleStorageChange);
});

onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('login', handleStorageChange);
});
</script>

<style scoped>
.card {
    margin-bottom: 1.5rem;
}
</style>