<template>
    <AppDialog ref="dialog" />
    <div class="d-flex flex-wrap justify-content-evenly my-3">
        <div v-if="showAddProduct === false && role === 'admin'" class="my-1">
            <button @click="showAddProduct = true, showCategoryManger = false" class="btn btn-primary">
                Lägg till ny produkt <em class="fa-solid fa-circle-plus"></em>
            </button>
        </div>

        <div v-if="showCategoryManger === false && role === 'admin'" class="my-1">
            <button @click="showCategoryManger = true, showAddProduct = false" class="btn btn-primary">Hantera
                kategorier <em class="fa-solid fa-gears"></em></button>
        </div>
    </div>


    <ProductForm v-if="showAddProduct === true && role === 'admin'" :token="token" :url="url"
        @close="showAddProduct = false" @save="addProduct" />

    <CategoryManger v-if="showCategoryManger === true && role === 'admin'" :token="token" :url="url" :error="error"
        :getCategories="getCategories" @getProducts="getStock" @closeManger="showCategoryManger = false" />

    <div class="my-3">
        <label class="form-label">Sök efter produktnamn:</label>
        <input type="text" class="form-control" v-model="searchWord" placeholder="Skriv för att söka...">
    </div>

    <div class="mb-3">
        <label class="form-label">Fitrera efter kategori:</label>
        <select class="form-control" v-model="categoryId">
            <option :value="null">Alla kategorier</option>

            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
            </option>
        </select>
    </div>

    <p class="text-muted">
        Visar {{ filteredProducts.length }} produkter
    </p>
    <div v-if="loading" class="alert alert-info">
        Hämtar produkter...
    </div>

    <div class="stock" v-if="filteredProducts.length > 0">
        <StockArticle v-for="article in filteredProducts" :id="article.id" :productName="article.name" :key="article.id"
            :description="article.description" :categoryName="article.category.name" :imageUrl="article.image_url" />
    </div>
    <div v-else>
        Inga produkt hittades
    </div>
</template>

<script setup>
import AppDialog from '@/components/AppDialog.vue';
import CategoryManger from '@/components/CategoryManger.vue';
import ProductForm from '@/components/ProductForm.vue';
import StockArticle from '@/components/StockArticle.vue';
import { onMounted, ref, computed } from 'vue';

let stockArticles = ref([]);

let showAddProduct = ref(false);
let showCategoryManger = ref(false);
const error = ref('');
const loading = ref(true);
const dialog = ref(null);
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

        const response = await fetch(url + 'products', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errData = await response.json();
            let finalErrorMessage = 'Kunde inte hämta av lagersartiklar';

            if (errData.message) {
                if (Array.isArray(errData.message)) {
                    finalErrorMessage = errData.message.join(', ');
                } else {
                    finalErrorMessage = errData.message;
                }
            } else if (errData.error) {
                finalErrorMessage = errData.error;
            }

            dialog.value.show(finalErrorMessage, 'error');
            return;
        }

        const productData = await response.json();
        stockArticles.value = productData;
    } catch (err) {
        dialog.value.show(err.message || 'Ett fel uppstod vid hämtning av lagersartiklar', 'error');
    } finally {
        loading.value = false;
    }
}

let addProduct = async (product) => {
    try {
        const response = await fetch(url + 'products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: product
        });

        if (!response.ok) {
            const errData = await response.json();
            let finalErrorMessage = 'Kunde inte lägga till produkten';

            if (errData.message) {
                if (Array.isArray(errData.message)) {
                    finalErrorMessage = errData.message
                        .map(err => err.message || JSON.stringify(err))
                        .join(', ');
                } else {
                    finalErrorMessage = errData.message;
                }
            } else if (errData.error) {
                finalErrorMessage = errData.error;
            }

            dialog.value.show(finalErrorMessage, 'error');
            return;
        }
        const data = await response.json();
        console.log("Produkt tillagd:", data);

        showAddProduct.value = false;
        dialog.value.show('Produkten har lagts till', 'success');
        getStock();
    } catch (err) {
        console.error(err);
        dialog.value.show(err.message || 'Ett fel uppstod vid tillägg av produkten', 'error');
    }
}

const getCategories = async () => {
    try {
        const response = await fetch(url + 'categories', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errData = await response.json();
            let finalErrorMessage = 'Kunde inte hämta kategorier';

            if (errData.message) {
                if (Array.isArray(errData.message)) {
                    finalErrorMessage = errData.message.join(', ');
                } else {
                    finalErrorMessage = errData.message;
                }
            } else if (errData.error) {
                finalErrorMessage = errData.error;
            }

            dialog.value.show(finalErrorMessage, 'error');
            return;
        }

        categories.value = await response.json();
    } catch (err) {
        console.error(err);
        dialog.value.show(err.message || 'Ett fel uppstod vid hämtning av kategorier', 'error');
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
    justify-content: space-around;
    flex-wrap: wrap;
}
</style>