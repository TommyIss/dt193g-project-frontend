<template>
  <div class="card p-3 shadow-sm">

    <h4>Kategorier</h4>

    <!-- Lista -->
    <ul class="list-group mb-3">
      <li 
        v-for="cat in categories" 
        :key="cat.id" 
        class="list-group-item d-flex justify-content-around align-items-center"
      >
        <span v-if="editingId !== cat.id" class="w-75">{{ cat.name }}</span>

        <!-- Redigera -->
        <input 
          v-else 
          type="text" 
          class="form-control w-75"
          v-model="editName"
        >

        <div>
          <button 
            v-if="editingId !== cat.id"
            class="btn btn-sm btn-primary m-1"
            @click="startEdit(cat)"
          >
            Redigera
          </button>

          <button
            v-if="editingId !== cat.id" 
            class="btn btn-sm btn-danger m-1"
            @click="deleteCategory(cat.id)"
          >
            Radera
          </button>

          <button 
            v-if="editingId === cat.id"
            class="btn btn-sm btn-success m-1"
            @click="saveEdit(cat.id)"
          >
            Spara
          </button>

          <button 
            v-if="editingId === cat.id"
            class="btn btn-sm btn-secondary m-1"
            @click="stopEdit(cat)"
          >
            Avbryt
          </button>
          
        </div>
      </li>
    </ul>

    <!-- Lägg till ny kategori -->
    <div class="d-flex flex-wrap">
      <input 
        type="text" 
        class="form-control" 
        placeholder="Ny kategori..."
        v-model="newCategory"
      >
      <div>

        <button class="btn btn-success m-1" @click="addCategory">
          Lägg till
        </button>

        <button 
              class="btn btn-sm btn-secondary m-1"
              @click="closeManger"
            >
              Stäng kategori hanterare
            </button>
      </div>
    </div>

  </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';

    const props = defineProps({
        url: String,
        error: String,
        token: String
    });

    const categories = ref([]);
    const newCategory = ref('');
    const editingId = ref(null);
    const editName = ref('');

    const emits = defineEmits(['getCategories', 'closeManger'])

    const getCategories = async () => {
        try {
            const res = await fetch(props.url + 'categories', {
                headers: { authorization: `Bearer ${props.token}` }
            });
            categories.value = await res.json();
        } catch (err) {
            
        }
    
    };

    const addCategory = async () => {
        try {
            if (!newCategory.value.trim()) return;

            const res = await fetch(props.url + 'categories', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${props.token}`
                },
                body: JSON.stringify({ name: newCategory.value })
            });

            if(!res.ok) {
                throw new Error('Kunde inte lägga till kategorin!');
            }

            newCategory.value = '';
            getCategories();

        } catch (err) {
            console.error(err);
            props.error = err.message || 'Ett fel uppstod vid tillägg av kategorin';
        }
    
    };

    const deleteCategory = async (id) => {
        try {

            const confirm = window.confirm('Om du raderar kategorin du riskerar att ta bort alla produkter som hör till kategorin, Vill du radera den?');

            if(!confirm) {
                return;
            }
           const res = await fetch(props.url + 'categories/' + id, {
                method: 'DELETE',
                headers: { authorization: `Bearer ${props.token}` }
            });

            if(!res.ok) {
                throw new Error('Kunde inte radera kategorin!');
            }

            getCategories();
        } catch (err) {
            console.error(err);
            props.error = err.message || 'Ett fel uppstod vid radering av kategorin';
        }
        
    };

    const startEdit = (cat) => {
        editingId.value = cat.id;
        editName.value = cat.name;
    };

    const stopEdit = (cat) => {
        editingId.value = null;
        editName.value = '';
    };

    const saveEdit = async (id) => {
        try {
            const res = await fetch(props.url + 'categories/' + id, {
                method: 'PATCH',
                headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${props.token}`
                },
                body: JSON.stringify({ name: editName.value })
            });

            if(!res.ok) {
                throw new Error('Kunde inte uppdatera kategorin!');
            }

            editingId.value = null;
            editName.value = '';
            getCategories();
        } catch (err) {
            console.error(err);
            props.error = err.message || 'Ett fel uppstod vid uppdatering av kategorin';
        }
        
    
    };

    const closeManger = () => emits('closeManger');
    onMounted(getCategories);
</script>
