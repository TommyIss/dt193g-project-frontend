<template>
    <article class="productArticle">
        
        <img :src="imageUrl" :alt="description">
        
        <h3>{{ productName }}</h3>
        <p>
            Kategori: {{ categoryName }}
        </p>
        <RouterLink :to="`/product/${id}`">Visa produktdetaljer</RouterLink>
    </article>
</template>

<script setup>

    let props = defineProps({
        id: Number,
        productName: String,
        description: String,
        categoryName: String,
        imageUrl: String
    })

</script>

<style scoped>
    .productArticle {
        box-shadow: 0px 0px 5px turquoise;
        padding: 0.5em 1.5em;
        margin-bottom: 2em;
        width: 300px;

    }

    .productArticle img {
        width: 100%;
    }

    h3 {
        margin-bottom: 0em;
    }
</style>