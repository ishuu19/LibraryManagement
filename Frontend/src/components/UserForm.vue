<template>
    <div class="user-form-card">
        <h4 class="mb-3">
            {{ isEditMode ? 'Edit User' : 'Create New User' }}
        </h4>

        <div v-if="successMessage" class="alert alert-success py-2" role="alert">
            {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="alert alert-danger py-2" role="alert">
            {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSubmit" novalidate>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input
                        id="email"
                        v-model.trim="form.email"
                        type="email"
                        class="form-control"
                        :class="{ 'is-invalid': errors.email }"
                        placeholder="user@example.com"
                        required
                    />
                    <div v-if="errors.email" class="invalid-feedback">
                        {{ errors.email }}
                    </div>
                </div>

                <div class="col-md-6 mb-3">
                    <label for="role" class="form-label">Role</label>
                    <select
                        id="role"
                        v-model="form.role"
                        class="form-select"
                        :class="{ 'is-invalid': errors.role }"
                        required
                    >
                        <option value="">Select role</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                    <div v-if="errors.role" class="invalid-feedback">
                        {{ errors.role }}
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="firstName" class="form-label">First Name</label>
                    <input
                        id="firstName"
                        v-model.trim="form.firstName"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errors.firstName }"
                        placeholder="First name"
                        required
                    />
                    <div v-if="errors.firstName" class="invalid-feedback">
                        {{ errors.firstName }}
                    </div>
                </div>

                <div class="col-md-6 mb-3">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input
                        id="lastName"
                        v-model.trim="form.lastName"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errors.lastName }"
                        placeholder="Last name"
                        required
                    />
                    <div v-if="errors.lastName" class="invalid-feedback">
                        {{ errors.lastName }}
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="password" class="form-label">
                        Password
                        <span v-if="isEditMode" class="text-muted small">(optional)</span>
                    </label>
                    <input
                        id="password"
                        v-model="form.password"
                        type="password"
                        class="form-control"
                        :class="{ 'is-invalid': errors.password }"
                        autocomplete="new-password"
                        :required="!isEditMode"
                    />
                    <div v-if="errors.password" class="invalid-feedback">
                        {{ errors.password }}
                    </div>
                    <div v-else class="form-text password-strength-text">
                        Strength:
                        <span :class="passwordStrengthClass">{{ passwordStrengthLabel }}</span>
                    </div>
                    <div class="password-strength-bar mt-1">
                        <div
                            class="password-strength-fill"
                            :style="{ width: passwordStrengthWidth }"
                        ></div>
                    </div>
                </div>

                <div class="col-md-6 mb-3">
                    <label for="confirmPassword" class="form-label">
                        Confirm Password
                        <span v-if="isEditMode" class="text-muted small">(optional)</span>
                    </label>
                    <input
                        id="confirmPassword"
                        v-model="form.confirmPassword"
                        type="password"
                        class="form-control"
                        :class="{ 'is-invalid': errors.confirmPassword }"
                        autocomplete="new-password"
                        :required="!isEditMode"
                    />
                    <div v-if="errors.confirmPassword" class="invalid-feedback">
                        {{ errors.confirmPassword }}
                    </div>
                </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-3">
                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="goBack"
                    :disabled="submitting"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    class="btn btn-dark"
                    :disabled="submitting"
                >
                    <span
                        v-if="submitting"
                        class="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                    ></span>
                    <span>{{ isEditMode ? (submitting ? 'Updating...' : 'Update User') : (submitting ? 'Creating...' : 'Create User') }}</span>
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    mode: {
        type: String,
        default: 'create'
    },
    userId: {
        type: String,
        default: null
    }
});

const router = useRouter();

const isEditMode = computed(() => props.mode === 'edit');

const API_BASE = 'http://localhost:3000/api/users';

const form = reactive({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    role: ''
});

const errors = reactive({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    role: ''
});

const submitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const getAuthToken = () => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }
    return localStorage.getItem('token');
};

const resetErrors = () => {
    errors.email = '';
    errors.firstName = '';
    errors.lastName = '';
    errors.password = '';
    errors.confirmPassword = '';
    errors.role = '';
};

const validateEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const evaluatePasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
};

const passwordStrengthScore = computed(() => evaluatePasswordStrength(form.password));

const passwordStrengthLabel = computed(() => {
    const score = passwordStrengthScore.value;
    if (!form.password) return 'None';
    if (score <= 2) return 'Weak';
    if (score === 3 || score === 4) return 'Medium';
    return 'Strong';
});

