<template>

    <AppDialog ref="dialog" />

    <h2>Profil</h2>
    <h3>Välkommen {{ userDetails.firstname }}</h3>

    <div v-if="isEditing === false" class="card shadow-sm mt-4 p-4 mx-auto"
    style="max-width: 500px;"
    >
        <p>Fullstandiga namn: {{ userDetails.firstname }} {{ userDetails.lastname }}</p>
        <p>E-post: {{ userDetails.email }}</p>
        <p>Lösenord: ********</p>
        <p>Roll: {{ userDetails.role === 'staff' ? 'Lagermedarbetare' : 'Admin' }}</p>
        <button 
            class="btn btn-warning btn-sm w-50" 
            @click="isEditing = true">
            Redigera dina uppgifter
        </button>
    </div>
    
    <UserForm 
        v-if="isEditing === true"
        :initialUser="userDetails"
        mode="edit"
        :role="role"
        @save="updateProfile"
        @close="isEditing = false"
    />

    
</template>

<script setup>
    import AppDialog from '@/components/AppDialog.vue';
    import UserForm from '@/components/UserForm.vue';
    import { ref, onMounted } from 'vue';

    const dialog = ref(null);
    const isEditing = ref(false);
    const url = 'https://tois-dt193g-project-webservice.onrender.com/';
    const token = localStorage.getItem('token');
    const role = JSON.parse(localStorage.getItem('user'))?.role;

    onMounted(() => {
        getProfile();
    })

    let userDetails = ref({
        firstname: '',
        lastname: '',
        email: '',
        role: '',
        created_at: '',
        updated_at: ''
    });

    let getProfile = async () => {
        try {
            
            const profileRes = await fetch( url + 'auth/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if(!profileRes.ok) {
                const errData = await profileRes.json();
                dialog.value.show(errData.message || 'Kunde inte hämta dina uppgifter');
                return false;
            }

            const profileData = await profileRes.json();

            let userProfile = profileData.userProfile;

            userDetails.value = {
                id: userProfile.id,
                firstname: userProfile.firstname,
                lastname: userProfile.lastname,
                email: userProfile.email,
                role: userProfile.role,
                created_at: userProfile.created_at,
                updated_at: userProfile.updated_at
            };
        } catch (err) {
            console.error(err);
        }
    }

    const updateProfile = async( id, user) => {
        try {
            const response = await fetch(url + 'users/' + id, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(user)
            });

            if(!response.ok) {
                const errData = await response.json();
                dialog.value.show(errData.message || 'Kunde inte uppdatera dina uppgifter', 'error');
                return false;
            }
            
            dialog.value.show('Dina uppgifter har uppdaterats', 'success');

            isEditing.value = false;

            getProfile();
            
        } catch (err) {
            console.error(err);
            dialog.value.show(err.message || 'Ett fel uppstod vid uppdatering av dina uppgifter', 'error');
            return false;
        }
    }
</script>

<style scoped>

</style>