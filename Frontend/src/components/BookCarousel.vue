<template>
    <div id="carouselExampleIndicators" class="carousel slide mt-4" data-bs-ride="carousel" style="height: 60vh;">
        <div class="carousel-inner">
            <div 
                v-for="(book, index) in highlightedBooks" 
                :key="book._id"
                class="carousel-item"
                :class="{ active: index === 0 }"
            >
                <router-link :to="`/book/detail/${book._id}`" class="text-decoration-none">
                    <img 
                        class="d-block w-100" 
                        :src="book.coverImage || 'https://shorturl.at/y1vem'"
                        :alt="book.title" 
                        style="height: 60vh; object-fit: cover;"
                    >
                </router-link>
                <div class="carousel-caption d-none d-md-block" style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(0,0,0,0.7));
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                    padding: 2rem;
                    margin: 0;
                    width: 100%;
                ">
                    <h2 style="color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); margin-bottom: 0.5rem;">
                        {{ book.title }}
                    </h2>
                    <p style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); margin: 0;">{{ book.author }}</p>
                </div>
            </div>
            
            <div v-if="highlightedBooks.length === 0" class="carousel-item active">
                <img 
                    class="d-block w-100" 
                    src="https://shorturl.at/y1vem" 
                    alt="Welcome"
                    style="height: 60vh; object-fit: cover;"
                >
                <div class="carousel-caption d-none d-md-block" style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(0,0,0,0.7));
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    padding: 2rem;
                    margin: 0;
                    width: 100%;
                ">
                    <h2 style="color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); margin: 0;">Stay Tuned for New Books!</h2>
                </div>
            </div>
        </div>

        <button 
            v-if="highlightedBooks.length > 1"
            class="carousel-control-prev" 
            type="button" 
            data-bs-target="#carouselExampleIndicators" 
            data-bs-slide="prev"
        >
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
        </button>
        <button 
            v-if="highlightedBooks.length > 1"
            class="carousel-control-next" 
            type="button" 
            data-bs-target="#carouselExampleIndicators" 
            data-bs-slide="next"
        >
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
        </button>
    </div>
</template>

<script setup>
defineProps({
    highlightedBooks: {
        type: Array,
        default: () => []
    }
});
</script>

<style scoped>

</style>