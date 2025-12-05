<template>
    <div class="container mt-4">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header" :class="isEditMode ? 'bg-warning text-dark' : 'bg-primary text-white'">
                        <h3 class="card-title mb-0 text-center">
                            {{ isEditMode ? 'Edit Book' : 'Add a New Book' }}
                        </h3>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="handleSubmit">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="title">Title *</label>
                                        <input 
                                            type="text" 
                                            class="form-control" 
                                            :class="{ 'is-invalid': errors.title }"
                                            id="title" 
                                            v-model="formData.title" 
                                            required
                                        >
                                        <div v-if="errors.title" class="invalid-feedback">{{ errors.title }}</div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="author">Author Name *</label>
                                        <input 
                                            type="text" 
                                            class="form-control" 
                                            :class="{ 'is-invalid': errors.author }"
                                            id="author" 
                                            v-model="formData.author" 
                                            required
                                        >
                                        <div v-if="errors.author" class="invalid-feedback">{{ errors.author }}</div>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="isbn">ISBN Number *</label>
                                        <input 
                                            type="text" 
                                            class="form-control" 
                                            :class="{ 'is-invalid': errors.isbn }"
                                            id="isbn" 
                                            v-model="formData.isbn" 
                                            required
                                        >
                                        <div v-if="errors.isbn" class="invalid-feedback">{{ errors.isbn }}</div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="year">Published Year</label>
                                        <input 
                                            type="number" 
                                            class="form-control" 
                                            id="year" 
                                            v-model.number="formData.year" 
                                            :min="1000" 
                                            :max="new Date().getFullYear()"
                                        >
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="publisher">Publisher Name</label>
                                        <input 
                                            type="text" 
                                            class="form-control" 
                                            id="publisher" 
                                            v-model="formData.publisher"
                                        >
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="category">Book Category</label>
                                        <select class="form-select" id="category" v-model="formData.category">
                                            <option value="">Select Category</option>
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
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="description">Description</label>
                                <textarea 
                                    class="form-control" 
                                    id="description" 
                                    v-model="formData.description" 
                                    rows="4" 
                                    placeholder="Enter book description..."
                                ></textarea>
                            </div>

                            <div class="form-group">
                                <label for="coverImage">Cover Image URL</label>
                                <input 
                                    type="url" 
                                    class="form-control" 
                                    :class="{ 'is-invalid': errors.coverImage }"
                                    id="coverImage" 
                                    v-model="formData.coverImage" 
                                    placeholder="https://example.com/image.jpg"
                                >
                                <div v-if="errors.coverImage" class="invalid-feedback">{{ errors.coverImage }}</div>
                            </div>

                            <div class="form-group">
                                <label for="location">Location</label>
                                <select class="form-select" id="location" v-model="formData.location">
                                    <option value="">Select Shelf Location</option>
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

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input 
                                            type="checkbox" 
                                            class="form-check-input" 
                                            id="isHighlighted" 
                                            v-model="formData.isHighlighted"
                                        >
                                        <label class="form-check-label" for="isHighlighted">
                                            Highlight this book
                                        </label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input 
                                            type="checkbox" 
                                            class="form-check-input" 
                                            id="isBorrowed" 
                                            v-model="formData.isBorrowed"
                                        >
                                        <label class="form-check-label" for="isBorrowed">
                                            Currently Borrowed
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group mt-4 d-flex justify-content-center gap-2">
                                <button type="submit" class="btn btn-lg" :class="isEditMode ? 'btn-warning' : 'btn-primary'" :disabled="submitting">
                                    {{ submitting ? 'Saving...' : (isEditMode ? 'Update Book' : 'Add Book') }}
                                </button>
                                <button 
                                    type="button" 
                                    class="btn btn-secondary btn-lg" 
                                    @click="handleCancel"
                                    :disabled="submitting"
                                >
                                    Cancel
                                </button>
                                <button 
                                    v-if="isEditMode" 
                                    type="button" 
                                    class="btn btn-danger btn-lg" 
                                    @click="showDeleteModal = true"
                                    :disabled="submitting"
                                >
                                    Delete Book
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <Modal
            :show="showSuccessModal"
            title="Success"
            :message="`${successMessage} Redirecting in ${countdown} second${countdown !== 1 ? 's' : ''}...`"
            closeButtonText="OK"
            @close="handleSuccessClose"
        />

        <Modal
            :show="showDeleteModal"
            title="Confirm Delete"
            message="Are you sure you want to delete this book? This action cannot be undone."
            closeButtonText="Cancel"
            :confirmButtonText="deleting ? 'Deleting...' : 'Delete'"
            :showConfirmButton="true"
            :confirmDisabled="deleting"
            :confirmLoading="deleting"
            @close="showDeleteModal = false"
            @confirm="handleDelete"
            :closeOnBackdrop="!deleting"
        />
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Modal from '@/components/Modal.vue';

