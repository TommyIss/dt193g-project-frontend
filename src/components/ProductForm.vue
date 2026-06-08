<template>
  <form @submit.prevent="submitForm">
    <div class="mb-3">
      <label class="form-label">Produktnamn:</label>
      <input type="text" class="form-control" v-model="form.name" >
    </div>

    <div class="mb-3">
      <label class="form-label">Beskrivning:</label>
      <textarea class="form-control" v-model="form.description"></textarea>
    </div>

    <div class="mb-3">
      <label class="form-label">Kategori:</label>
      <select class="form-control" v-model="form.categoryId">
        <option disabled value="">Välj Kategori</option>

        <option  
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id">
            {{ cat.name }}
        </option>

        <option value="new">Lägg till ny kategori</option>
      </select>
    </div>

    <div v-if="form.categoryId === 'new'" class="mb-3">
      <label class="form-label">Ny kategori</label>
      <input type="text" class="form-control" v-model="newCategoryName">
    </div>

    <hr>

    <h5>Varianter</h5>
    <div
        v-for="(variant, index) in form.variants"
        :key="index"
        class="border rounded p-3 mb-3"
    >
        <div class="row">
            <div class="col-md-4">
                <label for="size">Storlek:</label>
                <input type="text" class="form-control" v-model="variant.size">
            </div>

            <div class="col-md-4">
                <label for="price">Pris:</label>
                <input type="number" class="form-control" v-model="variant.price">
            </div>

            <div class="col-md-4">
                <label for="stock_quantity">Lagersaldo:</label>
                <input type="number" class="form-control" v-model="variant.stock_quantity">
            </div>

            <div class="col-md-1 d-flex align-items-end">
                <button
                    type="button"
                    class="btn btn-danger btn-sm"
                    @click="removeVariant(index)"
                >
                    Radera variant <em class="fa-solid fa-circle-minus"></em>
                </button>
            </div>
        </div>
    </div>

    <button
        type="button"
        class="btn btn-secondary btn-sm mb-3"
        @click="addVariant"
    >
        Lägg till variant <em class="fa-solid fa-circle-plus"></em>
    </button>

    <hr>

    <div class="mb-3">
        <label class="form-label">
            Produktbild:
        </label>
        <input type="file" class="form-control" @change="onFileChange" accept="image/*">
    </div>

    <hr>

    <button class="btn btn-success">Spara produkt</button>
    <button class="btn btn-secondary me-2 mx-2" @click="close">Avbryt</button>
  </form>
</template>

<script setup>
    import { reactive, onMounted, ref } from 'vue'

    const props = defineProps({
        url: String,
        token: String,
        initialProduct: {
            type: Object,
            default: () => ({})
        }
    });

    const categories = ref([]);
    const newCategoryName = ref('');
    const error = ref('');

    const imageFile = ref(null);

    const emit = defineEmits(['save', 'close']);

    onMounted(() => {
        getCategories();

        if(props.initialProduct?.id) {
            Object.assign(form, {
                name: props.initialProduct.name,
                description: props.initialProduct.description,
                categoryId: props.initialProduct.categoryId,
                variants: props.initialProduct.variants?.map(v => ({
                    size: v.size,
                    price: v.price,
                    stock_quantity: v.stock_quantity
                })) || []
            })
        }
    })

    const form = reactive({
        name: '',
        description: '',
        categoryId: null,
        variants: []
    });
    

    const addVariant = () => {
        form.variants.push({
            size: '',
            price: null,
            stock_quantity: null
        });
    }

    const onFileChange = (event) => {
        imageFile.value = event.target.files[0];
    }

    const removeVariant = (index) => {
        form.variants.splice(index, 1)
    }

    const submitForm = async() => {
        let categoryId = form.categoryId;

        if(categoryId === 'new') {
            try {
                const response = await fetch(props.url + 'categories', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${props.token}`
                    },
                    body: JSON.stringify({ name: newCategoryName.value })
                });

                if(!res.ok) {
                    throw new Error('Kunde inte uppdatera lagersaldo');
                }

                const data = await res.json();
                categoryId = data.category.id;
            } catch (err) {
                error.value = err.message || 'Ett fel uppstod vid hämtning av produkt';
            }
        }
    
        const productData = new FormData();
        productData.append("name", form.name);
        productData.append("description", form.description);
        productData.append("categoryId", categoryId);
        productData.append("variants", JSON.stringify(form.variants));

        if(imageFile.value) {
            productData.append("file", imageFile.value);
        }

        emit('save', productData);
    }

    const getCategories = async() => {
        try {
            const response = await fetch(props.url + 'categories', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${props.token}`
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

                error.value = finalErrorMessage;
                return;
            }

            categories.value = await response.json();
        } catch (err) {
            console.error(err);
            error.value = err.message || 'Ett fel uppstod vid hämtning av kategorier';
        }
    }

    const close = () => emit('close');
</script>