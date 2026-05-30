<template>
    <div class="container">
        <AppDialog ref="dialog" />

        <div v-if="loading" class="alert alert-info">
            Hämtar produktinformation...
        </div>

        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <div v-if="product && !loading && !error">
            <div  class="row">
                <div class="col-4">
                    <h2 v-if="productEditing === false">
                        {{ product?.name }}
                    </h2>

                    <p v-if="productEditing === false">
                        Beskrivning: {{ product?.description }}
                    </p>

                    <p v-if="productEditing === false">
                        Kategori: {{ product?.category.name}}
                    </p>
                    <div 
                        v-if="role === 'admin' && productEditing === false">
                
                        <button 
                            class="btn btn-warning btn-sm" @click="productEditing = true">
                        Redigera produkt
                        </button>
                        <button 
                            class="btn btn-danger btn-sm m-1" 
                            @click="deleteProduct(product?.id)">
                            Radera produkt
                        </button>
                    
                    </div>
                </div>
                
                <div v-if="role === 'admin' && productEditing === true"
                class="col-4"
                >
                    
                    <div>
                        <label class="form-label">
                            Ladda upp en bild:
                        </label>

                        <input 
                            type="file" 
                            class="form-control" 
                            accept="image/*"
                            @change="onFileChange"    
                        >
                    </div>

                    <div>
                        <label for="productName">Produktnamn:</label>
                        <input 
                            type="text"
                            class="form-control"
                            v-model="product.name"
                        >
                    </div>

                    <div>
                        <label for="productDesription">Beskrivning:</label>
                        <input 
                            type="text"
                            class="form-control"
                            v-model="product.description"
                        >
                    </div>

                    <div>
                        <label for="productCategory">Kategori:</label>
                        <input 
                            type="text"
                            class="form-control"
                            v-model="product.category.name"
                        >
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
                <div class="col-8 d-flex justify-content-center">
                    <img  
                    v-if="product?.image_url !== null"
                    :src="product?.image_url" 
                    :alt="product?.description"
                    class="w-50 h-75 my-3"            
                    >
                    <span 
                        v-if="product?.image_url === null"
                    >
                        Ingen bild har laddats upp!
                    </span>
                </div>
            </div>
            
            <h3>Varianter</h3>
            <button 
                v-if="role === 'admin'"
                class="btn btn-success btn-sm mt-3"
                @click="showAddVariant = true"
            >
                Lägg till variant
            </button>

            <VariantForm 
                v-if="showAddVariant && role === 'admin'"
                :productId="product.id"
                :token="token"
                :url="url"
                @saved="getProductsDetails"
                @close="showAddVariant = false"
            />
            <VariantTable 
                :variants="product.variants"
                :role="role"
                @updateStock="updateStock"
                @updateVariant="editVariant"
                @delete="deleteVariant"
            />
        </div>

    </div>
</template>

<script setup>
    import VariantTable from '@/components/VariantTable.vue';
    import VariantForm from '@/components/VariantForm.vue';
    import { ref, onMounted, h } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import AppDialog from '@/components/AppDialog.vue';

    const dialog = ref(null);
    const route = useRoute();
    const router = useRouter();

    const product = ref(null);
    const imageFile  = ref(null);
    const loading = ref(true);
    const error = ref('');
    const role = JSON.parse(localStorage.getItem('user'))?.role;
    const token = localStorage.getItem('token');
    const url = 'https://tois-dt193g-project-webservice.onrender.com/';

    const showAddVariant = ref(false);
    const productEditing = ref(false);

    onMounted( () => {
        getProductsDetails();
    });

    let getProductsDetails = async() => {
        loading.value = true;
        error.value = '';
        try {
            const id = route.params.id;
            
            const response = await fetch(url + `products/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if(!response.ok) {
                throw new Error('Kunde inte hämta productData');
            }

            let productData = await response.json();
            console.log(productData);

            productData.variants.sort((a, b) => 
                (new Date(a.added_at).getTime() > new Date(b.added_at).getTime()) ? 1: -1
            );

            product.value = productData;
            
        } catch (err) {
            error.value = err.message || 'Ett fel uppstod vid hämtning av produkt';
        } finally {
            loading.value = false;
        }
    }

    // Lagerpersonal - funktionalitet
    let updateStock = async(id, amount ) => {
        try {
            const response = await fetch(url + `variants/${id}/stock`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: amount })
            });

            if(!response.ok) {
                throw new Error('Kunde inte uppdatera lagersaldo');
            }

            getProductsDetails();
        } catch (err) {
            error.value = err.message || 'Ett fel uppstod vid uppdatering av lagersaldo';
        }
    }

    // Admin - funktionalitet
    const editVariant = async (id, updatedVariant) => {
        try {
            const res = await fetch(url + `variants/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedVariant)
            });

            if(!res.ok) {
                throw new Error('Kunde inte uppdatera variant');
            }

            getProductsDetails();

        } catch (err) {
            console.error(err);
            error.value = err.message || 'Ett fel uppstod vid uppdatering av variant';
        }
    }

    const deleteVariant = async (id) => {
        try {
            const confirmed = window.confirm('Är du säker på att du vill radera varianten');
            if(!confirmed) return;

            const response = await fetch( url + `variants/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if(!response.ok) {
                throw new Error('Kunde inte ta bort variant');
            }

            getProductsDetails();
        } catch (err) {
            error.value = err.message || 'Ett fel uppstod vid radering av produkt';
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

            if(!response.ok) {
                throw new Error('Kunde inte uppdatera produkten');
            }
            
            if(product.value) {
                await editImage(id);
            }
            productEditing.value = false;
            getProductsDetails();
            
            dialog.value.show("Produkten har uppdaterats!");
        } catch (err) {
            console.error(err);
            dialog.value.show( err.message ||'Ett fel uppstod vid uppdatering av produkten');;
        }
    } 

    const editImage = async(id) => {
        try {

            const formData = new FormData();
            formData.append("file", imageFile.value);

            const res = await fetch(`${url}products/${id}/upload-image`, {
                method: 'PATCH',
                headers: {
                    'authorization': `Bearer ${token}`
                },
                body: formData
            });

            if(!res.ok) {
                throw new Error('Kunde inte uppdatera bilden')
            }

        } catch (err) {
            error.value = err.message ||'Ett fel uppstod vid uppdatering av bilden';
        }
    }

    const deleteProduct = async (id) => {
        try {
            const confirmed = window.confirm('Är du säker på att du vill ta bort denna produkt');
            if(!confirmed) return;

            const response = await fetch(url + `products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if(!response.ok) {
                throw new Error('Kunde inte ta bort produkter');
            }

            await deleteImage(id);
            dialog.value.show('Produkten har raderats');
            router.push('/stock');
        } catch (err) {
            
            dialog.value.show('Produkten har raderats');
            error.value = err.message || 'Ett fel uppstod vid radering av produkt';
        }
    }

    const deleteImage = async(id) => {
        try {

            const res = await fetch(`${url}products/${id}/delete-image`, {
                method: 'DELETE',
                headers: {
                    'authorization': `Bearer ${token}`
                }
            });

            if(!res.ok) {
                throw new Error('Kunde inte radera bilden')
            }

        } catch (err) {
            error.value = err.message ||'Ett fel uppstod vid radering av bilden';
        }
    }

    const onFileChange = (event) => {
        imageFile.value = event.target.files[0];
    }

</script>

<style scoped>

.productImg {
    width: 100%;
    height: 300px;
}

#quantity {
    max-width: 10ch;
}
</style>