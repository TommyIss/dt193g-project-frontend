<template>

    <div v-if="showAddProduct === false && role === 'admin'">
        <button @click="showAddProduct = true">Lägg till ny produkt <em class="fa-solid fa-circle-plus"></em></button>
    </div>

    <div v-if="showCategoryManger === false && role === 'admin'">
        <button @click="showCategoryManger = true">Hantera kategorier <em class="fa-solid fa-circle-plus"></em></button>
    </div>

    <ProductForm 
        v-if="showAddProduct === true && role === 'admin'"
        :token="token"
        :url="url"
        @close="showAddProduct = false"
        @save="addProduct"
    />

    <CategoryManger
        v-if="showCategoryManger === true && role === 'admin'"
        :token="token"
        :url="url"
        :error="error"
        :getCategories="getCategories"
        @closeManger="showCategoryManger = false"
    />

    <div v-if="loading" class="alert alert-info">
        Hämtar produkter...
    </div>

    <div v-if="error" class="alert alert-danger">
        {{ error }}
    </div>

    <div  class="my-3">
        <label class="form-label">Sök efter produktnamn:</label>
        <input 
            type="text" 
            class="form-control" 
            v-model="searchWord"
            placeholder="Skriv för att söka..."
        >
    </div>

    <div class="mb-3">
      <label class="form-label">Kategori:</label>
      <select 
        class="form-control" 
        v-model="categoryId"
      >
        <option :value="null">Alla kategorier</option>

        <option  
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id">
            {{ cat.name }}
        </option>
      </select>
    </div>
    
    <p class="text-muted">
        Visar {{ filteredProducts.length }} produkter
    </p>
    <div class="stock">
        <StockArticle v-for="article in filteredProducts"
        :id="article.id"
        :productName="article.name"
        :key="article.id"
        :description="article.description"
        :categoryName="article.category.name"
        :imageUrl="article.image_url"
        />
    </div>
    
</template>

<script setup>
    import CategoryManger from '@/components/CategoryManger.vue';
    import ProductForm from '@/components/ProductForm.vue';
    import StockArticle from '@/components/StockArticle.vue';
    import {onMounted, ref, computed } from 'vue';

    let stockArticles = ref([]);

    let showAddProduct = ref(false);
    let showCategoryManger = ref(false);
    const error = ref('');
    const loading = ref(true);

    const role = JSON.parse(localStorage.getItem('user'))?.role;

    const url = 'https://tois-dt193g-project-webservice.onrender.com/';
    const token = localStorage.getItem('token');
    
    const searchWord = ref('');
    const categories = ref([]);
    const categoryId = ref(null);
    onMounted(() => {
        getCategories();
        getStock();
    })

    let getStock = async () => {
        loading.value = true;
        error.value = '';
        try {

            const productResponse = await fetch(url + 'products', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if(!productResponse.ok) {
                throw new Error('Kunde inte uppdatera lagersaldo');
            }
            const productData = await productResponse.json();
            stockArticles.value = productData;
        } catch (err) {
            error.value = err.message || 'Ett fel uppstod vid uppdatering av lagersaldo';
        } finally {
            loading.value = false;
        }
    }

    let addProduct = async (product) => {
        try {
            let response = await fetch(url + 'products', {
                method: 'POST',
                headers: {
                    'authorization': `Bearer ${token}`
                },
                body: product
            });

            if(!response.ok) {
                throw new Error('Kunde inte lägga till produkten!');
            }

            getStock();
        } catch (err) {
            console.error(err);
            error.value = err.message || 'Ett fel uppstod vid tillägg av produkten';
        }
    }

    const getCategories = async() => {
        try {
            let response = await fetch(url + 'categories', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if(!response.ok) {
                throw new Error('Kunde inte hämta kategorier!');
            }

            categories.value = await response.json();
        } catch (err) {
            console.error(err);
            error.value = err.message || 'Ett fel uppstod vid hämtning av kategorier';
        }
    }

    const filteredProducts = computed(() => {
    return stockArticles.value
        .filter(p => {
            // Sökning
            if (searchWord.value.trim() !== '') {
                return p.name.toLowerCase().includes(searchWord.value.toLowerCase());
            }
            return true;
        })
        .filter(p => {
            // Kategori-filter
            if (categoryId.value) {
                return p.categoryId === categoryId.value;
            }
            return true;
        });
    })
</script>

<style scoped>

.stock {
    margin: 2% 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}
</style>