<template>
    <nav aria-label="Page navigation" v-if="totalPages > 1">
        <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button 
                    class="page-link" 
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage === 1"
                    aria-label="Previous"
                >
                    <span aria-hidden="true">&laquo;</span>
                    <span class="visually-hidden">Previous</span>
                </button>
            </li>
            
            <li 
                v-for="page in visiblePages" 
                :key="page" 
                class="page-item" 
                :class="{ active: page === currentPage }"
            >
                <button 
                    class="page-link" 
                    @click="goToPage(page)"
                    :disabled="page === currentPage"
                >
                    {{ page }}
                </button>
            </li>
            
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button 
                    class="page-link" 
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    aria-label="Next"
                >
                    <span aria-hidden="true">&raquo;</span>
                    <span class="visually-hidden">Next</span>
                </button>
            </li>
        </ul>
    </nav>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    currentPage: {
        type: Number,
        required: true,
        default: 1
    },
    totalPages: {
        type: Number,
        required: true,
        default: 1
    }
});

const emit = defineEmits(['page-change']);

const visiblePages = computed(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(props.totalPages, start + maxVisible - 1);
    
    // Adjust start if we're near the end
    if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    
    return pages;
});

const goToPage = (page) => {
    if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
        emit('page-change', page);
    }
};
</script>

<style scoped>
.pagination {
    margin-top: 2rem;
}

.page-link {
    cursor: pointer;
}

.page-item.disabled .page-link {
    cursor: not-allowed;
    opacity: 0.6;
}
</style>