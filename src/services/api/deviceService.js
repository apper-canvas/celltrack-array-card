import devicesData from "@/services/mockData/devices.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let devices = [...devicesData];

const deviceService = {
  async getAll() {
    await delay(300);
    return [...devices];
  },

  async getById(id) {
    await delay(200);
    const device = devices.find(d => d.Id === parseInt(id));
    if (!device) throw new Error("Device not found");
    return { ...device };
  },

  async getByImei(imei) {
    await delay(200);
    const device = devices.find(d => d.imei === imei);
    if (!device) throw new Error("Device not found");
    return { ...device };
  },

  async create(device) {
    await delay(400);
    const maxId = devices.reduce((max, d) => Math.max(max, d.Id), 0);
    const newDevice = {
      ...device,
      Id: maxId + 1,
      dateAdded: new Date().toISOString()
    };
    devices.push(newDevice);
    return { ...newDevice };
  },

  async update(id, updates) {
    await delay(300);
    const index = devices.findIndex(d => d.Id === parseInt(id));
    if (index === -1) throw new Error("Device not found");
    devices[index] = { ...devices[index], ...updates };
    return { ...devices[index] };
  },

  async updateStock(id, quantity) {
    await delay(200);
    const index = devices.findIndex(d => d.Id === parseInt(id));
    if (index === -1) throw new Error("Device not found");
    devices[index].quantity = quantity;
    return { ...devices[index] };
  },

  async delete(id) {
    await delay(300);
    const index = devices.findIndex(d => d.Id === parseInt(id));
    if (index === -1) throw new Error("Device not found");
    devices.splice(index, 1);
    return true;
  },

  async getLowStock(threshold = 10) {
    await delay(250);
    return devices.filter(d => d.quantity < threshold && d.quantity > 0);
  },

async getOutOfStock() {
    await delay(250);
    return devices.filter(d => d.quantity === 0);
  }
};

export default deviceService;