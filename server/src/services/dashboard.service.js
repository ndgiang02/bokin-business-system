const dashBoardModel = require("../models/dashboard.model");

exports.getStatsDashBoard = async () => {
  return res = await dashBoardModel.getStatsDashBoard();
};

exports.getChartDashBoard = async (moths) => {
  return await dashBoardModel.getChartDashBoard(moths);
};

exports.getActiveDashBoard = async (limit) => {

  return await dashBoardModel.getActiveDashBoard(limit);

};
exports.getRecentDashBoard = async (limit) => {

  return await dashBoardModel.getRecentDashBoard(limit);

};

exports.getUserTaskDashBoard = async (from, to) => {

  const fromDate =  parseDate(from);
  const toDate = parseDate(to);
  return await dashBoardModel.getUserTaskDashBoard(fromDate, toDate);

};


function parseDate(val) {
  if (!val) return null;
  const s   = String(val);                      
  const y   = parseInt(s.slice(0, 4));
  const m   = parseInt(s.slice(4, 6)) - 1;        
  const d   = parseInt(s.slice(6, 8));
  const dt  = new Date(y, m, d);
  return isNaN(dt.getTime()) ? null : dt;
}