const passwordStrengthClass = computed(() => {
    const score = passwordStrengthScore.value;
    if (!form.password) return 'strength-none';
    if (score <= 2) return 'strength-weak';
    if (score === 3 || score === 4) return 'strength-medium';
    return 'strength-strong';
});

const passwordStrengthWidth = computed(() => {
    const score = passwordStrengthScore.value;
    if (!form.password) return '0%';
    if (score <= 2) return '33%';
    if (score === 3 || score === 4) return '66%';
    return '100%';
});

const validateForm = () => {
    resetErrors();
    let isValid = true;

    if (!form.email) {
        errors.email = 'Email is required.';
        isValid = false;
    } else if (!validateEmailFormat(form.email)) {
        errors.email = 'Please enter a valid email address.';
        isValid = false;
    }

    if (!form.firstName) {
        errors.firstName = 'First name is required.';
        isValid = false;
    }

    if (!form.lastName) {
        errors.lastName = 'Last name is required.';
        isValid = false;
    }

    if (!form.role) {
        errors.role = 'Role is required.';
        isValid = false;
    }

    // Password required only in create mode.
    if (!isEditMode.value || form.password) {
        if (!form.password) {
            errors.password = 'Password is required.';
            isValid = false;
        } else if (form.password.length < 8) {
            errors.password = 'Password must be at least 8 characters long.';
            isValid = false;
        }
    }

    // Confirm password required in create, or when either password/confirm is provided in edit.
    if (
        !isEditMode.value ||
        form.password ||
        form.confirmPassword
    ) {
        if (!form.confirmPassword) {
            errors.confirmPassword = 'Please confirm the password.';
            isValid = false;
        } else if (form.password !== form.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match.';
            isValid = false;
        }
    }

    return isValid;
};

const loadUserForEdit = async () => {
    if (!isEditMode.value || !props.userId) {
        return;
    }

    const token = getAuthToken();
    if (!token) {
        errorMessage.value = 'Authentication required.';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/${props.userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
            errorMessage.value = data.message || 'Failed to load user details.';
            return;
        }

        const user = data.data;
        form.email = user.email || '';
        form.firstName = user.firstName || '';
        form.lastName = user.lastName || '';
        form.role = user.role || 'user';
        form.password = '';
        form.confirmPassword = '';
    } catch (err) {
        errorMessage.value = err.message || 'An error occurred while loading user details.';
    }
};

const handleSubmit = async () => {
    successMessage.value = '';
    errorMessage.value = '';

    if (!validateForm()) {
        return;
    }

    const token = getAuthToken();
    if (!token) {
        errorMessage.value = 'Authentication required.';
        return;
    }

    submitting.value = true;

    try {
        let url = API_BASE;
        let method = 'POST';
        let successText = 'User created successfully.';

        if (isEditMode.value && props.userId) {
            url = `${API_BASE}/${props.userId}`;
            method = 'PUT';
            successText = 'User updated successfully.';
        }

        const body = {
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
            role: form.role
        };

        // Only send password when provided (create always has it; edit only if resetting).
        if (form.password) {
            body.password = form.password;
        }

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
            errorMessage.value = data.message || 'Failed to save user.';
            return;
        }

        successMessage.value = successText;

        // After success, redirect back to User Management.
        setTimeout(() => {
            router.push('/admin/users');
        }, 1000);
    } catch (err) {
        errorMessage.value = err.message || 'An error occurred while saving the user.';
    } finally {
        submitting.value = false;
    }
};

const goBack = () => {
    router.push('/admin/users');
};

onMounted(() => {
    loadUserForEdit();
});
</script>

<style scoped>
.user-form-card {
    background-color: #ffffff;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 16px;
}

@media (max-width: 992px) {
    .user-form-card {
        max-width: 100%;
    }
}

.password-strength-bar {
    height: 4px;
    background-color: #e9ecef;
    border-radius: 2px;
    overflow: hidden;
}

.password-strength-fill {
    height: 100%;
    width: 0;
    background-color: #6c757d;
    transition: width 0.3s ease;
}

.password-strength-text .strength-none {
    color: #6c757d;
}

.password-strength-text .strength-weak {
    color: #b02a37;
}

.password-strength-text .strength-medium {
    color: #6c757d;
}

.password-strength-text .strength-strong {
    color: #146c43;
}
</style>


