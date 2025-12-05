<template>
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div style="font-family: 'Courier New', monospace; font-size: 14px; color: #333;">
                <div>Admin/</div>
                <div style="margin-left: 20px;">└── Create User</div>
            </div>
        </div>

        <div class="create-user-card mx-auto">
            <UserForm mode="create" />
        </div>
    </div>
</template>

<script setup>
import UserForm from '@/components/UserForm.vue';
</script>

<style scoped>
.create-user-card {
    background-color: #ffffff;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 16px;
    max-width: 70%;
}

@media (max-width: 992px) {
    .create-user-card {
        max-width: 100%;
    }
}
</style>

