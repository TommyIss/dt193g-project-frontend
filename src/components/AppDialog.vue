<template>
    <div
        v-if="visable"
        :class="['alert', alertClass, 'position-fixed', 'top-0', 'start-50', 'translate-middle-x', 'mt-3', 'shadow']"
        style="z-index: 9999; min-width: 300px;"
    >
        {{ message }}
    </div>
</template>

<script setup>

    import { ref } from 'vue';

    const visable = ref(false);
    const message = ref('');
    const alertClass = ref('alert-info');

    const show = (text, type = 'info') => {
        message.value = text;

        if (type === 'success') {
            alertClass.value = 'alert-success';
        } else if (type === 'error') {
            alertClass.value = 'alert-danger';
        } else {
            alertClass.value = 'alert-info';
        }

        visable.value = true;

        setTimeout(() => {
            visable.value = false;
        }, 5000);
    }

    defineExpose({ show });
</script>

<style scoped>
</style>