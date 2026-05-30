<template>
    <div
        v-if="visable"
        class="alert alert-info position-fixed top-0 start-50 translate-middle-x mt-3 shadow"
        style="z-index: 9999; min-width: 300px;"
    >
        {{ message }}
    </div>
</template>

<script setup>

    import { ref } from 'vue';

    const visable = ref(false);
    const message = ref('');

    const show = (text) => {
        message.value = text;
        visable.value = true;

        setTimeout(() => {
            visable.value = false;
        }, 5000);
    }

    defineExpose({ show });
</script>

<style scoped>
</style>