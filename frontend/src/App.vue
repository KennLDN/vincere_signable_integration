<template>
  <div class="flex flex-col w-full">
    <Header />
    <router-view class="p-4"></router-view>
  </div>
</template>

<script>
import Header from './components/Header.vue';
export default {
  components: {
    Header,
  },
};
</script>