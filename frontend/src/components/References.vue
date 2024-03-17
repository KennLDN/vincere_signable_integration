<template>
  <div class="reference-page max-w-4xl">
    <h2 class="text-gray-800">Reference Logs</h2>
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
          <th class="px-2 py-2"></th>
          <th class="px-2 py-2" colspan="4">Field 1</th>
          <th class="px-2 py-2" colspan="4">Field 2</th>
          <th class="px-2 py-2" colspan="4">Field 3</th>
        </tr>
        <tr class="bg-[#548c06] text-gray-200 text-sm">
          <th class="px-2 py-2">Candidate</th>
          <th class="px-2 py-2">Status</th>
          <th class="px-2 py-2">User</th>
          <th class="px-2 py-2">Message</th>
          <th class="px-2 py-2">Date</th>
          <th class="px-2 py-2">Status</th>
          <th class="px-2 py-2">User</th>
          <th class="px-2 py-2">Message</th>
          <th class="px-2 py-2">Date</th>
          <th class="px-2 py-2">Status</th>
          <th class="px-2 py-2">User</th>
          <th class="px-2 py-2">Message</th>
          <th class="px-2 py-2">Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(log, index) in logs" :key="log.candidateId" class="text-xs">
          <td class="px-2 py-1" :class="getStatusClass(0, index)">{{ log.candidateName }}</td>
          <td class="px-2 py-1" :class="getStatusClass(log.oneStatus, index)">{{ log.oneStatus !== 0 ? log.oneStatus : '' }}</td>
          <td class="px-2 py-1" :class="getStatusClass(log.oneStatus, index)">{{ log.oneUsername !== 'Unknown User' ? log.oneUsername : '' }}</td>
          <td class="px-2 py-1" :class="getStatusClass(log.oneStatus, index)">{{ log.oneMsg }}</td>
          <td class="px-2 py-1" :class="getStatusClass(log.oneStatus, index)">{{ formatDate(log.oneDate) !== 'N/A' ? formatDate(log.oneDate) : '' }}</td>
          <td class="px-2 py-1" :class="getStatusClass(log.twoStatus, index)">{{ log.twoStatus !== 0 ? log.twoStatus : '' }}</td>
          <td class="px-2 py-1" :class="getStatusClass(log.twoStatus, index)">{{ log.twoUsername !== 'Unknown User' ? log.twoUsername : '' }}</td>
          <td class="px-2 py-1" :class="getStatusClass(log.twoStatus, index)">{{ log.twoMsg }}</td>
          <td class="px-2 py-1" :class="getStatusClass(log.twoStatus, index)">{{ formatDate(log.twoDate) !== 'N/A' ? formatDate(log.twoDate) : '' }}</td>
          <td class="px-2 py-1" :class="getStatusClass(log.threeStatus, index)">{{ log.threeStatus !== 0 ? log.threeStatus : '' }}</td>
          <td class="px-2 py-1" :class="getStatusClass(log.threeStatus, index)">{{ log.threeUsername !== 'Unknown User' ? log.threeUsername : '' }}</td>
          <td class="px-2 py-1" :class="getStatusClass(log.threeStatus, index)">{{ log.threeMsg }}</td>
          <td class="px-2 py-1" :class="getStatusClass(log.threeStatus, index)">{{ formatDate(log.threeDate) !== 'N/A' ? formatDate(log.threeDate) : '' }}</td>

        </tr>
      </tbody>
    </table>
    <p v-else>No reference logs found.</p>
    <button v-if="page > 1" @click="fetchLogs(page - 1)" class="mt-2 py-2 px-4">Newer</button>
    <button v-if="page < totalPages" @click="fetchLogs(page + 1)" class="mt-2 py-2 px-4">Older</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'References',
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
        const response = await axios.get(`/reference-logs?page=${page}${searchParam}`);
        this.logs = response.data.logs;
        this.totalPages = response.data.totalPages;
        this.totalCount = response.data.totalCount;
      } catch (error) {
        console.error('Error fetching reference logs:', error);
      }
    },
    debounce(func, delay) {
      let timeoutID;
      return (...args) => {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => func.apply(this, args), delay);
      };
    },
    formatDate(dateString) {
      return dateString ? new Date(dateString).toLocaleString() : 'N/A';
    },
    getStatusClass(status, index) {
      const odd = index % 2 !== 0;
      switch(status) {
        case 1:
          return odd ? 'bg-yellow-100 bg-opacity-40' : 'bg-yellow-200 bg-opacity-40';
        case 2:
          return odd ? 'bg-green-100 bg-opacity-40' : 'bg-green-200 bg-opacity-40';
        case -1:
          return odd ? 'bg-red-100 bg-opacity-40' : 'bg-red-200 bg-opacity-40';
        case 0:
          return odd ? 'bg-gray-200' : 'bg-gray-300';
        default:
          return '';
      }
    }
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