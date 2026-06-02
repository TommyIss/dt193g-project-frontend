<template>
    <article class="productArticle">
        
        <img 
        v-if="imageUrl !== null"
        :src="imageUrl" :alt="description"
        >
        <span 
            v-if="imageUrl === null"
            >
            Ingen bild har laddats upp!
        </span>    

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
        box-shadow: 0px 0px 5px #2FA084;
        padding: 0.5em 1.5em;
        margin-bottom: 2em;
        width: 300px;
        height: fit-content;
        border-radius: 10px;
    }

    .productArticle img {
        width: 100%;
        height: 300px;
    }

   .productArticle h3 {
        margin: 1% 0;
    }

    .productArticle p {
        margin: 2% 0;
        font-size: 1.1em;
        font-weight: 400;
    }

    .productArticle a {
        color: black;
    }

    .productArticle a:hover {
        color: #2FA084;
    }
</style>