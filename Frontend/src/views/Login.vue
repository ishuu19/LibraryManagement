<template>
    <div class="login-container">
        <div class="container">
            <div class="row mt-4">
                <div class="col-12">
                    <div style="font-family: 'Courier New', monospace; font-size: 14px; color: #333;" class="mb-3">
                        <div>Library/</div>
                        <div style="margin-left: 20px;">└── Login</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container d-flex justify-content-center align-items-center login-wrapper">
            <div class="login-box">
                <h2 class="login-title">Login</h2>
                <LoginForm />
            </div>
        </div>
    </div>
</template>

<script setup>
import LoginForm from '@/components/LoginForm.vue';
</script>

<style scoped>
.login-container {
    min-height: calc(100vh - 200px);
    background-color: white;
}

.login-wrapper {
    min-height: 60vh;
}

.login-box {
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 40px;
    width: 100%;
    max-width: 450px;
    min-height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.login-title {
    color: black;
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 30px;
    text-align: center;
}
</style>
