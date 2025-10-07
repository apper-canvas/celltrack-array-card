import customersData from "@/services/mockData/customers.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let customers = [...customersData];

const customerService = {
  async getAll() {
    await delay(300);
    return [...customers].sort((a, b) => a.name.localeCompare(b.name));
  },

  async getById(id) {
    await delay(200);
    const customer = customers.find(c => c.Id === parseInt(id));
    if (!customer) throw new Error("Customer not found");
    return { ...customer };
  },

  async getByCustomerId(customerId) {
    await delay(200);
    const customer = customers.find(c => c.customerId === customerId);
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
      purchaseHistory: [],
      repairHistory: [],
      storeCredit: 0,
      dateRegistered: new Date().toISOString()
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
    customers.splice(index, 1);
    return true;
  },

  async search(query) {
    await delay(250);
    const lowerQuery = query.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.email.toLowerCase().includes(lowerQuery) ||
      c.phone.includes(query)
    );
  },

  async addStoreCredit(id, amount) {
    await delay(200);
    const index = customers.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error("Customer not found");
    customers[index].storeCredit += amount;
    return { ...customers[index] };
  }
};

export default customerService;