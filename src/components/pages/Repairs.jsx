import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import customerService from "@/services/api/customerService";
import repairService from "@/services/api/repairService";

const Repairs = () => {
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    deviceImei: "",
    issueDescription: "",
    estimatedCost: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [ticketsData, customersData] = await Promise.all([
        repairService.getAll(),
        customerService.getAll()
      ]);
      setTickets(ticketsData);
      setCustomers(customersData);
    } catch (err) {
      setError(err.message || "Failed to load repair tickets");
      toast.error("Failed to load repair tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const customer = customers.find(c => c.Id === parseInt(formData.customerId));
      const ticketData = {
        customerId: customer.customerId,
        deviceImei: formData.deviceImei,
        issueDescription: formData.issueDescription,
        estimatedCost: parseFloat(formData.estimatedCost),
        diagnosis: "",
        actualCost: null
      };

      await repairService.create(ticketData);
      toast.success("Repair ticket created successfully!");
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to create repair ticket");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await repairService.updateStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: "",
      deviceImei: "",
      issueDescription: "",
      estimatedCost: ""
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      "Received": { variant: "info", icon: "Clock" },
      "Diagnosed": { variant: "warning", icon: "Search" },
      "In Progress": { variant: "warning", icon: "Wrench" },
      "Completed": { variant: "success", icon: "CheckCircle" },
      "Cancelled": { variant: "error", icon: "XCircle" }
    };
    
    const config = statusMap[status] || statusMap["Received"];
    return (
      <Badge variant={config.variant}>
        <ApperIcon name={config.icon} size={14} className="mr-1" />
        {status}
      </Badge>
    );
  };

  if (loading) return <Loading message="Loading repair tickets..." />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-secondary">Repair Management</h1>
          <p className="text-gray-600 mt-1">Track and manage device repairs</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <ApperIcon name="Plus" size={18} className="mr-2" />
          New Repair Ticket
        </Button>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <Empty
            title="No repair tickets"
            message="Start by creating your first repair ticket"
            icon="Wrench"
            actionLabel="Create Ticket"
            onAction={() => setShowCreateModal(true)}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tickets.map(ticket => {
            const customer = customers.find(c => c.customerId === ticket.customerId);
            
            return (
              <Card key={ticket.Id} className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-h3 font-semibold text-secondary">{ticket.ticketId}</h3>
                    <p className="text-small text-gray-600 mt-1">
                      {customer?.name} - {customer?.phone}
                    </p>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <ApperIcon name="Smartphone" size={18} className="text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-small text-gray-600">Device IMEI</p>
                      <p className="font-medium text-secondary">{ticket.deviceImei}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <ApperIcon name="FileText" size={18} className="text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-small text-gray-600">Issue Description</p>
                      <p className="text-secondary">{ticket.issueDescription}</p>
                    </div>
                  </div>

                  {ticket.diagnosis && (
                    <div className="flex items-start gap-2">
                      <ApperIcon name="Stethoscope" size={18} className="text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-small text-gray-600">Diagnosis</p>
                        <p className="text-secondary">{ticket.diagnosis}</p>
                      </div>
                    </div>
)}

                  <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
                    <div>
                      <p className="text-small text-gray-600">Estimated Cost</p>
                      <p className="font-semibold text-secondary">${ticket.estimatedCost}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-small text-gray-600">Date Received</p>
                      <p className="text-secondary">{ticket.dateReceived ? format(new Date(ticket.dateReceived), "MMM dd, yyyy") : "Unknown date"}</p>
                    </div>
                  </div>

{ticket.status !== "Completed" && ticket.status !== "Cancelled" && (
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    {ticket.status === "Received" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateStatus(ticket.Id, "Diagnosed")}
                        className="flex-1"
                      >
                        Mark Diagnosed
                      </Button>
                    )}
                    {ticket.status === "Diagnosed" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateStatus(ticket.Id, "In Progress")}
                        className="flex-1"
                      >
                        Start Repair
                      </Button>
                    )}
                    {ticket.status === "In Progress" && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => updateStatus(ticket.Id, "Completed")}
                        className="flex-1"
                      >
                        <ApperIcon name="CheckCircle" size={16} className="mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2 font-semibold text-secondary">Create Repair Ticket</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ApperIcon name="X" size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-secondary">Customer *</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select customer...</option>
                  {customers.map(customer => (
                    <option key={customer.Id} value={customer.Id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-secondary">Device IMEI *</label>
                <input
                  type="text"
                  value={formData.deviceImei}
                  onChange={(e) => setFormData({ ...formData, deviceImei: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-secondary">Issue Description *</label>
                <textarea
                  value={formData.issueDescription}
                  onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-secondary">Estimated Cost *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="secondary" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Create Ticket
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Repairs;