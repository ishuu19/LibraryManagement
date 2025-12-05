<template>
    <div class="search-box card p-4">
        <h5 class="mb-4 text-center">Search & Filter</h5>
        
        <div class="mb-3">
            <input 
                type="text" 
                class="form-control" 
                id="keyword"
                v-model="localKeyword"
                @input="handleKeywordChange"
                placeholder="Enter keywords..."
            >
        </div>

        <div class="mb-3">
            <label for="category" class="form-label">Category</label>
            <select 
                class="form-select" 
                id="category"
                v-model="localCategory"
                @change="handleCategoryChange"
            >
                <option value="">Choose...</option>
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

        <div class="mb-3">
            <label for="location" class="form-label">Location</label>
            <select 
                class="form-select" 
                id="location"
                v-model="localLocation"
                @change="handleLocationChange"
            >
                <option value="">Choose...</option>
                <option value="Shelf A1">Shelf A1</option>
                <option value="Shelf A2">Shelf A2</option>
                <option value="Shelf A3">Shelf A3</option>
                <option value="Shelf B1">Shelf B1</option>
                <option value="Shelf B2">Shelf B2</option>
                <option value="Shelf B3">Shelf B3</option>
                <option value="Shelf C1">Shelf C1</option>
                <option value="Shelf C2">Shelf C2</option>
                <option value="Shelf C3">Shelf C3</option>
            </select>
        </div>

        <div class="mb-3">
            <label for="sortBy" class="form-label">Sort By</label>
            <select 
                class="form-select" 
                id="sortBy"
                v-model="localSortBy"
                @change="handleSortByChange"
            >
                <option value="createdAt">Publication Date</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="year">Year</option>
            </select>
        </div>

        <div class="mb-3">
            <label for="sortOrder" class="form-label">Sort Order</label>
            <select 
                class="form-select" 
                id="sortOrder"
                v-model="localSortOrder"
                @change="handleSortOrderChange"
            >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
            </select>
        </div>

        <button 
            class="btn btn-primary w-100" 
            @click="handleReset"
        >
            Reset Filters
        </button>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    keyword: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    sortBy: {
        type: String,
        default: 'createdAt'
    },
    sortOrder: {
        type: String,
        default: 'desc'
    }
});

const emit = defineEmits(['update:keyword', 'update:category', 'update:location', 'update:sortBy', 'update:sortOrder', 'reset']);

const localKeyword = ref(props.keyword);
const localCategory = ref(props.category);
const localLocation = ref(props.location);
const localSortBy = ref(props.sortBy);
const localSortOrder = ref(props.sortOrder);

// Watch for prop changes (e.g., from route query)
watch(() => props.keyword, (newVal) => {
    localKeyword.value = newVal;
});

watch(() => props.category, (newVal) => {
    localCategory.value = newVal;
});

watch(() => props.location, (newVal) => {
    localLocation.value = newVal;
});

watch(() => props.sortBy, (newVal) => {
    localSortBy.value = newVal;
});

watch(() => props.sortOrder, (newVal) => {
    localSortOrder.value = newVal;
});

const handleKeywordChange = () => {
    emit('update:keyword', localKeyword.value);
};

const handleCategoryChange = () => {
    emit('update:category', localCategory.value);
};

const handleLocationChange = () => {
    emit('update:location', localLocation.value);
};

const handleSortByChange = () => {
    emit('update:sortBy', localSortBy.value);
};

const handleSortOrderChange = () => {
    emit('update:sortOrder', localSortOrder.value);
};

const handleReset = () => {
    localKeyword.value = '';
    localCategory.value = '';
    localLocation.value = '';
    localSortBy.value = 'createdAt';
    localSortOrder.value = 'desc';
    emit('reset');
};
</script>

<style scoped>
.search-box {
    position: sticky;
    top: 20px;
    height: fit-content;
}

.form-label {
    font-weight: 600;
    margin-bottom: 0.5rem;
}
</style>

