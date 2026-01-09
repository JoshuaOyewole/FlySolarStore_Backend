const dashboardService = require("../services/dashboardService");
const { StatusCodes } = require("http-status-codes");


const getDashboardAnalytics = async (req, res) => {
  try {
    const todaySales = await dashboardService.getTodaysTotalSales();
    //const totalOrders = await dashboardService.getTotalOrders();
    const totalSoldItems = await dashboardService.getTotalSoldItems();
    //const totalWeeklySales = await dashboardService.getTotalWeeklySales();
    //const totalMonthlySales = await dashboardService.getTotalMonthlySales();
    const totalProducts = await dashboardService.getTotalProducts();
    const totalYearlySales = await dashboardService.getTotalYearlySales();
    const recentPurchases = await dashboardService.getRecentPurchases();
    const salesThisWeek = await dashboardService.getSalesThisWeek();
    const salesThisMonth = await dashboardService.getSalesThisMonth();

    res.status(StatusCodes.OK).json({
      status: true,
      data: {
        todaysTotalSales: todaySales,
        analytics: [salesThisWeek, salesThisMonth],
        totalSoldItems: totalSoldItems,
        totalProducts: totalProducts,
        totalYearlySales: totalYearlySales,
        recentPurchases: recentPurchases,
      },
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

module.exports = getDashboardAnalytics;
