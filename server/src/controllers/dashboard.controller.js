import * as dashboardService from "../services/dashboard.service.js";
import * as response from "../utils/response.js";



export async function getStatsDashBoard(req, res, next) {
  try {
    const data = await dashboardService.getStatsDashBoard();

    return response.success(res, data, "Thành công", 200);
  } catch (err) { next(err); }
}

export async function getChartDashBoard(req, res, next) {
  try {
    const months = parseInt(req.query.months) || 6;
    const data   = await dashboardService.getChartDashBoard(months);
    
    return response.success(res, data, "Thành công", 200);

  } catch (err) { next(err); }
}

export async function getActiveDashBoard(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data  = await dashboardService.getActiveDashBoard(limit);

    return response.success(res, data, "Thành công", 200);
  } catch (err) { next(err); }
}

export async function getRecentDashBoard(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const data  = await dashboardService.getRecentDashBoard(limit);

    return response.success(res, data, "Thành công", 200);
  } catch (err) { next(err); }
}

export async function getUserTaskDashBoard(req, res, next) {
  try {
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;

    const data  = await dashboardService.getUserTaskDashBoard(fromDate, toDate);

    return response.success(res, data, "Thành công", 200);
  } catch (err) { next(err); }
}





