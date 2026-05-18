<script setup lang="ts">
import { RouterView } from 'vue-router';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';

</script>

<template>

  <Header />
  

  <main>
    <RouterView />
  </main>

  <Footer />
</template>

<style scoped>
  main {
    max-width: 800px;
    min-height: 600px;
    margin: 0 auto;
  }
  h2 {
    text-align: center;
  }
  img {
    width: 100%;
    height: 300px;
  }
  @media screen and (max-width: 800px) {
    img {
      height: 200px;
    }
    main {
      margin: 0 2%;
    }
}
</style>
