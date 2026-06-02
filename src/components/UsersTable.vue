<template>
    <div class="table-responsive">
        <table class="table responsive-card table-striped table-green mt-3">
            <thead>
                <tr>
                    <th scope="col">Förnamn</th>
                    <th scope="col">Efternamn</th>
                    <th scope="col">E-post</th>
                    <th scope="col">Lösenord</th>
                    <th scope="col">Roll</th>
                    <th scope="col">Åtgärder</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="user in users" :key="user.id">
                    
                    <td v-if="editingId !== user.id">{{ user.firstname }}</td>
                    <td v-else>
                        <input type="text" class="form-control" v-model="editForm.firstname">
                    </td>

                    <td v-if="editingId !== user.id">{{ user.lastname }}</td>
                    <td v-else>
                        <input type="text" class="form-control" v-model="editForm.lastname">
                    </td>

                    <td v-if="editingId !== user.id">{{ user.email }}</td>
                    <td v-else>
                        <input type="email" class="form-control" v-model="editForm.email">
                    </td>

                    <td v-if="editingId !== user.id">••••••••</td>
                    <td v-else>
                        <input type="password" class="form-control" v-model="editForm.password">
                    </td>

                    <td v-if="editingId !== user.id">{{ user.role  === 'admin' ? 'Admin': 'Lagerpersonal' }}</td>
                    <td v-else>
                        <select 
                            v-model="editForm.role"
                            class="form-control"
                        >
                            <option value="staff">
                                Lagerpersonal
                            </option>
                            <option value="admin">
                                Admin
                            </option>
                        </select>
                    </td>

    
                    
                    <td>
                        <template v-if="editingId !== user.id">
                            <button class="btn btn-warning btn-sm me-2" @click="startEdit(user)">
                            Redigera
                            </button>
                            <button class="btn btn-danger btn-sm" @click="$emit('delete', user.id)">
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
    </div>
</template>

<script setup>
    import { ref } from 'vue';

    const props = defineProps({
        users: Array,
        role: String
    })

    const emit = defineEmits(['updateUser', 'delete']);

    const editingId = ref(null);
    const editForm = ref(null);

    const startEdit = (user) => {
        editingId.value = user.id;
        editForm.value = { ...user, password: '' };
    }

    const cancelEdit = () => {
        editingId.value = null;
        editForm.value = {};
    }

    const saveEdit = () => {
        const payload = {
            firstname: editForm.value.firstname,
            lastname: editForm.value.lastname,
            email: editForm.value.email,
            role: editForm.value.role
        }

        if(editForm.value.password.trim() !== '') {
            payload.password = editForm.value.password;
        }
        
        emit('updateUser', editForm.value.id, payload, (success) => {
            if (success) {
                cancelEdit();
            }
        });
        
        
    }
</script>

<style scoped>
    @media (max-width: 700px) {
        table .responsive-card {
            display: block;
        }

        table.responsive-card thead {
            display: none;
        }

        table.responsive-card tbody tr {
            display: block;
            margin-bottom: 1rem;
            border: 1px solid #ccc;
            padding: 10px;
            border-radius: 8px;
        }

        table.responsive-card td {
            display: flex;
            justify-content: center;
            padding: 6px 0;
            text-align: left;
        }

        table.responsive-card td::before {
            content: attr(data-label);
            font-weight: bold;
            color: #1f6f5f;
        }
    }
</style>