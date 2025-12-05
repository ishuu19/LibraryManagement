<template>
    <div class="borrow-history-container">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="mb-0">Borrow History</h5>
            <div class="text-muted small">
                {{ totalItems }} records
            </div>
        </div>

        <div class="mb-2">
            <input
                v-model="searchQuery"
                type="text"
                class="form-control form-control-sm"
                placeholder="Search by book title..."
                @input="handleSearch"
                style="max-width: 300px;"
            />
        </div>

        <div v-if="loading" class="text-center py-3">
            <div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <div v-else-if="error" class="alert alert-danger py-2" role="alert">
            {{ error }}
        </div>

        <div v-else>
            <div class="table-responsive">
                <table class="table table-sm table-hover mb-0">
                    <thead>
                        <tr>
                            <th scope="col" class="sortable-header" @click="sortBy('bookTitle')">
                                Book Title
                                <span v-if="sortField === 'bookTitle'" class="sort-icon">
                                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                                </span>
                            </th>
                            <th scope="col" class="sortable-header" @click="sortBy('borrowDate')">
                                Borrow Date
                                <span v-if="sortField === 'borrowDate'" class="sort-icon">
                                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                                </span>
                            </th>
                            <th scope="col" class="sortable-header" @click="sortBy('returnDate')">
                                Return Date
                                <span v-if="sortField === 'returnDate'" class="sort-icon">
                                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="borrow in sortedBorrows" :key="borrow._id">
                            <td>{{ borrow.book?.title || 'N/A' }}</td>
                            <td>{{ formatDate(borrow.borrowDate) }}</td>
                            <td>{{ borrow.returnDate ? formatDate(borrow.returnDate) : '-' }}</td>
                        </tr>
                        <tr v-if="sortedBorrows.length === 0">
                            <td colspan="3" class="text-center py-2 text-muted">
                                No borrow history found.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div
                v-if="totalItems > 0"
                class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top"
            >
                <div class="text-muted small">
                    Page {{ currentPage }} of {{ totalPages }}
                </div>
                <nav>
                    <ul class="pagination pagination-sm mb-0">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <a
                                class="page-link"
                                href="#"
                                @click.prevent="handlePageChange(currentPage - 1)"
                            >
                                ‹
                            </a>
                        </li>
                        <li
                            v-for="page in visiblePages"
                            :key="page"
                            class="page-item"
                            :class="{ active: page === currentPage, disabled: page === '...' }"
                        >
                            <a
                                v-if="page !== '...'"
                                class="page-link"
                                href="#"
                                @click.prevent="handlePageChange(page)"
                            >
                                {{ page }}
                            </a>
                            <span v-else class="page-link">{{ page }}</span>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage >= totalPages }">
                            <a
                                class="page-link"
                                href="#"
                                @click.prevent="handlePageChange(currentPage + 1)"
                            >
                                ›
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
    userId: {
        type: String,
        required: true
    }
});

const borrows = ref([]);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(10);
const totalItems = ref(0);
const sortField = ref(null);
const sortOrder = ref('asc');

// This expects a backend endpoint that returns the same shape as getBorrowHistory,
// but filtered by user instead of book.
const API_BASE = 'http://localhost:3000/api/users';

