import repairTicketsData from "@/services/mockData/repairTickets.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let repairTickets = [...repairTicketsData];

const repairService = {
  async getAll() {
    await delay(300);
    return [...repairTickets].sort((a, b) => 
      new Date(b.dateReceived) - new Date(a.dateReceived)
    );
  },

  async getById(id) {
    await delay(200);
    const ticket = repairTickets.find(t => t.Id === parseInt(id));
    if (!ticket) throw new Error("Repair ticket not found");
    return { ...ticket };
  },

  async create(ticket) {
    await delay(400);
    const maxId = repairTickets.reduce((max, t) => Math.max(max, t.Id), 0);
    const ticketId = `REP${String(maxId + 1).padStart(3, "0")}`;
    const newTicket = {
      ...ticket,
      Id: maxId + 1,
      ticketId,
      status: "Received",
      dateReceived: new Date().toISOString(),
      dateCompleted: null
    };
    repairTickets.push(newTicket);
    return { ...newTicket };
  },

  async update(id, updates) {
    await delay(300);
    const index = repairTickets.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error("Repair ticket not found");
    repairTickets[index] = { ...repairTickets[index], ...updates };
    return { ...repairTickets[index] };
  },

  async updateStatus(id, status) {
    await delay(250);
    const index = repairTickets.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error("Repair ticket not found");
    
    repairTickets[index].status = status;
    if (status === "Completed") {
      repairTickets[index].dateCompleted = new Date().toISOString();
    }
    
    return { ...repairTickets[index] };
  },

  async delete(id) {
    await delay(300);
    const index = repairTickets.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error("Repair ticket not found");
    repairTickets.splice(index, 1);
    return true;
  },

  async getByStatus(status) {
    await delay(250);
    return repairTickets.filter(t => t.status === status);
  },

  async getByCustomer(customerId) {
    await delay(250);
    return repairTickets.filter(t => t.customerId === customerId);
  },

  async getActiveRepairs() {
    await delay(250);
    return repairTickets.filter(t => 
      t.status !== "Completed" && t.status !== "Cancelled"
    );
  }
};

export default repairService;