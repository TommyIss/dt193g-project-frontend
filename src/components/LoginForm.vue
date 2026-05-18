<template>
    <form @submit.prevent="login">
        <label for="email">E-post:</label>
        <br>
        <input type="text" name="email" id="email" v-model="loginCredentials.email" required>
    
        <br>

        <label for="password">Lösenord:</label>
        <br>
        <input type="password" name="password" id="password" v-model="loginCredentials.password" required>

        <br>

        <input type="submit" value="Logga in">
        <span class="error" v-if="error">{{ error }}</span>
    </form>
</template>

<script setup>
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';

    const router = useRouter();
    
    let loginCredentials = ref({
        email: '',
        password: ''
    });

    let error = ref('');

    let login = async () => {

        if(!loginCredentials.value.email || !loginCredentials.value.password) {
            error.value = 'Alla fält skall vara uppfyllda';
            return;
        }

        error.value = '';

        try {
            let url = 'https://tois-dt193g-project-webservice.onrender.com/auth/login';

            let res = await fetch(url, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(loginCredentials.value)
            });

            if(!res.ok) {
                error.value = 'Fel e-post eller lösenord.';
                return
            }

            const loginData = await res.json();

            const token = loginData.access_token;

            localStorage.setItem('token', token);
            
            let profileUrl = 'https://tois-dt193g-project-webservice.onrender.com/auth/profile'
            const profileRes = await fetch(profileUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const profileData = await profileRes.json();

            let userProfile = profileData.userProfile;

            localStorage.setItem('user', JSON.stringify(userProfile));

            // Trigga mynen att uppdateras
            window.dispatchEvent(new Event('auth-changed'));

            router.push('/profile');
        } catch (err) {
            error.value = 'Något gick fel. Försök igen.';
            console.error('Fel', err);
        }

    }

</script>

<style scoped>
    .error {
        color: red;
        max-width: 800px;
        margin: 0.5em;
        font-weight: bold;
        font-size: 1.2em;
    }
    form {
        max-width: 800px;
        margin: 0 auto;
    }

    label {
        font-weight: bold;
        font-size: 1.4em;
    }

    input[type='text'], input[type='number'], select {
        max-width: 400px;
        padding: 0.5em;
        width: 100%;
    }

    input[type='submit'] {
        max-width: 100px;
        padding: 0.6em;
        width: 100%;
        margin-left: 1em;
        background-color: #42b883;
        color: white;
        text-transform: uppercase;
        border: none;
        border-radius: 5px;
        transition: 0.3s;
        cursor: pointer;
    }

    input[type='submit']:hover {
        background-color: #35495e;
    }

    @media screen and (max-width: 800px) {
        form {
            width: 90%;
        }

        input[type='text'] {
            max-width: 400px;
            padding: 0.5em;
            width: 90%;
        }
    }

    @media screen and (max-width: 587px) {
        input[type='submit'] {
            margin-left: 0em;
            margin-top: 1em;
        }
    }
</style>