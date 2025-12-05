<template>
    <div>
        <div class="container mt-4">
            <div class="row mt-4">
                <div class="col-12">
                    <div style="font-family: 'Courier New', monospace; font-size: 14px; color: #333;" class="mb-3">
                        <div>Book/</div>
                        <div style="margin-left: 20px;">└── Add New Book</div>
                    </div>
                </div>
            </div>
        </div>

        <BookForm @success="handleSuccess" @cancel="handleCancel" />
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import BookForm from '@/components/BookForm.vue';

const router = useRouter();

function handleSuccess(data) {
  router.push('/books');
}

function handleCancel() {
  router.push('/books');
}
</script>

<style scoped>
</style>
