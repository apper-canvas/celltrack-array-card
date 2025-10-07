import warrantyClaimsData from '@/services/mockData/warrantyClaims.json';
import saleService from '@/services/api/saleService';
import supplierService from '@/services/api/supplierService';

let warrantyClaims = [...warrantyClaimsData];
let nextId = Math.max(...warrantyClaims.map(c => c.Id), 0) + 1;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const warrantyClaimService = {
  async getAll() {
    await delay(300);
    return warrantyClaims.map(claim => ({
      ...claim
    })).sort((a, b) => new Date(b.claimDate) - new Date(a.claimDate));
  },

  async getById(id) {
    await delay(200);
    const claim = warrantyClaims.find(c => c.Id === parseInt(id));
    if (!claim) {
      throw new Error('Warranty claim not found');
    }
    return { ...claim };
  },

  async getBySaleId(saleId) {
    await delay(250);
    return warrantyClaims
      .filter(c => c.saleId === parseInt(saleId))
      .map(claim => ({ ...claim }));
  },

  async create(claimData) {
    await delay(400);
    
    // Validate sale exists
    try {
      await saleService.getById(claimData.saleId);
    } catch (err) {
      throw new Error('Invalid sale ID - sale not found');
    }

    // Validate supplier exists
    const suppliers = await supplierService.getAll();
    const supplier = suppliers.find(s => s.Id === parseInt(claimData.supplierId));
    if (!supplier) {
      throw new Error('Invalid supplier ID - supplier not found');
    }

    const newClaim = {
      Id: nextId++,
      saleId: parseInt(claimData.saleId),
      supplierId: parseInt(claimData.supplierId),
      claimDate: new Date().toISOString(),
      issueDescription: claimData.issueDescription,
      serialNumber: claimData.serialNumber || '',
      status: 'Pending',
      claimAmount: parseFloat(claimData.claimAmount) || 0,
      supplierResponse: '',
      resolutionDate: null,
      resolutionNotes: ''
    };

    warrantyClaims.push(newClaim);
    return { ...newClaim };
  },

  async update(id, updates) {
    await delay(400);
    const index = warrantyClaims.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Warranty claim not found');
    }

    const updatedClaim = {
      ...warrantyClaims[index],
      ...updates,
      Id: warrantyClaims[index].Id,
      claimDate: warrantyClaims[index].claimDate,
      saleId: warrantyClaims[index].saleId
    };

    // Auto-set resolution date when status changes to Approved/Rejected/Closed
    if (updates.status && ['Approved', 'Rejected', 'Closed'].includes(updates.status)) {
      if (!updatedClaim.resolutionDate) {
        updatedClaim.resolutionDate = new Date().toISOString();
      }
    }

    warrantyClaims[index] = updatedClaim;
    return { ...updatedClaim };
  },

  async delete(id) {
    await delay(300);
    const index = warrantyClaims.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Warranty claim not found');
    }
    warrantyClaims.splice(index, 1);
    return { success: true };
  },

  async getClaimsByStatus(status) {
    await delay(250);
    if (!status || status === 'All') {
      return this.getAll();
    }
    return warrantyClaims
      .filter(c => c.status === status)
      .map(claim => ({ ...claim }))
      .sort((a, b) => new Date(b.claimDate) - new Date(a.claimDate));
  },

  async getClaimStatistics() {
    await delay(200);
    const stats = {
      total: warrantyClaims.length,
      pending: warrantyClaims.filter(c => c.status === 'Pending').length,
      submitted: warrantyClaims.filter(c => c.status === 'Submitted').length,
      approved: warrantyClaims.filter(c => c.status === 'Approved').length,
      rejected: warrantyClaims.filter(c => c.status === 'Rejected').length,
      closed: warrantyClaims.filter(c => c.status === 'Closed').length,
      totalClaimAmount: warrantyClaims.reduce((sum, c) => sum + c.claimAmount, 0),
      approvedAmount: warrantyClaims
        .filter(c => c.status === 'Approved')
        .reduce((sum, c) => sum + c.claimAmount, 0)
    };
    return stats;
  }
};

export default warrantyClaimService;