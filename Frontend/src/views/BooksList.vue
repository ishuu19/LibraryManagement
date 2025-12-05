<template>
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div style="font-family: 'Courier New', monospace; font-size: 14px; color: #333;">
                <div>Book/</div>
                <div style="margin-left: 20px;">└── All Books</div>
            </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-4 mt-4 gap-3 flex-wrap">
            <div class="d-flex align-items-center gap-2 flex-grow-1">
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Search books..."
                    v-model="searchKeyword"
                    @input="handleSearch"
                    style="max-width: 300px;"
                >
                <select 
                    class="form-select" 
                    v-model="selectedCategory"
                    @change="handleCategoryChange"
                    style="max-width: 200px;"
                >
                    <option value="">All Categories</option>
                    <option value="Science">Science</option>
                    <option value="Technology">Technology</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Arts">Arts</option>
                    <option value="Literature">Literature</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="Philosophy">Philosophy</option>
                    <option value="Psychology">Psychology</option>
                    <option value="Sociology">Sociology</option>
                    <option value="Economics">Economics</option>
                    <option value="Business">Business</option>
                    <option value="Law">Law</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Politics">Politics</option>
                    <option value="Religion">Religion</option>
                    <option value="Environment">Environment</option>
                </select>
            </div>
            <div>
                <button 
                    v-if="isAdmin" 
                    class="btn btn-primary"
                    @click="handleAddBook"
                >
                    Add New Book
                </button>
                <button 
                    v-else 
                    class="btn btn-primary"
                    @click="showAdminModal = true"
                >
                    Add New Book
                </button>
            </div>
        </div>
        
        <div v-if="loading" class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        
        <div v-else-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>
        
        <div v-else-if="books.length === 0" class="alert alert-info" role="alert">
            No books found.
        </div>
        
        <div v-else class="row">
            <div class="col-md-4 mb-4" v-for="book in books" :key="book._id">
                <BookCard :book="book" />
            </div>
        </div>
        
        <Pagination 
            v-if="!loading && !error && totalPages > 1"
            :currentPage="currentPage" 
            :totalPages="totalPages"
            @page-change="handlePageChange"
        />
        
        <Modal 
            :show="showAdminModal" 
            title="Admin Functionality"
            message="This feature is only available for administrators."
            @close="showAdminModal = false"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BookCard from '@/components/BookCard.vue';
import Pagination from '@/components/Pagination.vue';
import Modal from '@/components/Modal.vue';

const books = ref([]);
const loading = ref(true);
const error = ref(null);
const pagination = ref({ total: 0, totalPages: 1, currentPage: 1, limit: 6 });
const route = useRoute();
const router = useRouter();
const searchKeyword = ref(route.query.keyword || '');
const selectedCategory = ref(route.query.category || '');
const showAdminModal = ref(false);

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

const currentPage = computed(() => {
    const pageFromRoute = parseInt(route.query.page) || pagination.value.currentPage || 1;
    return pageFromRoute;
});

const totalPages = computed(() => {
    return pagination.value.totalPages;
});

const API_BASE = 'http://localhost:3000/api/books';

const fetchBooks = async () => {
    loading.value = true;
    error.value = null;
    
    try {
        const queryParams = new URLSearchParams();
        
        if (route.query.keyword) queryParams.append('keyword', route.query.keyword);
        if (route.query.category) queryParams.append('category', route.query.category);
        if (route.query.location) queryParams.append('location', route.query.location);
        if (route.query.isHighlighted) queryParams.append('isHighlighted', route.query.isHighlighted);
        if (route.query.sortBy) queryParams.append('sortBy', route.query.sortBy);
        if (route.query.sortOrder) queryParams.append('sortOrder', route.query.sortOrder);
        
        const page = parseInt(route.query.page) || 1;
        queryParams.append('page', page.toString());
        
        if (route.query.limit) {
            queryParams.append('limit', route.query.limit);
        } else {
            queryParams.append('limit', '6');
        }
        
        const url = `http://localhost:3000/api/books?${queryParams.toString()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }
        
        const data = await response.json();
        
        if (data.success) {
            books.value = data.data.items || [];
            if (data.data.pagination) {
                pagination.value = {
                    total: data.data.pagination.total || 0,
                    totalPages: data.data.pagination.totalPages || 1,
                    currentPage: data.data.pagination.currentPage || page,
                    limit: data.data.pagination.limit || 6
                };
            }
            
            if (isAdmin.value) {
                await checkBorrowStatusForBooks();
            }
        } else {
            throw new Error(data.message || 'Failed to fetch books');
        }
    } catch (err) {
        error.value = err.message || 'An error occurred while fetching books';
        books.value = [];
    } finally {
        loading.value = false;
    }
};

const handlePageChange = (page) => {
    router.push({
        query: {
            ...route.query,
            page: page
        }
    });
};

const handleSearch = () => {
    router.push({
        query: {
            ...route.query,
            keyword: searchKeyword.value || undefined,
            page: 1
        }
    });
};

const handleCategoryChange = () => {
    router.push({
        query: {
            ...route.query,
            category: selectedCategory.value || undefined,
            page: 1
        }
    });
};

const handleAddBook = () => {
    router.push('/book/add');
};

const getAuthToken = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }
    return localStorage.getItem('token');
};

const checkBorrowStatusForBooks = async () => {
    if (!isAdmin.value) return;
    
    const token = getAuthToken();
    if (!token) return;
    
    const statusChecks = books.value.map(async (book) => {
        try {
            const response = await fetch(`${API_BASE}/${book._id}/borrow-history?page=1&limit=10`, {
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
                    return { bookId: book._id, isBorrowed: activeBorrows.length > 0 };
                }
            }
            return { bookId: book._id, isBorrowed: false };
        } catch (err) {
            return { bookId: book._id, isBorrowed: false };
        }
    });
    
    const results = await Promise.all(statusChecks);
    
    results.forEach(result => {
        const book = books.value.find(b => b._id === result.bookId);
        if (book) {
            book.isBorrowed = result.isBorrowed;
        }
    });
};

watch(() => route.query, () => {
    searchKeyword.value = route.query.keyword || '';
    selectedCategory.value = route.query.category || '';
    fetchBooks();
}, { deep: true });

const handleStorageChange = () => {
    updateAdminStatus();
};

onMounted(() => {
    fetchBooks();
    updateAdminStatus();
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('login', handleStorageChange);
});

onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('login', handleStorageChange);
});
</script>

<style scoped>
.gap-2 {
    gap: 0.5rem;
}

.gap-3 {
    gap: 1rem;
}

@media (max-width: 768px) {
    .d-flex.gap-3 {
        flex-direction: column;
        align-items: stretch !important;
    }
    
    .d-flex.gap-3 > div:first-child {
        flex-direction: column;
    }
    
    .d-flex.gap-3 input,
    .d-flex.gap-3 select {
        max-width: 100% !important;
        width: 100%;
    }
}
</style>