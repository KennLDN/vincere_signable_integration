<template>
    <div>
      <div class="flex justify-between w-full gap-5 bg-[#65aa03] shadow-lg items-center">
        <img src="/public/logo.png" class="h-10 p-2">
        <p class="py-2 px-4 text-white font-bold">Admin Panel</p>
      </div>
      <div class="flex w-full items-center h-10 bg-[#548c06]">
        <router-link to="/admin/references" class="px-4 flex h-full no-underline items-center" :class="getLinkClass('/admin/references')">
          <p class="text-sm text-white">Reference Email Log</p>
        </router-link>
        <router-link to="/admin/compliance" class="px-4 flex h-full no-underline items-center" :class="getLinkClass('/admin/compliance')">
          <p class="text-sm text-white">Compliance Log</p>
        </router-link>
        <router-link to="/admin/monitor" class="px-4 flex h-full no-underline items-center" :class="getLinkClass('/admin/monitor')">
          <p class="text-sm text-white">Server Monitor</p>
        </router-link>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Header',
    methods: {
      getLinkClass(path) {
        return this.$route.path === path ? 'bg-[#467701]' : '';
      },
    },
  };
  </script>
  