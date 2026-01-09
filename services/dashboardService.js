const orders = require("../models/Order");
const products = require("../models/Product");

const dashboardService = {
  async getTodaysTotalSales() {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const result = await orders.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" },
          },
        },
      ]);

      const totalSales = result.length > 0 ? result[0].totalSales : 0;
      return totalSales;
    } catch (error) {
      throw new Error("Error fetching today's total sales: " + error.message);
    }
  },
  async getTotalOrders() {
    try {
      const totalOrders = await orders.countDocuments();
      return totalOrders;
    } catch (error) {
      throw new Error("Error fetching total orders: " + error.message);
    }
  },
  async getTotalSoldItems() {
    try {
      const result = await orders.aggregate([
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: null,
            totalSoldItems: { $sum: "$items.quantity" },
          },
        },
      ]);
      const totalSoldItems = result.length > 0 ? result[0].totalSoldItems : 0;
      return totalSoldItems;
    } catch (error) {
      throw new Error("Error fetching total sold items: " + error.message);
    }
  },
  async getTotalWeeklySales() {
    try {
      const startOfWeek = new Date();
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      const result = await orders.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfWeek,
              $lte: endOfWeek,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" },
          },
        },
      ]);
      const totalWeeklySales = result.length > 0 ? result[0].totalSales : 0;

      //calculate for the previous week also
      const startOfPreviousWeek = new Date(startOfWeek);
      startOfPreviousWeek.setDate(startOfWeek.getDate() - 7);
      const endOfPreviousWeek = new Date(endOfWeek);
      endOfPreviousWeek.setDate(endOfWeek.getDate() - 7);
      endOfPreviousWeek.setHours(23, 59, 59, 999);
      const previousWeekResult = await orders.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfPreviousWeek,
              $lte: endOfPreviousWeek,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" },
          },
        },
      ]);
      const totalPreviousWeekSales =
        previousWeekResult.length > 0 ? previousWeekResult[0].totalSales : 0;

      const percentageDifference =
        totalPreviousWeekSales === 0
          ? 0
          : ((totalWeeklySales - totalPreviousWeekSales) /
              totalPreviousWeekSales) *
            100;

      return { totalWeeklySales, totalPreviousWeekSales, percentageDifference };
    } catch (error) {
      throw new Error("Error fetching total weekly sales: " + error.message);
    }
  },
  async getTotalMonthlySales() {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(startOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);
      const result = await orders.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" },
          },
        },
      ]);
      const totalMonthlySales = result.length > 0 ? result[0].totalSales : 0;
      return totalMonthlySales;
    } catch (error) {
      throw new Error("Error fetching total monthly sales: " + error.message);
    }
  },
  async getTotalProducts() {
    try {
      const totalProducts = await products.countDocuments();
      return totalProducts;
    } catch (error) {
      throw new Error("Error fetching total products: " + error.message);
    }
  },
  async getTotalYearlySales() {
    //Implement monthly sales for graph analytics
    try {
      const yearlySales = [];
      const currentYear = new Date().getFullYear();
      for (let month = 0; month < 12; month++) {
        const startOfMonth = new Date(currentYear, month, 1);
        const endOfMonth = new Date(currentYear, month + 1, 0, 23, 59, 59, 999);

        const result = await orders.aggregate([
          {
            $match: {
              createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalSales: { $sum: "$total" },
              totalOrders: { $sum: 1 },
              soldItems: { $sum: { $sum: "$items.quantity" } },
            },
          },
        ]);

        const monthSales =
          result.length > 0
            ? result[0]
            : { totalSales: 0, totalOrders: 0, soldItems: 0 };
        yearlySales.push({
          month: month + 1,
          totalSales: monthSales.totalSales,
          totalOrders: monthSales.totalOrders,
          soldItems: monthSales.soldItems,
        });
      }
      return yearlySales;
    } catch (error) {
      throw new Error("Error fetching total yearly sales: " + error.message);
    }
  },
  async getRecentPurchases() {
    //get the last 10 purchases
    try {
      const recentPurchases = await orders
        .find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("_id items total createdAt paymentStatus")
        .lean();

      return recentPurchases.map((order) => ({
        orderId: order._id,
        productNames: order.items
          .map((item) => item.productSnapshot.title)
          .join(", "),
        paymentStatus: order.paymentStatus,
        amount: order.total,
        purchaseDate: order.createdAt,
      }));
    } catch (error) {
      throw new Error("Error fetching recent purchases: " + error.message);
    }
  },

  async getSalesThisWeek() {
    try {
      const startOfWeek = new Date();
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      const result = await orders.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfWeek,
              $lte: endOfWeek,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" },
          },
        },
      ]);
      //calculate the percentage difference from last week
      const totalWeeklySales = result.length > 0 ? result[0].totalSales : 0;

      const startOfPreviousWeek = new Date(startOfWeek);
      startOfPreviousWeek.setDate(startOfWeek.getDate() - 7);
      const endOfPreviousWeek = new Date(endOfWeek);
      endOfPreviousWeek.setDate(endOfWeek.getDate() - 7);
      endOfPreviousWeek.setHours(23, 59, 59, 999);
      const previousWeekResult = await orders.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfPreviousWeek,
              $lte: endOfPreviousWeek,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" },
          },
        },
      ]);
      const totalPreviousWeekSales =
        previousWeekResult.length > 0 ? previousWeekResult[0].totalSales : 0;
      const percentageDifference =
        totalPreviousWeekSales === 0
          ? 0
          : ((totalWeeklySales - totalPreviousWeekSales) /
              totalPreviousWeekSales) *
            100;

      const salesThisWeek = result.length > 0 ? result[0].totalSales : 0;
      return {
        title: "Sales This Week",
        current: salesThisWeek,
        previous: totalPreviousWeekSales,
        percentageDifference,
        status: totalWeeklySales >= totalPreviousWeekSales ? "up" : "down",
      };
    } catch (error) {
      throw new Error("Error fetching sales this week: " + error.message);
    }
  },
  async getSalesThisMonth() {
    try {
      //get sales for the current month and the difference between last month
      let startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(startOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      const result = await orders.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" },
          },
        },
      ]);

      const totalMonthlySales = result.length > 0 ? result[0].totalSales : 0;
      const startOfPreviousMonth = new Date(startOfMonth);
      startOfPreviousMonth.setMonth(startOfMonth.getMonth() - 1);
      const endOfPreviousMonth = new Date(endOfMonth);
      endOfPreviousMonth.setMonth(endOfMonth.getMonth() - 1);
      endOfPreviousMonth.setHours(23, 59, 59, 999);
      const previousMonthResult = await orders.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfPreviousMonth,
              $lte: endOfPreviousMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" },
          },
        },
      ]);
      const totalPreviousMonthSales =
        previousMonthResult.length > 0 ? previousMonthResult[0].totalSales : 0;
      const percentageDifference =
        totalPreviousMonthSales === 0
          ? 0
          : ((totalMonthlySales - totalPreviousMonthSales) /
              totalPreviousMonthSales) *
            100;
      return {
        title: "Sales This Month",
        current: totalMonthlySales,
        percentageDifference,
        previous: totalPreviousMonthSales,
        status: totalMonthlySales >= totalPreviousMonthSales ? "up" : "down",
      };
    } catch (error) {
      throw new Error("Error fetching sales this week: " + error.message);
    }
  },
};

module.exports = dashboardService;
