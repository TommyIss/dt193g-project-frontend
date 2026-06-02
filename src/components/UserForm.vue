<template>
  <form @submit.prevent="submitForm">
    <div class="mb-3">
      <label class="form-label">Förnamn:</label>
      <input type="text" class="form-control" v-model="form.firstname">
    </div>

    <div class="mb-3">
      <label class="form-label">Efternamn:</label>
      <input type="text" class="form-control" v-model="form.lastname">
    </div>

    <div class="mb-3">
      <label class="form-label">E-post:</label>
      <input type="email" class="form-control" v-model="form.email">
    </div>

    <div class="mb-3">
      <label class="form-label">Lösenord:</label>
      <input type="password" class="form-control" v-model="form.password">
    </div>

    <div class="mb-3" v-if="role === 'admin'">
        <label class="form-label">Välj roll:</label>
        <select 
            v-model="form.role"
            class="form-control"
        >
            <option value="staff">
                Lagerpersonal
            </option>
            
            <option value="admin">
                Admin
            </option>
        </select>
    </div>

    <hr>

    <button class="btn btn-success">
        Spara
    </button>
    <button type="button" class="btn btn-secondary me-2 mx-2" @click="close">
        Avbryt
    </button>

  </form>
</template>

<script setup>
    import { reactive } from 'vue';
    
    const props = defineProps({
        role: String,
        url: String,
        token: String,
        initialUser: {
            type: Object,
            default: () => ({})
        },
        mode: {
            type: String,
            default: 'create'
        }
    });


    const emit = defineEmits(['save', 'close']);

    const form = reactive({
        id: props.initialUser.id || null,
        firstname: props.initialUser.firstname || '',
        lastname: props.initialUser.lastname || '',
        email: props.initialUser.email || '',
        password: '',
        role: props.initialUser.role || 'staff'
    });
    

    const submitForm = async() => {
    
        const userData = {
            firstname: form.firstname,
            lastname: form.lastname,
            email: form.email,
            role: form.role
        };

        if (form.password.trim() !== '') {
            userData.password = form.password;
        }
        if(props.mode === 'edit') {
            emit('save', form.id, userData );
        } else {
            emit('save', userData)
        }
    }

    const close = () => emit('close');
</script>