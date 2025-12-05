<template>
    <div class="container mt-4">
        <div class="row mt-4">
            <div class="col-12">
                <div style="font-family: 'Courier New', monospace; font-size: 14px; color: #333;" class="mb-3">
                    <div>Book/</div>
                    <div style="margin-left: 20px;">└── {{ book?.title || 'Loading...' }}</div>
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

        <div v-else-if="book">
            <div class="row">
                <div :class="isAdmin ? 'col-md-6' : 'col-12'">
                    <BookInfo :book="book" :isBorrowed="isBorrowed" :isBorrowedByUser="isBorrowedByUser" />
                    
                    <div class="d-flex justify-content-center mb-4">
                        <button 
                            v-if="isAuthenticated && !isAdmin"
                            class="btn btn-primary btn-lg"
                            @click="handleBorrowReturn"
                            :disabled="borrowLoading || !book"
                        >
                            <span v-if="borrowLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {{ isBorrowedByUser ? 'Return' : 'Borrow' }}
                        </button>
                    </div>
                </div>
                
                <div v-if="isAdmin" class="col-md-6">
                    <BorrowHistory :bookId="book._id" />
                </div>
            </div>

            <div v-if="relatedBooks.length > 0" class="mt-5">
                <div style="font-family: 'Courier New', monospace; font-size: 14px; color: #333;" class="mb-3">
                    <div>Book/</div>
                    <div style="margin-left: 20px;">└── Related Books</div>
                </div>
                <div class="related-books-container position-relative">
                    <button 
                        class="btn btn-outline-primary carousel-nav-btn prev-btn"
                        @click="scrollLeft"
                        :disabled="scrollPosition === 0"
                    >
                        <span>&laquo;</span>
                    </button>
                    
                    <div class="related-books-scroll" ref="scrollContainer">
                        <div class="related-books-wrapper">
                            <div 
                                v-for="relatedBook in relatedBooks" 
                                :key="relatedBook._id"
                                class="related-book-card"
                            >
                                <BookCard :book="relatedBook" />
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        class="btn btn-outline-primary carousel-nav-btn next-btn"
                        @click="scrollRight"
                        :disabled="isAtEnd"
                    >
                        <span>&raquo;</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import BookInfo from '@/components/BookInfo.vue';
import BookCard from '@/components/BookCard.vue';
import BorrowHistory from '@/components/BorrowHistory.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const route = useRoute();
const book = ref(null);
const relatedBooks = ref([]);
const loading = ref(true);
const error = ref(null);
const scrollContainer = ref(null);
const scrollPosition = ref(0);
const borrowLoading = ref(false);
const isBorrowed = ref(false);
const isBorrowedByUser = ref(false);

const API_BASE = 'http://localhost:3000/api/books';

const isAuthenticated = ref(false);
const isAdmin = ref(false);

const updateAuthStatus = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        isAuthenticated.value = false;
        isAdmin.value = false;
        return;
    }
    const token = localStorage.getItem('token');
    isAuthenticated.value = !!token;
    
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

updateAuthStatus();

const getUserId = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        const user = JSON.parse(userStr);
        return user._id;
    } catch {
        return null;
    }
};

const getAuthToken = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }
    return localStorage.getItem('token');
};

