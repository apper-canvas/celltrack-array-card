import salesData from "@/services/mockData/sales.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let sales = [...salesData];

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
      const saleDate = new Date(s.timestamp);
      return saleDate >= startDate && saleDate <= endDate;
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