<template>
    <table class="table table-striped mt-3">
        <thead>
            <tr>
                <th>Storlek</th>
                <th>Pris</th>
                <th>Lager</th>
                <th v-if="role === 'admin'">Åtgärder</th>
            </tr>
        </thead>

        <tbody>
            <tr v-for="variant in variants" :key="variant.id">
                
                <td v-if="editingId !== variant.id">{{ variant.size }}</td>
                <td v-else>
                    <input type="text" class="form-control" v-model="editForm.size">
                </td>

                <td v-if="editingId !== variant.id">{{ variant.price }}</td>
                <td v-else>
                    <input type="number" class="form-control" v-model="editForm.price">
                </td>
                
                <td v-if="editingId !== variant.id">
                    <input 
                        type="number"
                        class="form-control"
                        v-model.number="variant.stock_quantity"
                        @change="$emit('updateStock', variant.id, variant.stock_quantity)"
                    />
                </td>
                <td v-else>
                    <input 
                        type="number"
                        class="form-control"
                        v-model.number="editForm.stock_quantity"
                    />
                </td>
                
                <td v-if="role === 'admin'">
                    <template v-if="editingId !== variant.id">
                        <button class="btn btn-warning btn-sm me-2" @click="startEdit(variant)">
                        Redigera
                        </button>
                        <button class="btn btn-danger btn-sm" @click="$emit('delete', variant.id)">
                        Radera
                        </button>
                    </template>

                    <template v-else>
                        <button class="btn btn-success btn-sm me-2" @click="saveEdit">
                        Spara
                        </button>
                        <button class="btn btn-secondary btn-sm" @click="cancelEdit">
                        Avbryt
                        </button>
                    </template>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
    import { ref } from 'vue';

    const props = defineProps({
        variants: Array,
        role: String
    })

    const emit = defineEmits(['updateVariant', 'delete', 'updateStock']);

    const editingId = ref(null);
    const editForm = ref(null);

    const startEdit = (variant) => {
        editingId.value = variant.id;
        editForm.value = { ...variant };
    }

    const cancelEdit = () => {
        editingId.value = null;
        editForm.value = {};
    }

    const saveEdit = () => {
        const payload = {
            size: editForm.value.size,
            price: editForm.value.price,
            stock_quantity: editForm.value.stock_quantity,
            productId: editForm.value.productId
        }
        emit('updateVariant', editForm.value.id, payload );
        editingId.value = null;
    }
</script>

<style scoped></style>