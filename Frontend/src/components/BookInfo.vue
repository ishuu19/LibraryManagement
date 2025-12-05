<template>
    <div class="book-info">
        <div class="card mb-3">
            <img class="card-img-top" :src="book.coverImage || 'https://shorturl.at/y1vem'" :alt="book.title"
                style="height: 400px; object-fit: cover;">
            <div class="card-body">
                <h2 class="card-title text-center"><strong>{{ book.title }}</strong></h2>
                <p class="card-text">{{ book.description }}</p>

                <div class="d-flex justify-content-center mb-3">
                    <div class="card border-dark" style="width: 100%; max-width: 1100px;">
                        <div class="card-body p-3">
                            <div class="row">
                                <div class="col-md-6 mb-2">
                                    <div class="border border-dark p-2 text-center" style="background-color: #f8f9fa;">
                                        <p class="card-text mb-1"><strong>Author:</strong></p>
                                        <p class="card-text text-dark">{{ book.author }}</p>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-2">
                                    <div class="border border-dark p-2 text-center" style="background-color: #f8f9fa;">
                                        <p class="card-text mb-1"><strong>ISBN:</strong></p>
                                        <p class="card-text text-dark">{{ book.isbn }}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-2">
                                    <div class="border border-dark p-2 text-center" style="background-color: #f8f9fa;">
                                        <p class="card-text mb-1"><strong>Publisher:</strong></p>
                                        <p class="card-text text-dark">{{ book.publisher }}</p>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-2">
                                    <div class="border border-dark p-2 text-center" style="background-color: #f8f9fa;">
                                        <p class="card-text mb-1"><strong>Published Year:</strong></p>
                                        <p class="card-text text-dark">{{ book.year }}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-2">
                                    <div class="border border-dark p-2 text-center" style="background-color: #f8f9fa;">
                                        <p class="card-text mb-1"><strong>Category:</strong></p>
                                        <p class="card-text text-dark">{{ book.category }}</p>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-2">
                                    <div class="border border-dark p-2 text-center" style="background-color: #f8f9fa;">
                                        <p class="card-text mb-1"><strong>Location:</strong></p>
                                        <p class="card-text text-dark">{{ book.location }}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-2">
                                    <div class="border border-dark p-2 text-center" style="background-color: #f8f9fa;">
                                        <p class="card-text mb-1"><strong>View Count:</strong></p>
                                        <p class="card-text text-dark">{{ book.viewCount || 0 }}</p>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-2">
                                    <div class="border border-dark p-2 text-center" style="background-color: #f8f9fa;">
                                        <p class="card-text mb-1"><strong>Borrowing Status:</strong></p>
                                        <p 
                                            class="card-text fw-bold"
                                            :class="actualBorrowStatus ? 'text-danger' : 'text-success'"
                                        >
                                            {{ actualBorrowStatus ? 'Borrowed' : 'Available' }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    book: {
        type: Object,
        required: true
    },
    isBorrowed: {
        type: Boolean,
        default: false
    },
    isBorrowedByUser: {
        type: Boolean,
        default: false
    }
});

const actualBorrowStatus = computed(() => {
    return props.isBorrowed !== undefined ? props.isBorrowed : props.book.isBorrowed;
});
</script>

<style scoped></style>
