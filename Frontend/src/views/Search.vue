<template>
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div style="font-family: 'Courier New', monospace; font-size: 14px; color: #333;">
                <div>Book/</div>
                <div style="margin-left: 20px;">└── Search</div>
            </div>
        </div>

        <div class="row">
            <div class="col-12 col-md-4 order-1 order-md-2 mb-4 mb-md-0">
                <SearchBox
                    :keyword="searchParams.keyword"
                    :category="searchParams.category"
                    :location="searchParams.location"
                    :sortBy="searchParams.sortBy"
                    :sortOrder="searchParams.sortOrder"
                    @update:keyword="updateKeyword"
                    @update:category="updateCategory"
                    @update:location="updateLocation"
                    @update:sortBy="updateSortBy"
                    @update:sortOrder="updateSortOrder"
                    @reset="handleReset"
                />
            </div>

            <div class="col-12 col-md-8 order-2 order-md-1">
                <div v-if="loading" class="text-center">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>

                <div v-else-if="error" class="alert alert-danger" role="alert">
                    {{ error }}
                </div>

                <div v-else-if="books.length === 0" class="alert alert-info" role="alert">
                    <h5>No results found</h5>
                    <p>Try adjusting your search criteria or filters.</p>
                </div>

                <div v-else class="row">
                    <div class="col-md-6 mb-4" v-for="book in books" :key="book._id">
                        <BookCard :book="book" />
                    </div>
                </div>

                <Pagination 
                    v-if="!loading && !error && totalPages > 1"
                    :currentPage="currentPage" 
                    :totalPages="totalPages"
                    @page-change="handlePageChange"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BookCard from '@/components/BookCard.vue';
import SearchBox from '@/components/SearchBox.vue';
import Pagination from '@/components/Pagination.vue';

const books = ref([]);
const loading = ref(true);
const error = ref(null);
const pagination = ref({ total: 0, totalPages: 1, currentPage: 1, limit: 6 });
const route = useRoute();
const router = useRouter();

const searchParams = ref({
    keyword: '',
    category: '',
    location: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
});

const currentPage = computed(() => {
    const pageFromRoute = parseInt(route.query.page) || pagination.value.currentPage || 1;
    return pageFromRoute;
});

const totalPages = computed(() => {
    return pagination.value.totalPages;
});

const initializeFromRoute = () => {
    searchParams.value = {
        keyword: route.query.keyword || '',
        category: route.query.category || '',
        location: route.query.location || '',
        sortBy: route.query.sortBy || 'createdAt',
        sortOrder: route.query.sortOrder || 'desc'
    };
};

const fetchBooks = async () => {
    loading.value = true;
    error.value = null;
    
    try {
        const queryParams = new URLSearchParams();
        
        if (searchParams.value.keyword) {
            queryParams.append('keyword', searchParams.value.keyword);
        }
        if (searchParams.value.category) {
            queryParams.append('category', searchParams.value.category);
        }
        if (searchParams.value.location) {
            queryParams.append('location', searchParams.value.location);
        }
        
        queryParams.append('sortBy', searchParams.value.sortBy);
        queryParams.append('sortOrder', searchParams.value.sortOrder);
        
        const page = parseInt(route.query.page) || 1;
        queryParams.append('page', page.toString());
        queryParams.append('limit', '6');
        
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

const updateRoute = () => {
    const query = { ...route.query };
    
    if (searchParams.value.keyword) {
        query.keyword = searchParams.value.keyword;
    } else {
        delete query.keyword;
    }
    
    if (searchParams.value.category) {
        query.category = searchParams.value.category;
    } else {
        delete query.category;
    }
    
    if (searchParams.value.location) {
        query.location = searchParams.value.location;
    } else {
        delete query.location;
    }
    
    query.sortBy = searchParams.value.sortBy;
    query.sortOrder = searchParams.value.sortOrder;
    
    query.page = '1';
    
    router.push({ query });
};

const updateKeyword = (value) => {
    searchParams.value.keyword = value;
    updateRoute();
};

const updateCategory = (value) => {
    searchParams.value.category = value;
    updateRoute();
};

const updateLocation = (value) => {
    searchParams.value.location = value;
    updateRoute();
};

const updateSortBy = (value) => {
    searchParams.value.sortBy = value;
    updateRoute();
};

const updateSortOrder = (value) => {
    searchParams.value.sortOrder = value;
    updateRoute();
};

const handlePageChange = (page) => {
    router.push({
        query: {
            ...route.query,
            page: page
        }
    });
};

const handleReset = () => {
    searchParams.value = {
        keyword: '',
        category: '',
        location: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    };
    router.push({ path: '/search', query: {} });
};

watch(() => route.query, () => {
    initializeFromRoute();
    fetchBooks();
}, { deep: true });

onMounted(() => {
    initializeFromRoute();
    fetchBooks();
});
</script>

<style scoped>

</style>