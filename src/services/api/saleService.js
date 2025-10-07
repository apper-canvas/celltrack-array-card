import salesData from "@/services/mockData/sales.json";
import React from "react";
import Error from "@/components/ui/Error";

let sales = [...salesData];
let nextId = Math.max(...sales.map(s => s.Id), 0) + 1;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const calculateSalesVelocity = () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentSales = sales.filter(sale => 
    new Date(sale.saleDate) >= thirtyDaysAgo
  );
  
  const velocityMap = {};
  recentSales.forEach(sale => {
    sale.items.forEach(item => {
      velocityMap[item.deviceId] = (velocityMap[item.deviceId] || 0) + item.quantity;
    });
  });
  
  Object.keys(velocityMap).forEach(deviceId => {
    velocityMap[deviceId] = velocityMap[deviceId] / 30;
  });
  
  return velocityMap;
};
const saleService = {
  async getAll() {
    await delay(300);
    return [...sales].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  },

  async getById(id) {
    await delay(200);
    const sale = sales.find(s => s.Id === parseInt(id));
    if (!sale) throw new Error("Sale not found");
    return { ...sale };
  },

  async create(sale) {
    await delay(400);
    const maxId = sales.reduce((max, s) => Math.max(max, s.Id), 0);
    const saleId = `SALE${String(maxId + 1).padStart(3, "0")}`;
    const newSale = {
      ...sale,
      Id: maxId + 1,
      saleId,
      timestamp: new Date().toISOString()
    };
    sales.push(newSale);
    return { ...newSale };
  },

  async getRecentSales(limit = 10) {
    await delay(250);
    return [...sales]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  },

  async getSalesByCustomer(customerId) {
    await delay(250);
    return sales.filter(s => s.customerId === customerId);
  },

  async getTotalRevenue() {
    await delay(200);
    return sales.reduce((total, s) => total + s.total, 0);
  },

  async getSalesAnalytics(startDate, endDate) {
    await delay(300);
    const filtered = sales.filter(s => {
      const saleDate = new Date(s.saleDate || s.timestamp);
      return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
    });
    
    return {
      totalSales: filtered.length,
      totalRevenue: filtered.reduce((sum, s) => sum + s.total, 0),
      averageTransaction: filtered.length > 0 
        ? filtered.reduce((sum, s) => sum + s.total, 0) / filtered.length 
        : 0,
      topProducts: this._getTopProducts(filtered)
    };
  },

  async getSalesVelocity() {
    await delay(200);
    return calculateSalesVelocity();
  },

  async getSeasonalPatterns() {
    await delay(350);
    const monthlyData = {};
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.timestamp);
      const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: saleDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
          revenue: 0,
          count: 0
        };
      }
      
      monthlyData[monthKey].revenue += sale.total;
      monthlyData[monthKey].count += 1;
    });
    
    const monthlyRevenue = Object.values(monthlyData).sort((a, b) => 
      new Date(a.month) - new Date(b.month)
    );
    
    const seasonalTotals = {
      Winter: 0,
      Spring: 0,
      Summer: 0,
      Fall: 0
    };
    
    sales.forEach(sale => {
      const month = new Date(sale.timestamp).getMonth();
      if (month === 11 || month <= 1) seasonalTotals.Winter += sale.total;
      else if (month >= 2 && month <= 4) seasonalTotals.Spring += sale.total;
      else if (month >= 5 && month <= 7) seasonalTotals.Summer += sale.total;
      else seasonalTotals.Fall += sale.total;
    });
    
    const peakMonth = monthlyRevenue.reduce((max, curr) => 
      curr.revenue > max.revenue ? curr : max
    , { revenue: 0, month: 'N/A' }).month;
    
    const peakSeason = Object.entries(seasonalTotals).reduce((max, [season, revenue]) => 
      revenue > max.revenue ? { season, revenue } : max
    , { season: 'N/A', revenue: 0 }).season;
    
    return {
      monthlyRevenue,
      seasonalTotals,
      peakMonth,
      peakSeason
    };
  },

  _getTopProducts(salesList) {
    const productCounts = {};
    salesList.forEach(sale => {
      sale.items.forEach(item => {
        if (!productCounts[item.name]) {
          productCounts[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productCounts[item.name].quantity += item.quantity;
        productCounts[item.name].revenue += item.price * item.quantity;
      });
    });
    
    return Object.values(productCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }
};

export default saleService;