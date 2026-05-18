<template>

    <h2>Profil</h2>
    <h3>Välkommen {{ userDetails.firstname }}</h3>

    <p>Fullstandiga namn: {{ userDetails.firstname }} {{ userDetails.lastname }}</p>
    <p>E-post: {{ userDetails.email }}</p>
    <p>Roll: {{ userDetails.role === 'staff' ? 'Lagermedarbetare' : 'Admin' }}</p>
    
</template>

<script setup>
import { ref, onMounted } from 'vue';

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

            let token = localStorage.getItem('token');

            let url = 'https://tois-dt193g-project-webservice.onrender.com/auth/profile'
            const profileRes = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const profileData = await profileRes.json();

            let userProfile = profileData.userProfile;

            userDetails.value = {
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

</script>

<style scoped>

</style>