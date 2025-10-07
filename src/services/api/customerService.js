import customersData from "@/services/mockData/customers.json";
import saleService from "@/services/api/saleService";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let customers = [...customersData];

const customerService = {
  async getAll() {
    await delay(300);
    return [...customers].sort((a, b) => 
      new Date(b.registrationDate) - new Date(a.registrationDate)
    );
  },

  async getById(id) {
    await delay(200);
    const customer = customers.find(c => c.Id === parseInt(id));
    if (!customer) throw new Error("Customer not found");
    return { ...customer };
  },

  async create(customer) {
    await delay(400);
    const maxId = customers.reduce((max, c) => Math.max(max, c.Id), 0);
    const customerId = `CUST${String(maxId + 1).padStart(3, "0")}`;
    const newCustomer = {
      ...customer,
      Id: maxId + 1,
      customerId,
registrationDate: new Date().toISOString(),
      totalPurchases: 0,
      lifetimeValue: 0,
      purchaseHistory: [],
      repairHistory: []
    };
    customers.push(newCustomer);
    return { ...newCustomer };
  },

  async update(id, updates) {
    await delay(300);
    const index = customers.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error("Customer not found");
    customers[index] = { ...customers[index], ...updates };
    return { ...customers[index] };
  },

  async delete(id) {
    await delay(300);
    const index = customers.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error("Customer not found");
    const deleted = customers[index];
    customers.splice(index, 1);
    return deleted;
  },

  async searchCustomers(query) {
    await delay(250);
    const searchTerm = query.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm) ||
      c.phone.includes(searchTerm)
    );
  },

  async getRecentCustomers(limit = 5) {
    await delay(200);
    return [...customers]
      .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
      .slice(0, limit);
  },

  async updateLoyaltyPoints(id, points) {
    await delay(250);
    const index = customers.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error("Customer not found");
    customers[index].loyaltyPoints = (customers[index].loyaltyPoints || 0) + points;
    return { ...customers[index] };
  },

  async getCustomerLifetimeValue() {
    await delay(400);
    const allSales = await saleService.getAll();
    
    const clvMap = {};
    
    allSales.forEach(sale => {
      if (!clvMap[sale.customerId]) {
        const customer = customers.find(c => c.customerId === sale.customerId);
        if (customer) {
          clvMap[sale.customerId] = {
            Id: customer.Id,
            customerId: customer.customerId,
            name: customer.name,
            email: customer.email,
            totalSpent: 0,
            purchaseCount: 0,
            firstPurchase: sale.timestamp,
            lastPurchase: sale.timestamp
          };
        }
      }
      
      if (clvMap[sale.customerId]) {
        clvMap[sale.customerId].totalSpent += sale.total;
        clvMap[sale.customerId].purchaseCount += 1;
        
        if (new Date(sale.timestamp) < new Date(clvMap[sale.customerId].firstPurchase)) {
          clvMap[sale.customerId].firstPurchase = sale.timestamp;
        }
        if (new Date(sale.timestamp) > new Date(clvMap[sale.customerId].lastPurchase)) {
          clvMap[sale.customerId].lastPurchase = sale.timestamp;
        }
      }
    });
    
    return Object.values(clvMap)
      .map(clv => ({
        ...clv,
        averageOrderValue: clv.totalSpent / clv.purchaseCount
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }
};

export default customerService;