import suppliersData from "@/services/mockData/suppliers.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let suppliers = [...suppliersData];

const supplierService = {
  async getAll() {
    await delay(300);
    return [...suppliers].sort((a, b) => a.name.localeCompare(b.name));
  },

  async getById(id) {
    await delay(200);
    const supplier = suppliers.find(s => s.Id === parseInt(id));
    if (!supplier) throw new Error("Supplier not found");
    return { ...supplier };
  },

  async getBySupplierId(supplierId) {
    await delay(200);
    const supplier = suppliers.find(s => s.supplierId === supplierId);
    if (!supplier) throw new Error("Supplier not found");
    return { ...supplier };
  },

  async create(supplier) {
    await delay(400);
    const maxId = suppliers.reduce((max, s) => Math.max(max, s.Id), 0);
    const supplierId = `SUP${String(maxId + 1).padStart(3, "0")}`;
    const newSupplier = {
      ...supplier,
      Id: maxId + 1,
      supplierId
    };
    suppliers.push(newSupplier);
    return { ...newSupplier };
  },

  async update(id, updates) {
    await delay(300);
    const index = suppliers.findIndex(s => s.Id === parseInt(id));
    if (index === -1) throw new Error("Supplier not found");
    suppliers[index] = { ...suppliers[index], ...updates };
    return { ...suppliers[index] };
},

  async getActiveSuppliers() {
    await delay(200);
    return suppliers.filter(s => s.status === 'Active').map(supplier => ({ ...supplier }));
  }
};
export default supplierService;