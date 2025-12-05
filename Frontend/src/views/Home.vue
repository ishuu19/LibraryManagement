<template>
    <div class="container-fluid">
        <BookCarousel :highlightedBooks="highlightedBooks" />
        
        <nav class="booksNav mt-4">
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <button 
                        class="nav-link"
                        :class="{ active: activeTab === 'newBooks' }"
                        @click="activeTab = 'newBooks'"
                    >
                        New
                    </button>
                </li>
                <li class="nav-item">
                    <button 
                        class="nav-link"
                        :class="{ active: activeTab === 'trendingBooks' }"
                        @click="activeTab = 'trendingBooks'"
                    >
                        Trending
                    </button>
                </li>
                <li class="nav-item">
                    <button 
                        class="nav-link"
                        :class="{ active: activeTab === 'hotBooks' }"
                        @click="activeTab = 'hotBooks'"
                    >
                        Hot
                    </button>
                </li>
            </ul>
        </nav>

        <div id="newBooks" class="tab-content mt-4" v-show="activeTab === 'newBooks'">
            <div v-if="loading" class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            <div v-else-if="newBooks.length > 0">
                <div 
                    v-for="book in newBooks" 
                    :key="book._id"
                    class="card flex-row flex-wrap mb-3"
                >
                    <div class="card-header border-0">
                        <router-link :to="`/book/detail/${book._id}`" class="text-decoration-none">
                            <img 
                                :src="book.coverImage || 'https://shorturl.at/y1vem'" 
                                :alt="book.title" 
                                class="img-fluid"
                                style="width: 64px; height: 64px; object-fit: cover;" 
                            />
                        </router-link>
                    </div>
                    <div class="card-block px-2">
                        <h4 class="card-title">{{ book.title }}</h4>
                        <p class="card-text"><strong>Author:</strong> {{ book.author }}</p>
                        <p class="card-text"><strong>Category:</strong> {{ book.category }}</p>
                    </div>
                </div>
            </div>
            <div v-else class="alert alert-info">No new books available</div>
        </div>

        <div id="trendingBooks" class="tab-content mt-4" v-show="activeTab === 'trendingBooks'">
            <div v-if="loading" class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            <div v-else-if="trendingBooks.length > 0">
                <div 
                    v-for="book in trendingBooks" 
                    :key="book._id"
                    class="card flex-row flex-wrap mb-3"
                >
                    <div class="card-header border-0">
                        <router-link :to="`/book/detail/${book._id}`" class="text-decoration-none">
                            <img 
                                :src="book.coverImage || 'https://shorturl.at/y1vem'" 
                                :alt="book.title" 
                                class="img-fluid"
                                style="width: 64px; height: 64px; object-fit: cover;" 
                            />
                        </router-link>
                    </div>
                    <div class="card-block px-2">
                        <h4 class="card-title">{{ book.title }}</h4>
                        <p class="card-text"><strong>Author:</strong> {{ book.author }}</p>
                        <p class="card-text"><strong>Category:</strong> {{ book.category }}</p>
                    </div>
                </div>
            </div>
            <div v-else class="alert alert-info">No trending books available</div>
        </div>

        <div id="hotBooks" class="tab-content mt-4" v-show="activeTab === 'hotBooks'">
            <div v-if="loading" class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            <div v-else-if="hotBooks.length > 0">
                <div 
                    v-for="book in hotBooks" 
                    :key="book._id"
                    class="card flex-row flex-wrap mb-3"
                >
                    <div class="card-header border-0">
                        <router-link :to="`/book/detail/${book._id}`" class="text-decoration-none">
                            <img 
                                :src="book.coverImage || 'https://shorturl.at/y1vem'" 
                                :alt="book.title" 
                                class="img-fluid"
                                style="width: 64px; height: 64px; object-fit: cover;" 
                            />
                        </router-link>
                    </div>
                    <div class="card-block px-2">
                        <h4 class="card-title">{{ book.title }}</h4>
                        <p class="card-text"><strong>Author:</strong> {{ book.author }}</p>
                        <p class="card-text"><strong>Category:</strong> {{ book.category }}</p>
                    </div>
                </div>
            </div>
            <div v-else class="alert alert-info">No hot books available</div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BookCarousel from '@/components/BookCarousel.vue';

const activeTab = ref('newBooks');
const loading = ref(true);
const highlightedBooks = ref([]);
const newBooks = ref([]);
const trendingBooks = ref([]);
const hotBooks = ref([]);

const API_BASE = 'http://localhost:3000/api/books';

const fetchHighlightedBooks = async () => {
    try {
        const response = await fetch(`${API_BASE}?isHighlighted=true&sortBy=createdAt&sortOrder=desc&limit=3`);
        const data = await response.json();
        if (data.success) {
            highlightedBooks.value = data.data.items || [];
        }
    } catch (err) {
        console.error('Error fetching highlighted books:', err);
    }
};

const fetchHomepageData = async () => {
    try {
        const response = await fetch(`${API_BASE}?homepage=true`);
        const data = await response.json();
        if (data.success) {
            newBooks.value = data.data.latest || [];
            trendingBooks.value = data.data.trending || [];
            hotBooks.value = data.data.hot || [];
        }
    } catch (err) {
        console.error('Error fetching homepage data:', err);
    }
};

const fetchAllData = async () => {
    loading.value = true;
    try {
        await Promise.all([
            fetchHighlightedBooks(),
            fetchHomepageData()
        ]);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchAllData();
});
</script>

<style scoped>
.nav-tabs .nav-link {
    cursor: pointer;
    border: 1px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
}

.nav-tabs .nav-link:hover {
    border-color: #e9ecef #e9ecef #dee2e6;
}

.nav-tabs .nav-link.active {
    color: #495057;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
}

.tab-content {
    min-height: 200px;
}
</style>