const props = defineProps({
    book: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['success', 'cancel']);

const router = useRouter();
const isEditMode = computed(() => !!props.book);
const submitting = ref(false);
const deleting = ref(false);
const showSuccessModal = ref(false);
const showDeleteModal = ref(false);
const successMessage = ref('');
const redirectTimer = ref(null);
const countdown = ref(5);

const formData = reactive({
    title: '',
    author: '',
    isbn: '',
    year: null,
    publisher: '',
    category: '',
    description: '',
    coverImage: '',
    location: '',
    isHighlighted: false,
    isBorrowed: false
});

const errors = reactive({
    title: '',
    author: '',
    isbn: '',
    coverImage: ''
});

const API_BASE = 'http://localhost:3000/api/books';

watch(() => props.book, (newBook, oldBook) => {
    if (newBook === oldBook) return;
    
    if (newBook) {
        Object.assign(formData, {
            title: newBook.title || '',
            author: newBook.author || '',
            isbn: newBook.isbn || '',
            year: newBook.year || null,
            publisher: newBook.publisher || '',
            category: newBook.category || '',
            description: newBook.description || '',
            coverImage: newBook.coverImage || '',
            location: newBook.location || '',
            isHighlighted: newBook.isHighlighted || false,
            isBorrowed: newBook.isBorrowed || false
        });
    } else {
        Object.assign(formData, {
            title: '',
            author: '',
            isbn: '',
            year: null,
            publisher: '',
            category: '',
            description: '',
            coverImage: '',
            location: '',
            isHighlighted: false,
            isBorrowed: false
        });
    }
}, { immediate: true, deep: false });

const validateForm = () => {
    Object.keys(errors).forEach(key => errors[key] = '');

    let isValid = true;

    if (!formData.title.trim()) {
        errors.title = 'Title is required';
        isValid = false;
    }

    if (!formData.author.trim()) {
        errors.author = 'Author is required';
        isValid = false;
    }

    if (!formData.isbn.trim()) {
        errors.isbn = 'ISBN is required';
        isValid = false;
    }

    if (formData.coverImage && !isValidUrl(formData.coverImage)) {
        errors.coverImage = 'Please enter a valid URL';
        isValid = false;
    }

    return isValid;
};

const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

const getAuthToken = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }
    return localStorage.getItem('token');
};

const handleSubmit = async () => {
    if (!validateForm()) {
        return;
    }

    submitting.value = true;

    try {
        const url = isEditMode.value ? `${API_BASE}/${props.book._id}` : API_BASE;
        const method = isEditMode.value ? 'PUT' : 'POST';
        const token = getAuthToken();

        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            successMessage.value = isEditMode.value 
                ? 'Book updated successfully!' 
                : 'Book added successfully!';
            showSuccessModal.value = true;
            startRedirectTimer();
            emit('success', data.data);
        } else {
            throw new Error(data.message || 'Failed to save book');
        }
    } catch (err) {
        alert(err.message || 'An error occurred while saving the book');
    } finally {
        submitting.value = false;
    }
};

const handleDelete = async () => {
    if (deleting.value) return;
    
    deleting.value = true;

    try {
        const token = getAuthToken();
        
        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}/${props.book._id}`, {
            method: 'DELETE',
            headers
        });

        const data = await response.json();

        if (data.success) {
            showDeleteModal.value = false;
            successMessage.value = 'Book deleted successfully!';
            showSuccessModal.value = true;
            startRedirectTimer();
            emit('success', { deleted: true });
        } else {
            throw new Error(data.message || 'Failed to delete book');
        }
    } catch (err) {
        alert(err.message || 'An error occurred while deleting the book');
    } finally {
        deleting.value = false;
    }
};

const handleCancel = () => {
    if (isEditMode.value) {
        router.push(`/book/detail/${props.book._id}`);
    } else {
        router.push('/books');
    }
    emit('cancel');
};

const startRedirectTimer = () => {
    // Clear any existing timer
    if (redirectTimer.value) {
        clearInterval(redirectTimer.value);
    }
    
    countdown.value = 5;
    
    redirectTimer.value = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            clearInterval(redirectTimer.value);
            redirectTimer.value = null;
            performRedirect();
        }
    }, 1000);
};

const performRedirect = () => {
    showSuccessModal.value = false;
    if (isEditMode.value && !successMessage.value.includes('deleted')) {
        router.push(`/book/detail/${props.book._id}`);
    } else {
        router.push('/books');
    }
};

const handleSuccessClose = () => {
    if (redirectTimer.value) {
        clearInterval(redirectTimer.value);
        redirectTimer.value = null;
    }
    performRedirect();
};

onUnmounted(() => {
    if (redirectTimer.value) {
        clearInterval(redirectTimer.value);
        redirectTimer.value = null;
    }
});
</script>

<style scoped>
.modal.show {
    display: block !important;
}

.gap-2 {
    gap: 0.5rem;
}
</style>

