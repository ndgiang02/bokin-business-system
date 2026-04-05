import { create } from 'zustand';
import {
  getStats,
  getChartData,
  getRecentRequests,
  getActivities,
  getUserTasks,
} from '../api/dashboardApi.js';

export const useDashboardStore = create((set, get) => ({
  stats:          null,
  chart:          [],
  recentRequests: [],
  activities:     [],
  userTasks:       [],

  loading: {
    stats:          false,
    chart:          false,
    recentRequests: false,
    activities:     false,
    userTask: false,
  },

  error: null,

  fetchStats: async () => {
    set(s => ({ loading: { ...s.loading, stats: true }, error: null }));
    try {
      const data = await getStats();
      set(s => ({ stats: data.data ?? data, loading: { ...s.loading, stats: false } }));
    } catch (err) {
      set(s => ({ error: err.message, loading: { ...s.loading, stats: false } }));
    }
  },

  fetchChart: async (months = 6) => {
    set(s => ({ loading: { ...s.loading, chart: true }, error: null }));
    try {
      const data = await getChartData(months);
      set(s => ({ chart: data.data ?? data, loading: { ...s.loading, chart: false } }));
    } catch (err) {
      set(s => ({ error: err.message, loading: { ...s.loading, chart: false } }));
    }
  },

  fetchRecentRequests: async (limit = 5) => {
    set(s => ({ loading: { ...s.loading, recentRequests: true }, error: null }));
    try {
      const data = await getRecentRequests(limit);
      set(s => ({ recentRequests: data.data ?? data, loading: { ...s.loading, recentRequests: false } }));
    } catch (err) {
      set(s => ({ error: err.message, loading: { ...s.loading, recentRequests: false } }));
    }
  },

  fetchActivities: async (limit = 10) => {
    set(s => ({ loading: { ...s.loading, activities: true }, error: null }));
    try {
      const data = await getActivities(limit);
      set(s => ({ activities: data.data ?? data, loading: { ...s.loading, activities: false } }));
    } catch (err) {
      set(s => ({ error: err.message, loading: { ...s.loading, activities: false } }));
    }
  },

  fetchUserTask: async ( fromDate, toDate) => {
    set(s => ({ loading: { ...s.loading, userTask: true }, error: null }));
    try {
      const data = await getUserTasks(fromDate, toDate);
      set(s => ({ userTasks: data.data ?? data, loading: { ...s.loading, userTask: false } }));
    } catch (err) {
      set(s => ({ error: err.message, loading: { ...s.loading, userTask: false } }));
    }
  },


  // Fetch tất cả cùng lúc
  fetchAll: async (fromDate, toDate) => {
    set({
      loading: { stats: true, chart: true, activities: true, userTask:false },
      error: null,
    });

    const results = await Promise.allSettled([
      getStats(),
      getChartData(),
      //getRecentRequests(),
      getActivities(),
      getUserTasks(fromDate, toDate)
    ]);

    const [statsRes, chartRes, activitiesRes, userTaskRes] = results;

    console.log(userTaskRes);

    set({
      stats:          statsRes.status          === 'fulfilled' ? (statsRes.value.data          ?? statsRes.value)          : null,
      chart:          chartRes.status          === 'fulfilled' ? (chartRes.value.data          ?? chartRes.value)          : [],
      //recentRequests: recentRes.status         === 'fulfilled' ? (recentRes.value.data         ?? recentRes.value)         : [],
      activities:     activitiesRes.status     === 'fulfilled' ? (activitiesRes.value.data     ?? activitiesRes.value)     : [],
      userTasks:      userTaskRes.status     === 'fulfilled' ? (userTaskRes.value.data     ?? userTaskRes.value)     : [],
      loading: { stats: false, chart: false, activities: false, userTask: false },
      error: results.some(r => r.status === 'rejected')
        ? results.find(r => r.status === 'rejected')?.reason?.message
        : null,
    });
  },

  reset: () => set({
    stats: null, chart: [], recentRequests: [], activities: [],
    loading: { stats: false, chart: false, recentRequests: false, activities: false },
    error: null,
  }),
}));