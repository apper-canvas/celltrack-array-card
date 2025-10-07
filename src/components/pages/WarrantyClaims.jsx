import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import supplierService from "@/services/api/supplierService";
import warrantyClaimService from "@/services/api/warrantyClaimService";
import saleService from "@/services/api/saleService";

const WarrantyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [sales, setSales] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const [formData, setFormData] = useState({
    saleId: '',
    supplierId: '',
    issueDescription: '',
    serialNumber: '',
    claimAmount: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [claimsData, salesData, suppliersData] = await Promise.all([
        warrantyClaimService.getAll(),
        saleService.getAll(),
        supplierService.getAll()
      ]);
      setClaims(claimsData);
      setSales(salesData);
      setSuppliers(suppliersData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load warranty claims');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClaim = async (e) => {
    e.preventDefault();
    
    if (!formData.saleId) {
      toast.error('Please select a sale');
      return;
    }
    
    if (!formData.supplierId) {
      toast.error('Please select a supplier');
      return;
    }
    
    if (!formData.issueDescription.trim()) {
      toast.error('Please describe the issue');
      return;
    }

    if (!formData.claimAmount || parseFloat(formData.claimAmount) <= 0) {
      toast.error('Please enter a valid claim amount');
      return;
    }

    try {
      await warrantyClaimService.create(formData);
      toast.success('Warranty claim filed successfully');
      setShowForm(false);
      resetForm();
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to file claim');
    }
  };

  const handleUpdateStatus = async (id, newStatus, supplierResponse = '', resolutionNotes = '') => {
    try {
      const updates = { status: newStatus };
      if (supplierResponse) updates.supplierResponse = supplierResponse;
      if (resolutionNotes) updates.resolutionNotes = resolutionNotes;
      
      await warrantyClaimService.update(id, updates);
      toast.success(`Claim status updated to ${newStatus}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update claim status');
    }
  };

  const handleDeleteClaim = async (id) => {
    if (!confirm('Are you sure you want to delete this warranty claim?')) {
      return;
    }

    try {
      await warrantyClaimService.delete(id);
      toast.success('Warranty claim deleted successfully');
      loadData();
    } catch (err) {
      toast.error('Failed to delete claim');
    }
  };

  const resetForm = () => {
    setFormData({
      saleId: '',
      supplierId: '',
      issueDescription: '',
      serialNumber: '',
      claimAmount: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSaleDetails = (saleId) => {
    return sales.find(s => s.Id === saleId);
  };

  const getSupplierDetails = (supplierId) => {
    return suppliers.find(s => s.Id === supplierId);
  };

  const filteredClaims = statusFilter === 'All' 
    ? claims 
    : claims.filter(c => c.status === statusFilter);

  if (loading) {
    return <Loading message="Loading warranty claims..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-h1 font-bold text-secondary">Warranty Claims</h1>
          <p className="text-gray-600 mt-1">File and track warranty claims with suppliers</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <ApperIcon name={showForm ? "X" : "Plus"} size={18} />
          {showForm ? 'Cancel' : 'File Claim'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreateClaim} className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-h3 font-semibold text-secondary">File New Warranty Claim</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">
                  Original Sale <span className="text-error">*</span>
                </label>
                <select
                  value={formData.saleId}
                  onChange={(e) => setFormData(prev => ({ ...prev, saleId: e.target.value }))}
                  className="w-full px-3 py-2 border rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
required
                >
                  <option value="">Select Sale</option>
                  {sales.map(sale => (
                    <option key={sale.Id} value={sale.Id}>
                      {sale.saleId} - {sale.timestamp ? format(new Date(sale.timestamp), 'MMM dd, yyyy') : 'Unknown date'} - ${sale.total.toFixed(2)}
                    </option>
                  ))}
                </select>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">
                  Supplier <span className="text-error">*</span>
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                  className="w-full px-3 py-2 border rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.Id} value={supplier.Id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <FormField
                label="Serial Number"
                value={formData.serialNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                placeholder="Device serial number or IMEI"
              />

              <FormField
                label="Claim Amount"
                type="number"
                step="0.01"
                required
                value={formData.claimAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, claimAmount: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <FormField
              label="Issue Description"
              value={formData.issueDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, issueDescription: e.target.value }))}
              placeholder="Describe the warranty issue in detail..."
              required
              rows={4}
            />

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="secondary" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                File Claim
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm font-medium text-secondary">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Claims</option>
            <option value="Pending">Pending</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Closed">Closed</option>
          </select>
          <span className="text-sm text-gray-600">
            Showing {filteredClaims.length} of {claims.length} claims
          </span>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredClaims.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <ApperIcon name="Shield" size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-secondary mb-2">No Claims Found</h3>
              <p className="text-gray-600">
                {statusFilter === 'All' 
                  ? 'File your first warranty claim to get started' 
                  : `No claims with status "${statusFilter}"`}
              </p>
            </div>
          </Card>
        ) : (
          filteredClaims.map(claim => {
            const sale = getSaleDetails(claim.saleId);
            const supplier = getSupplierDetails(claim.supplierId);
            return (
              <Card key={claim.Id} hoverable>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-h3 font-semibold text-secondary">
                          Claim #{claim.Id}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-small font-medium ${getStatusColor(claim.status)}`}>
                          {claim.status}
                        </span>
</div>
                      <div className="text-small text-gray-600 space-y-1">
                        <div>
                          Filed: {claim.claimDate ? format(new Date(claim.claimDate), 'MMM dd, yyyy h:mm a') : 'Unknown'}
                        </div>
                        <div className="flex items-center gap-2">
                          <ApperIcon name="ShoppingCart" size={14} />
                          Sale: {sale?.saleId || 'Unknown'}
                        </div>
                        <div className="flex items-center gap-2">
                          <ApperIcon name="Building2" size={14} />
                          Supplier: {supplier?.name || 'Unknown'}
                        </div>
                        {claim.serialNumber && (
                          <div className="flex items-center gap-2">
                            <ApperIcon name="Hash" size={14} />
                            Serial: {claim.serialNumber}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-h3 font-bold text-secondary">
                        ${claim.claimAmount.toFixed(2)}
                      </div>
                      <div className="text-small text-gray-600">Claim Amount</div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="text-sm font-semibold text-secondary mb-2">Issue Description</h4>
                    <p className="text-small text-gray-700">{claim.issueDescription}</p>
                  </div>

                  {claim.supplierResponse && (
                    <div className="border-t pt-3">
                      <h4 className="text-sm font-semibold text-secondary mb-2">Supplier Response</h4>
                      <p className="text-small text-gray-700">{claim.supplierResponse}</p>
                    </div>
                  )}

{claim.resolutionNotes && (
                    <div className="border-t pt-3">
                      <h4 className="text-sm font-semibold text-secondary mb-2">Resolution Notes</h4>
                      <p className="text-small text-gray-700">{claim.resolutionNotes}</p>
                      {claim.resolutionDate && (
                        <p className="text-small text-gray-600 mt-1">
                          Resolved: {claim.resolutionDate ? format(new Date(claim.resolutionDate), 'MMM dd, yyyy h:mm a') : 'Pending'}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 justify-end border-t pt-3">
                    {claim.status === 'Pending' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateStatus(claim.Id, 'Submitted')}
                      >
                        Submit to Supplier
                      </Button>
                    )}
                    {claim.status === 'Submitted' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => {
                            const response = prompt('Enter supplier response:');
                            if (response) {
                              handleUpdateStatus(claim.Id, 'Approved', response);
                            }
                          }}
                        >
                          Mark Approved
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            const response = prompt('Enter rejection reason:');
                            if (response) {
                              handleUpdateStatus(claim.Id, 'Rejected', response);
                            }
                          }}
                        >
                          Mark Rejected
                        </Button>
                      </>
                    )}
                    {(claim.status === 'Approved' || claim.status === 'Rejected') && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const notes = prompt('Enter resolution notes:');
                          if (notes) {
                            handleUpdateStatus(claim.Id, 'Closed', '', notes);
                          }
                        }}
                      >
                        Close Claim
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteClaim(claim.Id)}
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WarrantyClaims;