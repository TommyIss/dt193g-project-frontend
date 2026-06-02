<template>
    <div class="container">
        <AppDialog ref="dialog" />

        <div v-if="loading" class="alert alert-info">
            Hämtar produktinformation...
        </div>

        <div v-if="product && !loading && !error">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item">
                        <RouterLink to="/stock">Lagersaldo</RouterLink>
                    </li>
                    <li class="breadcrumb-item active" aria-current="page">{{ product?.name }}</li>
                </ol>
            </nav>
            <div class="d-flex gap-3 flex-wrap-reverse align-items-end justify-content-center">

                <div class="flex-grow-0">
                    <h2 v-if="productEditing === false" class="mb-3">
                        {{ product?.name }}
                    </h2>

                    <p class="m-1" v-if="productEditing === false">
                        Kategori: {{ product?.category.name }}
                    </p>

                    <p class="m-1" v-if="productEditing === false">
                        Beskrivning: {{ product?.description }}
                    </p>

                    <div v-if="role === 'admin' && productEditing === false">

                        <button class="btn btn-warning btn-sm" @click="productEditing = true">
                            Redigera produkt
                        </button>
                        <button class="btn btn-danger btn-sm m-1" @click="deleteProduct(product?.id)">
                            Radera produkt
                        </button>

                    </div>
                </div>

                <div v-if="role === 'admin' && productEditing === true" class="card p-3 shadow-sm">

                    <div>
                        <label class="form-label">
                            Ladda upp en bild:
                        </label>

                        <input type="file" class="form-control" accept="image/*" @change="onFileChange">
                    </div>

                    <div>
                        <label for="productName">Produktnamn:</label>
                        <input type="text" class="form-control" v-model="product.name">
                    </div>

                    <div>
                        <label for="productDesription">Beskrivning:</label>
                        <input type="text" class="form-control" v-model="product.description">
                    </div>

                    <div>
                        <label for="productCategory">Kategori:</label>
                        <input type="text" class="form-control" v-model="product.category.name">
                    </div>

                    <div>

                        <button class="btn btn-success btn-sm me-2" @click="editProduct(product?.id, product)">
                            Uppdatera produkt
                        </button>

                        <button class="btn btn-secondary btn-sm" @click="productEditing = false">
                            Avbryt
                        </button>

                    </div>
                </div>
                <div class="w-sm-100 flex-grow-1">
                    <img v-if="product?.image_url !== null" :src="product?.image_url" :alt="product?.description"
                        class="img-fluid rounded shadow-sm product-image">
                    <span v-if="product?.image_url === null">
                        Ingen bild har laddats upp!
                    </span>
                </div>
            </div>

            <h3>Varianter</h3>
            <button v-if="role === 'admin'" class="btn btn-success btn-sm mt-3" @click="showAddVariant = true">
                Lägg till variant
            </button>

            <VariantForm 
                v-if="showAddVariant && role === 'admin'" :productId="product.id" :token="token" :url="url"
                @saved="getProductsDetails" @close="showAddVariant = false" 
            />

            <VariantTable
                :variants="product.variants" :role="role"             @updateStock="updateStock"
                @updateVariant="editVariant" @delete="deleteVariant" 
            />
        </div>

    </div>
</template>

<script setup>
import VariantTable from '@/components/VariantTable.vue';
import VariantForm from '@/components/VariantForm.vue';
import { ref, onMounted, h } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import AppDialog from '@/components/AppDialog.vue';

const dialog = ref(null);
const route = useRoute();
const router = useRouter();

const product = ref(null);
const imageFile = ref(null);
const loading = ref(true);
const error = ref('');
const role = JSON.parse(localStorage.getItem('user'))?.role;
const token = localStorage.getItem('token');
const url = 'https://tois-dt193g-project-webservice.onrender.com/';

const showAddVariant = ref(false);
const productEditing = ref(false);

onMounted(() => {
    getProductsDetails();
});