const checkBorrowStatus = async (bookId) => {
    if (!isAuthenticated.value || !bookId) {
        isBorrowed.value = false;
        isBorrowedByUser.value = false;
        return;
    }

    try {
        const token = getAuthToken();
        const userId = getUserId();
        
        const borrowHistoryResponse = await fetch(`${API_BASE}/${bookId}/borrow-history?page=1&limit=10`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (borrowHistoryResponse.ok) {
            const borrowHistoryData = await borrowHistoryResponse.json();
            if (borrowHistoryData.success && borrowHistoryData.data.items) {
                const activeBorrows = borrowHistoryData.data.items.filter(
                    borrow => borrow.status === 'active'
                );
                isBorrowed.value = activeBorrows.length > 0;
                
                isBorrowedByUser.value = activeBorrows.some(
                    borrow => borrow.userId === userId || borrow.userId._id === userId
                );
            } else {
                isBorrowed.value = false;
                isBorrowedByUser.value = false;
            }
        } else {
            isBorrowed.value = false;
            isBorrowedByUser.value = false;
        }
    } catch (err) {
        isBorrowed.value = false;
        isBorrowedByUser.value = false;
    }
};

const fetchBook = async () => {
    loading.value = true;
    error.value = null;
    
    try {
        const bookId = props.id || route.params.id;
        const response = await fetch(`${API_BASE}/${bookId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch book');
        }
        
        const data = await response.json();
        
        if (data.success) {
            book.value = data.data;
            await checkBorrowStatus(data.data._id);
            await fetchRelatedBooks(data.data.category, data.data._id);
        } else {
            throw new Error(data.message || 'Book not found');
        }
    } catch (err) {
        error.value = err.message || 'An error occurred while fetching the book';
    } finally {
        loading.value = false;
    }
};

const handleBorrowReturn = async () => {
    if (!book.value || !isAuthenticated.value) return;
    
    borrowLoading.value = true;
    const bookId = book.value._id;
    const token = getAuthToken();
    
    try {
        const endpoint = isBorrowedByUser.value ? 'return' : 'borrow';
        const response = await fetch(`${API_BASE}/${bookId}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (isBorrowedByUser.value) {
                isBorrowedByUser.value = false;
                await checkBorrowStatus(bookId);
            } else {
                isBorrowedByUser.value = true;
                isBorrowed.value = true;
            }
            
            book.value.isBorrowed = isBorrowed.value;
        } else {
            error.value = data.message || `Failed to ${isBorrowedByUser.value ? 'return' : 'borrow'} book`;
        }
    } catch (err) {
        error.value = err.message || `An error occurred while ${isBorrowedByUser.value ? 'returning' : 'borrowing'} the book`;
    } finally {
        borrowLoading.value = false;
    }
};

const fetchRelatedBooks = async (category, currentBookId) => {
    try {
        const response = await fetch(`${API_BASE}?category=${encodeURIComponent(category)}&limit=10`);
        const data = await response.json();
        
        if (data.success) {
            relatedBooks.value = (data.data.items || []).filter(
                b => b._id !== currentBookId
            ).slice(0, 10);
            
            if (isAdmin.value) {
                await checkBorrowStatusForRelatedBooks();
            }
        }
    } catch (err) {
    }
};

const checkBorrowStatusForRelatedBooks = async () => {
    if (!isAdmin.value) return;
    
    const token = getAuthToken();
    if (!token) return;
    
    const statusChecks = relatedBooks.value.map(async (book) => {
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
        const book = relatedBooks.value.find(b => b._id === result.bookId);
        if (book) {
            book.isBorrowed = result.isBorrowed;
        }
    });
};

const scrollLeft = () => {
    if (scrollContainer.value) {
        const cardWidth = scrollContainer.value.querySelector('.related-book-card')?.offsetWidth || 300;
        const scrollAmount = cardWidth * 2;
        scrollPosition.value = Math.max(0, scrollPosition.value - scrollAmount);
        scrollContainer.value.scrollTo({
            left: scrollPosition.value,
            behavior: 'smooth'
        });
    }
};

const scrollRight = () => {
    if (scrollContainer.value) {
        const cardWidth = scrollContainer.value.querySelector('.related-book-card')?.offsetWidth || 300;
        const scrollAmount = cardWidth * 2;
        const maxScroll = scrollContainer.value.scrollWidth - scrollContainer.value.clientWidth;
        scrollPosition.value = Math.min(maxScroll, scrollPosition.value + scrollAmount);
        scrollContainer.value.scrollTo({
            left: scrollPosition.value,
            behavior: 'smooth'
        });
    }
};

const isAtEnd = computed(() => {
    if (!scrollContainer.value) return false;
    const maxScroll = scrollContainer.value.scrollWidth - scrollContainer.value.clientWidth;
    return scrollPosition.value >= maxScroll - 10;
});

const handleScroll = () => {
    if (scrollContainer.value) {
        scrollPosition.value = scrollContainer.value.scrollLeft;
    }
};

watch(() => route.params.id, () => {
    scrollPosition.value = 0;
    fetchBook();
});

const handleStorageChange = () => {
    updateAuthStatus();
};

onMounted(() => {
    fetchBook();
    updateAuthStatus();

    if (scrollContainer.value) {
        scrollContainer.value.addEventListener('scroll', handleScroll);
    }
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('login', handleStorageChange);
});

onUnmounted(() => {
    if (scrollContainer.value) {
        scrollContainer.value.removeEventListener('scroll', handleScroll);
    }
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('login', handleStorageChange);
});
</script>

<style scoped>
.related-books-container {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.related-books-scroll {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    -ms-overflow-style: none;
}

.related-books-scroll::-webkit-scrollbar {
    height: 8px;
}

.related-books-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.related-books-scroll::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
}

.related-books-scroll::-webkit-scrollbar-thumb:hover {
    background: #555;
}

.related-books-wrapper {
    display: flex;
    gap: 1rem;
    padding: 0.5rem 0;
}

.related-book-card {
    flex: 0 0 280px;
    min-width: 280px;
}

.related-book-card :deep(.card) {
    margin-bottom: 0;
}

.related-book-card :deep(.card-img-top) {
    height: 150px !important;
}

.related-book-card :deep(.card-body) {
    padding: 0.75rem;
}

.related-book-card :deep(.card-title) {
    font-size: 1rem;
    margin-bottom: 0.5rem;
}

.related-book-card :deep(.card-text) {
    font-size: 0.875rem;
}

.related-book-card :deep(.btn) {
    font-size: 0.875rem;
    padding: 0.25rem 0.5rem;
}

.carousel-nav-btn {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    z-index: 10;
}

.carousel-nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .related-book-card {
        flex: 0 0 240px;
        min-width: 240px;
    }
    
    .carousel-nav-btn {
        width: 35px;
        height: 35px;
        font-size: 0.875rem;
    }
}
</style>
