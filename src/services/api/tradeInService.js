import tradeInsData from "@/services/mockData/tradeIns.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let tradeIns = [...tradeInsData];

const tradeInService = {
  async getAll() {
    await delay(300);
    return [...tradeIns].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  },

  async getById(id) {
    await delay(200);
    const tradeIn = tradeIns.find(t => t.Id === parseInt(id));
    if (!tradeIn) throw new Error("Trade-in not found");
    return { ...tradeIn };
  },

  async create(tradeIn) {
    await delay(400);
    const maxId = tradeIns.reduce((max, t) => Math.max(max, t.Id), 0);
    const tradeInId = `TRADE${String(maxId + 1).padStart(3, "0")}`;
    const newTradeIn = {
      ...tradeIn,
      Id: maxId + 1,
      tradeInId,
      timestamp: new Date().toISOString()
    };
    tradeIns.push(newTradeIn);
    return { ...newTradeIn };
  },

  async update(id, updates) {
    await delay(300);
    const index = tradeIns.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error("Trade-in not found");
    tradeIns[index] = { ...tradeIns[index], ...updates };
    return { ...tradeIns[index] };
  },

  async getByCustomer(customerId) {
    await delay(250);
    return tradeIns.filter(t => t.customerId === customerId);
  },

  async evaluateDevice(brand, model, condition) {
    await delay(300);
    const baseValues = {
      "Excellent": 1.0,
      "Good": 0.75,
      "Fair": 0.50,
      "Poor": 0.25
    };
    
    const modelPrices = {
      "iPhone 14 Pro": 600,
      "iPhone 13": 500,
      "iPhone 12 Pro": 450,
      "Galaxy S23 Ultra": 550,
      "Galaxy S21": 300,
      "Pixel 8 Pro": 400,
      "Pixel 6": 350
    };
    
    const basePrice = modelPrices[model] || 200;
    const conditionMultiplier = baseValues[condition] || 0.5;
    
    return Math.round(basePrice * conditionMultiplier);
  },

  async getTradeInTrends(startDate, endDate) {
    await delay(350);
    const filtered = tradeIns.filter(t => {
      const tradeDate = new Date(t.timestamp);
      return tradeDate >= new Date(startDate) && tradeDate <= new Date(endDate);
    });

    const daysDiff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const intervalDays = Math.max(1, Math.floor(daysDiff / 15));
    
    const timeline = [];
    for (let i = 0; i < daysDiff; i += intervalDays) {
      const intervalStart = new Date(startDate);
      intervalStart.setDate(intervalStart.getDate() + i);
      const intervalEnd = new Date(intervalStart);
      intervalEnd.setDate(intervalEnd.getDate() + intervalDays);
      
      const intervalData = filtered.filter(t => {
        const td = new Date(t.timestamp);
        return td >= intervalStart && td < intervalEnd;
      });
      
      const accepted = intervalData.filter(t => t.accepted).length;
      const total = intervalData.length;
      
      timeline.push({
        date: intervalStart.toISOString(),
        count: total,
        averageOffer: total > 0 
          ? intervalData.reduce((sum, t) => sum + t.offerAmount, 0) / total 
          : 0,
        acceptanceRate: total > 0 ? (accepted / total) * 100 : 0,
        totalValue: intervalData.reduce((sum, t) => sum + (t.accepted ? t.offerAmount : 0), 0)
      });
    }
    
    return { timeline };
  }
};

export default tradeInService;