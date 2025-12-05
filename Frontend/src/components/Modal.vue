<template>
    <div 
        v-if="show" 
        class="modal-overlay"
        @click.self="handleBackdropClick"
    >
        <div class="modal-container">
            <div class="modal-content">
                    <h5 class="modal-title">{{ title }}</h5>
                <p class="modal-message">{{ message }}</p>
                <div class="modal-footer">
                    <button 
                        type="button" 
                        class="btn-close-modal"
                        @click="handleClose"
                    >
                        {{ closeButtonText }}
                    </button>
                    <button 
                        v-if="showConfirmButton"
                        type="button" 
                        class="btn-confirm"
                        :disabled="confirmDisabled"
                        @click="handleConfirm"
                    >
                        <span v-if="confirmLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {{ confirmButtonText }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { watch } from 'vue';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: 'Modal Title'
    },
    message: {
        type: String,
        default: ''
    },
    closeButtonText: {
        type: String,
        default: 'Close'
    },
    confirmButtonText: {
        type: String,
        default: 'Confirm'
    },
    showConfirmButton: {
        type: Boolean,
        default: false
    },
    closeOnBackdrop: {
        type: Boolean,
        default: true
    },
    confirmDisabled: {
        type: Boolean,
        default: false
    },
    confirmLoading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close', 'confirm']);

const handleClose = () => {
    emit('close');
};

const handleConfirm = () => {
    emit('confirm');
};

const handleBackdropClick = () => {
    if (props.closeOnBackdrop) {
        handleClose();
    }
};

watch(() => props.show, (newVal) => {
    if (newVal) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
}

.modal-container {
    position: relative;
    width: 90%;
    max-width: 500px;
}

.modal-content {
    background-color: white;
    border: 1px solid black;
    border-radius: 4px;
    padding: 30px;
    text-align: center;
}

.modal-title {
    color: black;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 15px;
}

.modal-message {
    color: black;
    font-size: 16px;
    margin-bottom: 25px;
}

.modal-footer {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.btn-close-modal {
    background-color: white;
    color: black;
    border: 1px solid black;
    padding: 8px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.btn-close-modal:hover {
    background-color: #f5f5f5;
}

.btn-confirm {
    background-color: #0d6efd;
    color: white;
    border: 1px solid #0d6efd;
    padding: 8px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.btn-confirm:hover:not(:disabled) {
    background-color: #0b5ed7;
}

.btn-confirm:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
