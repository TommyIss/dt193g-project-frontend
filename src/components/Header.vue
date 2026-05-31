<template>
        <header>
        <!-- Logo -->
        <h1 id="logo"><RouterLink :to="logoRoute">LagerFöretag</RouterLink></h1>
        <!-- Menyknapp för att öppna navigeringsmeny i mobil läge  -->
        <button class="menu-btn open" id="open-menu" @click="toggleMenu" ref="openBtnRef">
            <span class="menu-icon">
                <span class="bars"></span>
                <span class="bars"></span>
                <span class="bars"></span>
            </span>
            <span class="menu-text">Meny</span>
        </button>
        <!-- Navigeringsmeny -->
        <nav id="nav-menu" :style="{display: menuDisplay}" ref="menuRef">
            <!-- Knapp som visas när mobilmenyn är utfälld -->
            <button class="menu-btn close" id="close-menu" @click="toggleMenu">
                <span class="meny-icon">
                    <span class="bars cross1"></span>
                    <span class="bars cross2"></span>
                </span>
                <span class="menu-text">Stäng</span>
            </button> 
            <ul class="nav-list">
                <li v-if="!isLoggedIn">
                    <RouterLink to="/">Logga in</RouterLink>
                </li>
                <template v-if="isLoggedIn">
                    <li>
                    <RouterLink to="/profile">Profil</RouterLink>
                    </li>
                    <li v-if="role === 'admin'">
                        <RouterLink to="/users">Användare</RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/stock">Lagersaldo</RouterLink>
                    </li>
                    <li>
                        <button class="btn btn-link nav-link" @click="logout">Logga ut</button>
                    </li>
                </template>
                
            </ul>
        </nav>
    </header>
    
</template>

<script setup>
    import { onMounted, ref, watchEffect, computed } from 'vue';
    import { RouterLink } from 'vue-router';
    import { useRouter } from 'vue-router';

    const router = useRouter();

    let menuDisplay = ref('none');
    let menuRef = ref(null);
    let openBtnRef = ref(null);

    const isLoggedIn = ref(false);
    const role = ref('');

    let logoRoute = computed(() => 
        isLoggedIn.value ? '/profile' : '/'
    )

    onMounted(() => {
        let mediaQuery = window.matchMedia('(max-width: 800px)');
        
        // Funktion som kontrollerar om det mindre eller större skärm
        let screenControll = (event) => {
            if(event.matches) {
                menuDisplay.value = 'none';
            } else {
                menuDisplay.value = 'block';
            }
        } 

        screenControll(mediaQuery);
        
        mediaQuery.addEventListener('change', screenControll);
        
        // Funktion om man trycker utanför menyn
        let clickOutside = (event) => {
            if(
                menuDisplay.value === 'block' && 
                menuRef.value && 
                !menuRef.value.contains(event.target) &&
                (!openBtnRef.value || !openBtnRef.value.contains(event.target) && 
                window.innerWidth <= 800
            )
            ) {
                menuDisplay.value = 'none';
            }
    
        }

        document.addEventListener('click', clickOutside);

        window.addEventListener('auth-changed', () => {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            if(token && user) {
                isLoggedIn.value = true;
                role.value = user.role;
            }else {
                isLoggedIn.value = false;
                role.value = '';
            }
        })
    });

    let toggleMenu = () => {
        menuDisplay.value = menuDisplay.value === 'none' ? 'block': 'none';
    }

    let logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        isLoggedIn.value = false;
        router.push('/');
    }
</script>

<style scoped>
    /* Header-sektion */
    header {
        margin-top: 0;
        background-color: #1F6F5F;
        color: #EEEEEE;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-evenly;
        width: 100%;
        padding: 0.5% 0;
    }

    /* Logo */
    #logo {
        color: var(--Vit, #FFF);
        font-family: Georgia, 'Times New Roman', Times, serif;
        font-size: 2em;
        font-style: normal;
        font-weight: 700;   
        white-space: nowrap; 
        margin: 2% 0;
    }

    /* Navigerinsmeny */
    #nav-menu {
        margin: 0 4%;
    }
    .nav-list {
        list-style-type: none;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        
    }

    .nav-list > li {
        color: #EEEEEE;
        font-family: Georgia, 'Times New Roman', Times, serif;
        font-size: 1.2em;
        font-style: normal;
        font-weight: 400;
        padding: 0 4%;
        white-space: nowrap;
    }

    a {
        text-decoration: none;
        color: #EEEEEE;
    }

    a:hover {
        color: #00AEFF;
        text-decoration: underline;
    }

    .router-link-active{
        color: #00AEFF;
        text-decoration: underline;
    }

    /* Dölja meny knappar i desktopläge */
    .menu-btn {
        display: none;
    }

    @media screen and (max-width: 800px) {
        /* Navigeringsmeny i mobilläge */
        #nav-menu{
            position: absolute;
            right: 0;
            top: 0;
            background-color: #1F6F5F;
            width: 75%;
            margin: 0;
        }
        .nav-list{
            flex-direction: column;
            align-items: flex-start;
            text-align: center;
            margin: 0 auto;
            padding: 5% 0;
            height: 100%;
            background-color: #1F6F5F;
        }
        .nav-list > li {
            padding: 0.8em 0;
            width: 100%;
        }
        /* Öppen knapp */
        .open {
            display: block;
            position: absolute;
            right: 1%;
            top: 1%;
            padding: 0;
        }
        .menu-btn {
            justify-self: flex-end;
            flex-direction: column;
            display: flex;
            align-items: center;
            padding: 1%;
            background-color: #6FCF97;
            border: #EEEEEE solid 1px;
            cursor: pointer;
        }
        .bars {
            display: block;
            width: 20px;
            height: 3px;
            background-color: #EEEEEE;
            margin: 5px 0;
        }
        .menu-btn:hover {
            background-color: #00AEFF;
        }
        .menu-text {
            color: #EEEEEE;
            margin: 1%;
            font-weight: 700;
        }
        /* Stängknapp */
        .close {
            margin: 1em 1.5em;
            right: 2%;
            top: 2%;
        }
        .cross1 {
            width: 25px;
            transform: rotate(45deg);
            position: relative;
            top: 5px;
        }
        .cross2 {
            width: 25px;
            transform: rotate(135deg);
            position: relative;
            top: -3px;
        }
    }
</style>