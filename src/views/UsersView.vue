<template>
    <h2>Användarna</h2>

    <AppDialog ref="dialog" />

    <div v-if="showAddUser === false && role === 'admin'">
        <button class="btn btn-success" @click="showAddUser = true">Lägg till ny användare <em class="fa-solid fa-circle-plus"></em></button>
    </div>

    <UserForm 
        v-if="showAddUser === true"
        @save="addUser"
        @close="showAddUser = false"
        :role="role"
    />

    <div v-if="loading" class="alert alert-info">
        Hämtar användarna...
    </div>
    <UsersTable
        :users="users"
        :role="role"
        @updateUser="updateUser"
        @delete="removeUser"
    />
</template>

<script setup>
    import AppDialog from '@/components/AppDialog.vue';
    import UserForm from '@/components/UserForm.vue';
    import UsersTable from '@/components/UsersTable.vue';
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router';

    const router = useRouter();
    const users = ref([]);
    const url = 'https://tois-dt193g-project-webservice.onrender.com/';

    const role = JSON.parse(localStorage.getItem('user'))?.role;
    const inlogedId = JSON.parse(localStorage.getItem('user'))?.id;
    const token = localStorage.getItem('token');
    
    const loading = ref(true);
    const dialog = ref(null);
    const showAddUser = ref(false);

    onMounted(() => {
        getUsers();
    })


    const getUsers = async() => {
        loading.value = true;
        try {
            const response = await fetch(url + 'users', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json();
                let finalErrorMessage = 'Kunde inte hämta användarna';

                if (errData.message) {
                    if (Array.isArray(errData.message)) {
                        finalErrorMessage = errData.message.join(', ');
                    } else {
                        finalErrorMessage = errData.message;
                    }
                } else if (errData.error) {
                    finalErrorMessage = errData.error;
                }

                dialog.value.show(finalErrorMessage, 'error');
                return false;
            }

            const data = await response.json();

            users.value = data;

        } catch (err) {
            console.error(err);
            dialog.value.show(err.message || 'Ett fel uppstod vid hämtning av användare', 'error');
            return false;
        } finally {
            loading.value = false;
        }
    }

    const addUser = async(user) => {
        try {
            let fetchedUrl = url + 'users/';
            if(user.role === 'admin') {
                fetchedUrl = url + 'admin/create-admin';
            }
            const response = await fetch(fetchedUrl, {
                method: 'Post',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(user)
            });

            if (!response.ok) {
                const errData = await response.json();
                let finalErrorMessage = 'Kunde inte lägga till användaren';

                if (errData.message) {
                    if (Array.isArray(errData.message)) {
                        finalErrorMessage = errData.message.join(', ');
                    } else {
                        finalErrorMessage = errData.message;
                    }
                } else if (errData.error) {
                    finalErrorMessage = errData.error;
                }

                dialog.value.show(finalErrorMessage, 'error');
                return;
            }
            
            dialog.value.show('Användaren har lagts till', 'success');

            showAddUser.value = false;

            getUsers();
        } catch (err) {
            console.error(err);
            dialog.value.show(err.message || 'Ett fel uppstod vid tillägg av användare', 'error');
        }
    }

    const editUser = async(id, user) => {
        try {
            const response = await fetch(url + 'users/' + id, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(user)
            });

            if (!response.ok) {
                const errData = await response.json();
                let finalErrorMessage = 'Kunde inte uppdatera användaren';

                if (errData.message) {
                    if (Array.isArray(errData.message)) {
                        finalErrorMessage = errData.message.join(', ');
                    } else {
                        finalErrorMessage = errData.message;
                    }
                } else if (errData.error) {
                    finalErrorMessage = errData.error;
                }

                dialog.value.show(finalErrorMessage, 'error');
                return false;
            }
            
            dialog.value.show('Användaren har uppdaterats', 'success');

            getUsers();
            return true;
        } catch (err) {
            console.error(err);
            dialog.value.show(err.message || 'Ett fel uppstod vid uppdatering av användare', 'error');
            return false;
        }
    }

    const updateUser = async(id, payload, done) => {
        const success = await editUser(id, payload);

        done(success);
    }

    const removeUser = async(id) => {
        try {
            
            let confirm = '';
            if(inlogedId === id) {
                 confirm = window.confirm('Om du raderar ditt konto kommer du förlora åtkomst till gränssnittet, är du säker på att radera ditt konto?');
            } else {
                confirm = window.confirm('Är du säker på att radera användaren');
            }
            if(!confirm) {
                return;
            }
            const response = await fetch(url + 'users/' + id, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json();
                let finalErrorMessage = 'Kunde inte radera användaren';

                if (errData.message) {
                    if (Array.isArray(errData.message)) {
                        finalErrorMessage = errData.message.join(', ');
                    } else {
                        finalErrorMessage = errData.message;
                    }
                } else if (errData.error) {
                    finalErrorMessage = errData.error;
                }

                dialog.value.show(finalErrorMessage, 'error');
                return;
            }
            
            if(inlogedId === id) {
                dialog.value.show('ditt konto har raderats', 'info');
                router.push('/login');
            }

            dialog.value.show('Användaren har raderats', 'success');

            getUsers();
        } catch (err) {
            console.error(err);
            dialog.value.show(err.message || 'Ett fel uppstod vid radering av användare', 'error');
        }
    }
</script>

<style scoped>

</style>