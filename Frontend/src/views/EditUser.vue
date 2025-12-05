<template>
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div style="font-family: 'Courier New', monospace; font-size: 14px; color: #333;">
                <div>Admin/</div>
                <div style="margin-left: 20px;">└── Edit User</div>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-7 mb-3">
                <UserForm mode="edit" :user-id="userId" />

                <div class="d-flex justify-content-end mt-3">
                    <button
                        class="btn btn-outline-danger btn-sm"
                        @click="handleDelete"
                        :disabled="deleting"
                    >
                        <span
                            v-if="deleting"
                            class="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                        ></span>
                        <span>{{ deleting ? 'Deleting...' : 'Delete User' }}</span>
                    </button>
                </div>
            </div>
            <div class="col-lg-5 mb-3">
                <UserBorrowHistory :user-id="userId" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UserForm from '@/components/UserForm.vue';
import UserBorrowHistory from '@/components/UserBorrowHistory.vue';

const route = useRoute();
const router = useRouter();

const deleting = ref(false);

const userId = computed(() => route.params.id);

const getAuthToken = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }
    return localStorage.getItem('token');
};

const handleDelete = async () => {
    if (!userId.value) return;

    const confirmed = window.confirm('Are you sure you want to delete this user? This action cannot be undone.');
    if (!confirmed) return;

    const token = getAuthToken();
    if (!token) {
        return;
    }

    deleting.value = true;

    try {
        const response = await fetch(`http://localhost:3000/api/users/${userId.value}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
            alert(data.message || 'Failed to delete user.');
            return;
        }

        router.push('/admin/users');
    } catch (err) {
        alert(err.message || 'An error occurred while deleting the user.');
    } finally {
        deleting.value = false;
    }
};
</script>

<style scoped>
.row {
    gap: 0;
}
</style>