let getProductsDetails = async () => {
    loading.value = true;
    try {
        const id = route.params.id;

        const response = await fetch(url + `products/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errData = await response.json();
            dialog.value.show(errData.message || 'Kunde inte hämta productData', 'error');
            return;
        }

        const productData = await response.json();

        product.value = productData;
        
    } catch (err) {
        console.error(err);
        dialog.value.show(err.message || 'Ett fel uppstod vid hämtning av produkt', 'error');
    } finally {
        loading.value = false;
    }
}

// Lagerpersonal - funktionalitet
let updateStock = async (id, amount) => {
    try {
        const response = await fetch(url + `variants/${id}/stock`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity: amount })
        });

        if (!response.ok) {
            const errData = await response.json();
            dialog.value.show(errData.message || 'Kunde inte uppdatera lagersaldo', 'error');
            return;
        }

        dialog.value.show('Lagersaldo har uppdaterats', 'success');

        getProductsDetails();
    } catch (err) {
        console.error(err);
        dialog.value.show(err.message || 'Ett fel uppstod vid uppdatering av lagersaldo', 'error');
    }
}

// Admin - funktionalitet
    const editVariant = async (id, updatedVariant, callback) => {
        try {
            const response = await fetch(url + `variants/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedVariant)
            });

            if (!response.ok) {
                const errData = await response.json();
                dialog.value.show(errData.message || 'Kunde inte uppdatera variant', 'error');
                callback?.(false);
                return;
            }

            dialog.value.show('Varianten har uppdaterats', 'success');

            await getProductsDetails();
            callback?.(true);
        } catch (err) {
            console.error(err);
            dialog.value.show(err.message || 'Ett fel uppstod vid uppdatering av variant', 'error');
            callback?.(false);
        }
    }

const deleteVariant = async (id) => {
    try {
        const confirmed = window.confirm('Är du säker på att du vill radera varianten');
        if (!confirmed) return;

        const response = await fetch(url + `variants/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errData = await response.json();
            dialog.value.show(errData.message || 'Kunde inte ta bort variant', 'error');
            return;
        }

        dialog.value.show('Varianten har raderats!', 'success');

        getProductsDetails();
    } catch (err) {
        console.error(err);
        dialog.value.show(err.message || 'Ett fel uppstod vid radering av produkt', 'error');
    }
}

const editProduct = async (id, updatedProduct) => {
    try {
        const payload = {
            name: updatedProduct.name,
            description: updatedProduct.description,
            categoryId: updatedProduct.categoryId
        }
        const response = await fetch(url + `products/${id}`, {
            method: 'PATCH',
            headers: {
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            dialog.value.show(errData.message ||'Kunde inte uppdatera produkten', 'error');
            return;
        }

        if (product.value) {
            await editImage(id);
        }

        dialog.value.show("Produkten har uppdaterats!");

        productEditing.value = false;
        getProductsDetails();

    } catch (err) {
        console.error(err);
        dialog.value.show(err.message || 'Ett fel uppstod vid uppdatering av produkten');;
    }
}

const editImage = async (id) => {
    try {

        const formData = new FormData();
        formData.append("file", imageFile.value);

        const response = await fetch(`${url}products/${id}/upload-image`, {
            method: 'PATCH',
            headers: {
                'authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json();
            dialog.value.show(errData.message ||'Kunde inte uppdatera bilden', 'error');
            return;
        }

    } catch (err) {
        console.error(err);
        dialog.value.show(err.message || 'Ett fel uppstod vid uppdatering av bilden', 'error');
    }
}

const deleteProduct = async (id) => {
    try {
        const confirmed = window.confirm('Är du säker på att du vill ta bort denna produkt');
        if (!confirmed) return;

        const response = await fetch(url + `products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errData = await response.json();
            dialog.value.show(errData.message ||'Kunde inte ta bort produkter', 'error');
            return;
        }

        await deleteImage(id);
        dialog.value.show('Produkten har raderats', 'success');
        router.push('/stock');
    } catch (err) {
        console.error(err);
        dialog.value.show(err.message || 'Ett fel uppstod vid radering av produkt', 'error');
    }
}

const deleteImage = async (id) => {
    try {

        const response = await fetch(`${url}products/${id}/delete-image`, {
            method: 'DELETE',
            headers: {
                'authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errData = await response.json();
                dialog.value.show(errData.message ||'Kunde inte radera bilden', 'error');
                return;
        }

    } catch (err) {
        console.error(err);
        dialog.value.show(err.message || 'Ett fel uppstod vid radering av bilden', 'error');
    }
}

const onFileChange = (event) => {
    imageFile.value = event.target.files[0];
}

</script>

<style scoped>
    .product-image {
        width: 100%;
        height: 300px;
    }

    #quantity {
        max-width: 10ch;
    }

    .breadcrumb-item, .breadcrumb-item a {
        text-decoration: none;
        color: black;
    }
    .breadcrumb .active {
        text-decoration: underline;
    }
    .breadcrumb-item a:hover {
        color: #00AEFF;
        text-decoration: underline;
    }

    @media screen and (max-width: 700px) {
        .product-image {
            width: 100%;
            height: 300px;
        }
    }
</style>