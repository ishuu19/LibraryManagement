<template>
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div style="font-family: 'Courier New', monospace; font-size: 14px; color: #333;">
                <div>Admin/</div>
                <div style="margin-left: 20px;">└── User Management</div>
            </div>
            <button 
                class="btn btn-dark"
                @click="goToCreateUser"
            >
                Add User
            </button>
        </div>

        <div class="user-management-card mx-auto">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">Users</h4>
                <input
                    v-model="searchQuery"
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Search by email, first or last name..."
                    @input="handleSearch"
                    style="max-width: 280px;"
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
                <section>
                    <o-table
                        :data="users"
                        :striped="false"
                        :hoverable="true"
                        :bordered="true"
                        :narrowed="true"
                    >
                        <o-table-column
                            field="email"
                            label="Email"
                            sortable
                            :width="40"
                        />
                        <o-table-column
                            field="firstName"
                            label="First Name"
                        />
                        <o-table-column
                            field="lastName"
                            label="Last Name"
                        />
                        <o-table-column
                            field="role"
                            label="Role"
                            sortable
                            position="centered"
                        />
                        <o-table-column
                            field="actions"
                            label="Action"
                            position="centered"
                            width="100"
                        >
                            <template #default="{ row }">
                                <button
                                    class="btn btn-outline-dark btn-sm"
                                    @click="goToEditUser(row._id)"
                                >
                                    Edit
                                </button>
                            </template>
                        </o-table-column>
                    </o-table>
                </section>

                <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                    <div class="text-muted small">
                        Page {{ currentPage }} of {{ totalPages }} · {{ totalItems }} users
                    </div>
                    <Pagination
                        :currentPage="currentPage"
                        :totalPages="totalPages"
                        @page-change="handlePageChange"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Pagination from '@/components/Pagination.vue';

const router = useRouter();

const users = ref([]);
const loading = ref(false);
const error = ref(null);

const searchQuery = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const perPage = 10;

const API_BASE = 'http://localhost:3000/api/users';

const getAuthToken = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }
    return localStorage.getItem('token');
};

const fetchUsers = async () => {
    loading.value = true;
    error.value = null;

    try {
        const token = getAuthToken();
        if (!token) {
            error.value = 'Authentication required.';
            users.value = [];
            loading.value = false;
            return;
        }

        const params = new URLSearchParams();
        params.append('page', String(currentPage.value));
        params.append('limit', String(perPage));

        if (searchQuery.value.trim()) {
            params.append('keyword', searchQuery.value.trim());
        }

        const response = await fetch(`${API_BASE}?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                error.value = 'Access denied. Admin privileges required.';
            } else {
                error.value = 'Failed to fetch users.';
            }
            users.value = [];
            return;
        }

        const data = await response.json();

        if (data.success && data.data) {
            users.value = data.data.items || [];
            totalItems.value = data.data.pagination?.total || 0;
            totalPages.value = data.data.pagination?.totalPages || 1;
            currentPage.value = data.data.pagination?.currentPage || 1;
        } else {
            error.value = data.message || 'Failed to fetch users.';
            users.value = [];
        }
    } catch (err) {
        error.value = err.message || 'An error occurred while fetching users.';
        users.value = [];
    } finally {
        loading.value = false;
    }
};

const handlePageChange = (page) => {
    if (page === currentPage.value) return;
    currentPage.value = page;
    fetchUsers();
};

const handleSearch = () => {
    currentPage.value = 1;
    fetchUsers();
};

const goToCreateUser = () => {
    router.push('/admin/users/create');
};

const goToEditUser = (id) => {
    if (!id) return;
    router.push(`/admin/users/edit/${id}`);
};

onMounted(() => {
    fetchUsers();
});
</script>

<style scoped>
.user-management-card {
    background-color: #ffffff;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 16px;
    max-width: 70%;
}

@media (max-width: 992px) {
    .user-management-card {
        max-width: 100%;
    }
}

:deep(.o-table) {
    width: 100%;
    background-color: #ffffff;
    color: #212529;
}

:deep(.o-table table) {
    border-collapse: collapse;
}

:deep(.o-table thead th) {
    background-color: #f8f9fa;
    color: #212529;
    font-weight: 600;
    border-bottom: 1px solid #dee2e6;
}

:deep(.o-table tbody td) {
    border-top: 1px solid #dee2e6;
}
</style>

