<template>
  <div class="p-4 max-w-2xl">
    <h2 class="text-gray-800">Server Monitor</h2>
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-gray-300 p-4">
        <div>CPU Usage:</div>
        <div class="font-bold">{{ monitorData.cpuUsage }}</div>
      </div>

      <div class="bg-gray-300 p-4">
        <div>RAM Usage:</div>
        <div class="font-bold">{{ monitorData.ramUsage }}</div>
      </div>

      <div class="bg-gray-300 p-4">
        <div>Storage Usage:</div>
        <div class="font-bold">{{ monitorData.storageUsage }}</div>
      </div>

      <div class="bg-gray-300 p-4 col-span-3">
        <div>Database Stats:</div>
        <table class="min-w-full table-auto">
          <thead>
            <tr>
              <th class="px-4 py-2">Name</th>
              <th class="px-4 py-2">Entries</th>
              <th class="px-4 py-2">Size (Est.)</th>
              <th class="px-4 py-2">Comment</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, name) in monitorData.dbStats" :key="name" class="bg-gray-200 even:bg-gray-300">
              <td class="border px-4 py-2">{{ getCleanName(name) }}</td>
              <td class="border px-4 py-2">{{ value.count }} entries</td>
              <td class="border px-4 py-2">{{ formatBytes(value.estimatedSizeBytes) }}</td>
              <td class="border px-4 py-2">{{ getComment(name) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-gray-300 p-4 col-span-3">
        <div class="flex justify-between mb-1">
          <div>Logs:</div>
          <div>{{ logSize }} / 50 MB</div>
        </div>
        <div class="log-entries bg-gray-600 text-white p-3 h-64 overflow-auto" ref="logContainer">
          <div v-for="log in monitorData.logs" :key="log">
            <span v-if="getMatch(log, 0)" class="text-blue-400">[{{ getMatch(log, 0) }}]</span>
            <span v-if="getMatch(log, 1)" :class="getFileColor(getMatch(log, 1))">[{{ getMatch(log, 1) }}]</span>
            <span v-if="getMatch(log, 2)" :class="getStatusColor(getMatch(log, 2))">[{{ getMatch(log, 2) }}]</span>
            <span>{{ getRemainingText(log) }}</span>
          </div>
        </div>
        <div class="flex justify-between mt-4">
          <div>
            <button @click="changePage(-1)" :disabled="logPage === 1" class="mr-2">Previous</button>
            <button @click="changePage(1)">Next</button>
          </div>
          <select v-model="logLines" @change="fetchLogData">
            <option value="20">20 lines</option>
            <option value="50">50 lines</option>
            <option value="100">100 lines</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Monitor',
  data() {
    return {
      monitorData: {
        cpuUsage: '',
        ramUsage: '',
        storageUsage: '',
        dbStats: {},
        logs: []
      },
      logPage: 1,
      logLines: 20,
      logSize: '0KB',
      cleanNames: {
        CandidateCompliancy: "Candidates",
        CandidateCreateQueue: "Unprocessed New Candidates",
        CandidateUpdateQueue: "Unprocessed Candidate Updates",
        CompliancyLogs: "Compliancy Logs",
        LastProcessedTimestamp: "Ensure",
        Token: "Token",
        UserToken: "User Tokens",
        Users: "Users"
      },
      comments: {
        CandidateCompliancy: "should match candidate count in vincere (minus one)",
        CandidateCreateQueue: "should be empty or low",
        CandidateUpdateQueue: "should be empty or low",
        CompliancyLogs: "amount of compliancy changes recorded",
        LastProcessedTimestamp: "should always be one",
        Token: "should always be one",
        UserToken: "users currently logged into admin panel",
        Users: "users currently tracked on vincere"
      }
    };
  },
  mounted() {
    this.fetchMonitorData();
    this.fetchLogData();
  },
  methods: {
    async fetchMonitorData() {
      try {
        const cpuResponse = await axios.get('/monitor-cpu');
        const ramResponse = await axios.get('/monitor-ram');
        const storageResponse = await axios.get('/monitor-storage');
        const dbStatsResponse = await axios.get('/monitor-dbs');

        this.monitorData.cpuUsage = cpuResponse.data.cpuUsage;
        this.monitorData.ramUsage = ramResponse.data.ramUsage;
        const usedStorageGB = (parseFloat(storageResponse.data.usedStorageMB) / 1024).toFixed(2);
        const totalStorageGB = (parseFloat(storageResponse.data.totalStorageMB) / 1024).toFixed(2);
        this.monitorData.storageUsage = `${usedStorageGB} GB / ${totalStorageGB} GB`;

        this.monitorData.dbStats = dbStatsResponse.data.reduce((acc, curr) => {
          acc[curr.modelName] = {
            count: curr.count,
            estimatedSizeBytes: curr.estimatedSizeBytes
          };
          return acc;
        }, {});
      } catch (error) {
        console.error('Error fetching monitor data:', error);
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.logContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    async fetchLogData() {
      try {
        const response = await axios.get(`/monitor-logs?page=${this.logPage}&count=${this.logLines}`);
        this.monitorData.logs = response.data.logs.reverse();
        this.scrollToBottom();
      } catch (error) {
        console.error('Error fetching log data:', error);
      }
    },

    changePage(direction) {
      this.logPage += direction;
      this.fetchLogData();
    },
    getFileColor(segment) {
      return 'text-orange-400';
    },
    getStatusColor(segment) {
      const statusCode = parseInt(segment, 10);
      if (!isNaN(statusCode)) {
        if (statusCode >= 200 && statusCode < 300) return 'text-green-400';
        if (statusCode >= 400 && statusCode < 500) return 'text-orange-400';
        if (statusCode >= 500) return 'text-red-400';
        return 'text-yellow-400';
      } else {
        switch (segment) {
          case 'INFO': return 'text-yellow-400';
          default: return 'text-white';
        }
      }
    },
    getMatch(log, index) {
      const matches = log.match(/\[(.*?)\]/g);
      if (matches && matches[index]) {
        return matches[index].replace(/\[|\]/g, '');
      }
      return null;
    },

    getRemainingText(log) {
      const parts = log.split(']');
      if (parts.length > 3) {
        return parts.slice(3).join(']').trim();
      }
      return '';
    },
    async fetchLogData() {
      try {
        const response = await axios.get(`/monitor-logs?page=${this.logPage}&count=${this.logLines}`);
        this.monitorData.logs = response.data.logs.reverse();
        this.logSize = this.formatBytes(response.data.fileSize);
        this.scrollToBottom();
      } catch (error) {
        console.error('Error fetching log data:', error);
      }
    },
    formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return '0 Bytes';

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    getCleanName(modelName) {
      return this.cleanNames[modelName] || modelName;
    },
    getComment(modelName) {
      return this.comments[modelName] || '';
    }
  }
};
</script>