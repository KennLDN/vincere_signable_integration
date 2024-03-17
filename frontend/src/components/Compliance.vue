<template>
  <div class="compliance-page max-w-2xl">
    <h2 class="text-gray-800">Compliance Logs</h2>
    <div class="search-bar w-64 mb-4">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Search..."
        class="w-full p-2 border"
        @input="debouncedFetchLogs()"
      />
    </div>
    <table v-if="logs.length > 0">
      <thead>
        <tr class="bg-[#548c06] text-gray-200 text-sm">
          <th class="px-2 py-2">Candidate</th>
          <th class="px-2 py-2">User</th>
          <th class="px-2 py-2">Changed To</th>
          <th class="px-2 py-2">Time</th>
          <th class="px-2 py-2">userid</th>
          <th class="px-2 py-2">entityid</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.changeTime" class="bg-gray-200 even:bg-gray-300">
          <td class="px-2 py-1">{{ log.entityname }}</td>
          <td class="px-2 py-1">{{ log.username }}</td>
          <td class="px-2 py-1">{{ log.compliantStatus }}</td>
          <td class="px-2 py-1">{{ new Date(log.changeTime).toLocaleString() }}</td>
          <td class="px-2 py-1">{{ log.userId }}</td>
          <td class="px-2 py-1">{{ log.entityId }}</td>

        </tr>
      </tbody>
    </table>
    <p v-else>No compliance logs found.</p>
    <button v-if="page > 1" @click="fetchLogs(page - 1)" class="mt-2 py-2 px-4">Newer</button>
    <button v-if="page < totalPages" @click="fetchLogs(page + 1)" class="mt-2 py-2 px-4">Older</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Compliance',
  data() {
    return {
      logs: [],
      page: 1,
      totalPages: 0,
      totalCount: 0,
      searchTerm: '',
    };
  },
  methods: {
    async fetchLogs(page = 1) {
      this.page = page;
      const searchParam = this.searchTerm.trim() ? `&search=${encodeURIComponent(this.searchTerm.trim())}` : '';
      try {
        const response = await axios.get(`/compliancy-logs?page=${page}${searchParam}`);
        this.logs = response.data.logs;
        this.page = response.data.page;
        this.totalPages = response.data.totalPages;
        this.totalCount = response.data.totalCount;
      } catch (error) {
        console.error('Error fetching compliance logs:', error);
      }
    },
    debounce(func, delay) {
      let timeoutID;
      return (...args) => {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => func.apply(this, args), delay);
      };
    },
  },
  watch: {
    searchTerm() {
      this.fetchLogs(1);
    },
  },
  created() {
    this.debouncedFetchLogs = this.debounce(() => this.fetchLogs(1), 500);
    this.fetchLogs();
  },
};
</script>