const getAuthToken = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }
    return localStorage.getItem('token');
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const fetchBorrowHistory = async () => {
    if (!props.userId) return;

    loading.value = true;
    error.value = null;

    try {
        const token = getAuthToken();
        const response = await fetch(
            `${API_BASE}/${props.userId}/borrow-history?page=${currentPage.value}&limit=${perPage.value}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            if (response.status === 403) {
                error.value = 'Access denied. Admin privileges required.';
                return;
            }
            throw new Error('Failed to fetch borrow history');
        }

        const data = await response.json();

        if (data.success) {
            borrows.value = data.data.items || [];
            totalItems.value = data.data.pagination?.total || 0;
        } else {
            throw new Error(data.message || 'Failed to fetch borrow history');
        }
    } catch (err) {
        error.value = err.message || 'An error occurred while fetching borrow history';
        borrows.value = [];
    } finally {
        loading.value = false;
    }
};

const filteredBorrows = computed(() => {
    if (!searchQuery.value.trim()) {
        return borrows.value;
    }

    const query = searchQuery.value.toLowerCase().trim();
    return borrows.value.filter(borrow => {
        const title = borrow.book?.title?.toLowerCase() || '';
        return title.includes(query);
    });
});

const sortedBorrows = computed(() => {
    const filtered = [...filteredBorrows.value];

    if (!sortField.value) return filtered;

    return filtered.sort((a, b) => {
        let aVal;
        let bVal;

        switch (sortField.value) {
            case 'bookTitle':
                aVal = a.book?.title || '';
                bVal = b.book?.title || '';
                break;
            case 'borrowDate':
                aVal = new Date(a.borrowDate);
                bVal = new Date(b.borrowDate);
                break;
            case 'returnDate':
                aVal = a.returnDate ? new Date(a.returnDate) : new Date(0);
                bVal = b.returnDate ? new Date(b.returnDate) : new Date(0);
                break;
            default:
                return 0;
        }

        if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1;
        return 0;
    });
});

const totalPages = computed(() => {
    return Math.ceil(totalItems.value / perPage.value);
});

const visiblePages = computed(() => {
    const pages = [];
    const total = totalPages.value;
    const current = currentPage.value;

    if (total <= 7) {
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        if (current <= 3) {
            for (let i = 1; i <= 5; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(total);
        } else if (current >= total - 2) {
            pages.push(1);
            pages.push('...');
            for (let i = total - 4; i <= total; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            pages.push('...');
            for (let i = current - 1; i <= current + 1; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(total);
        }
    }

    return pages;
});

const sortBy = (field) => {
    if (sortField.value === field) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortField.value = field;
        sortOrder.value = 'asc';
    }
};

const handleSearch = () => {
    currentPage.value = 1;
};

const handlePageChange = (page) => {
    if (page < 1 || page > totalPages.value || page === currentPage.value) return;
    currentPage.value = page;
    fetchBorrowHistory();
};

watch(
    () => props.userId,
    () => {
        currentPage.value = 1;
        searchQuery.value = '';
        sortField.value = null;
        sortOrder.value = 'asc';
        fetchBorrowHistory();
    }
);

onMounted(() => {
    fetchBorrowHistory();
});
</script>

<style scoped>
.borrow-history-container {
    background-color: white;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 12px;
    height: 100%;
}

.borrow-history-container h5 {
    color: #212529;
    font-weight: 600;
    font-size: 1.1rem;
}

.table {
    font-size: 0.875rem;
}

.table thead th {
    background-color: #f8f9fa;
    color: #495057;
    font-weight: 600;
    padding: 8px 12px;
    border-bottom: 1px solid #dee2e6;
    white-space: nowrap;
}

.sortable-header {
    cursor: pointer;
    user-select: none;
}

.sortable-header:hover {
    background-color: #e9ecef;
}

.sort-icon {
    margin-left: 4px;
    font-size: 0.75rem;
}

.table tbody td {
    padding: 8px 12px;
    border-bottom: 1px solid #dee2e6;
    white-space: nowrap;
}

.table tbody tr:hover {
    background-color: #f8f9fa;
}

.pagination {
    gap: 0;
}

.page-link {
    color: #495057;
    border: 1px solid #dee2e6;
    padding: 0.375rem 0.5rem;
    min-width: 32px;
    text-align: center;
    font-size: 0.875rem;
}

.page-link:hover {
    background-color: #e9ecef;
    border-color: #adb5bd;
    color: #212529;
}

.page-item.active .page-link {
    background-color: #212529;
    border-color: #212529;
    color: white;
}

.page-item.disabled .page-link {
    color: #6c757d;
    pointer-events: none;
    background-color: #fff;
    border-color: #dee2e6;
    opacity: 0.6;
}

@media (max-width: 768px) {
    .borrow-history-container {
        padding: 12px;
    }
}
</style>


