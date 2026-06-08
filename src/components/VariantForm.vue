<template>
    <form @submit.prevent="save">
        <label for="size">Storlek:</label>
        <input type="text" v-model="form.size" class="form-control" />

        <label for="price">Pris:</label>
        <input type="number" v-model.number="form.price" class="form-control" />
        
        <label for="quantity">Lagersaldo:</label>
        <input type="number" v-model.number="form.stock_quantity" class="form-control" />

        <div class="mt-3 d-flex justify-content-end">
            <button type="submit" class="btn btn-success">Spara</button>
            <button type="button" class="btn btn-secondary me-2" @click="close">Avbryt</button>
        </div>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>
    </form>
</template>

<script setup>
    import { ref } from 'vue';

    const props = defineProps({
        productId: Number,
        token: String,
        url: String
    });

    const emit = defineEmits(['saved', 'close']);

    const form = ref({
        size: '',
        price: 0,
        stock_quantity: 0
    });

    const error = ref('');

    const save = async() => {
        error.value = '';

        try {
            const response = await fetch(props.url + 'variants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${props.token}`
                }, 
                body: JSON.stringify({
                    ...form.value,
                    productId: props.productId
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                let finalErrorMessage = 'Kunde inte spara varianten';

                if (errData.message) {
                    if (Array.isArray(errData.message)) {
                        finalErrorMessage = errData.message.join(', ');
                    } else {
                        finalErrorMessage = errData.message;
                    }
                } else if (errData.error) {
                    finalErrorMessage = errData.error;
                }
                return;
            }

            emit('saved');
            emit('close');
        } catch (err) {
            console.error("Error: ", err);
            error.value = err.message || 'Ett fel uppstod vid sparande av variant';
        }
    }

    const close = () => emit('close');

</script>

<style scoped>

</style>