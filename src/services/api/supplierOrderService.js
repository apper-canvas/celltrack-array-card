import supplierOrdersData from '@/services/mockData/supplierOrders.json';
import deviceService from '@/services/api/deviceService';
import saleService from '@/services/api/saleService';
import supplierService from '@/services/api/supplierService';

let supplierOrders = [...supplierOrdersData];
let nextId = Math.max(...supplierOrders.map(o => o.Id), 0) + 1;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const supplierOrderService = {
  async getAll() {
    await delay(300);
    return supplierOrders.map(order => ({
      ...order,
      items: [...order.items]
    }));
  },

  async getById(id) {
    await delay(200);
    const order = supplierOrders.find(o => o.Id === parseInt(id));
    if (!order) {
      throw new Error('Supplier order not found');
    }
    return {
      ...order,
      items: [...order.items]
    };
  },

  async create(orderData) {
    await delay(400);
    const newOrder = {
      Id: nextId++,
      supplierId: orderData.supplierId,
      orderDate: new Date().toISOString(),
      expectedDelivery: orderData.expectedDelivery,
      status: 'Pending',
      items: orderData.items.map(item => ({
        deviceId: item.deviceId,
        quantity: item.quantity,
        unitCost: item.unitCost
      })),
      totalCost: orderData.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0),
      notes: orderData.notes || ''
    };
    supplierOrders.push(newOrder);
    return { ...newOrder };
  },

  async update(id, updates) {
    await delay(400);
    const index = supplierOrders.findIndex(o => o.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Supplier order not found');
    }

    const updatedOrder = {
      ...supplierOrders[index],
      ...updates,
      Id: supplierOrders[index].Id,
      orderDate: supplierOrders[index].orderDate
    };

    if (updates.items) {
      updatedOrder.totalCost = updates.items.reduce(
        (sum, item) => sum + (item.quantity * item.unitCost), 
        0
      );
    }

    supplierOrders[index] = updatedOrder;
    return { ...updatedOrder };
  },

  async delete(id) {
    await delay(300);
    const index = supplierOrders.findIndex(o => o.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Supplier order not found');
    }
    supplierOrders.splice(index, 1);
    return { success: true };
  },

  async getSuggestedItems() {
    await delay(500);
    
    const devices = await deviceService.getAll();
    const currentStock = await deviceService.getCurrentStock();
    const salesVelocity = await saleService.getSalesVelocity();
    
    const suggestions = devices.map(device => {
      const stock = currentStock[device.Id] || 0;
      const velocity = salesVelocity[device.Id] || 0;
      
      const daysOfStock = velocity > 0 ? stock / velocity : 999;
      const suggestedQuantity = Math.max(0, Math.ceil(velocity * 30) - stock);
      
      const priority = velocity > 0 && daysOfStock < 14 ? 'high' : 
                      velocity > 0 && daysOfStock < 30 ? 'medium' : 'low';
      
      return {
        deviceId: device.Id,
        deviceName: device.name,
        brand: device.brand,
        model: device.model,
        currentStock: stock,
        salesVelocity: velocity,
        daysOfStock: Math.round(daysOfStock),
        suggestedQuantity,
        estimatedCost: device.cost,
        priority,
        needsReorder: daysOfStock < 30 && velocity > 0
      };
    });

    return suggestions
      .filter(s => s.needsReorder)
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.daysOfStock - b.daysOfStock;
      });
  }
};

export default supplierOrderService;