import axiosClient from './axiosClient.js';

export const getStats = () =>
  axiosClient.get('/dashboards/stats').then(res => res.data);

export const getChartData = (months = 6) =>
  axiosClient.get('/dashboards/chart', { params: { months } }).then(res => res.data);

export const getRecentRequests = (limit = 5) =>
  axiosClient.get('/dashboards/recent-requests', { params: { limit } }).then(res => res.data);

export const getActivities = (limit = 10) =>
  axiosClient.get('/dashboards/activities', { params: { limit } }).then(res => res.data);

export const getUserTasks = (fromDate, toDate) =>
  axiosClient.get('/dashboards/user-tasks', { params: { fromDate, toDate } }).then(res => res.data);

export const getDashboardData = () =>
  Promise.all([
    getStats(),
    getChartData(),
    getRecentRequests(),
    getActivities(),
    getUserTasks()
  ]).then(([stats, chart, recentRequests, activities, userTasks]) => ({
    stats,
    chart,
    recentRequests,
    activities,
    userTasks
  }));