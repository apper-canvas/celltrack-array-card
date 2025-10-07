import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import customerService from "@/services/api/customerService";
import { format } from "date-fns";
import { toast } from "react-toastify";
const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: ""
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    setFilteredCustomers(customers);
  }, [customers]);

  const loadCustomers = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err) {
      setError(err.message || "Failed to load customers");
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredCustomers(customers);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(lowerQuery) ||
      customer.email.toLowerCase().includes(lowerQuery) ||
      customer.phone.includes(query)
    );
    setFilteredCustomers(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await customerService.create(formData);
      toast.success("Customer added successfully!");
      setShowAddModal(false);
      resetForm();
      loadCustomers();
    } catch (err) {
      toast.error(err.message || "Failed to add customer");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      notes: ""
    });
  };

  if (loading) return <Loading message="Loading customers..." />;
  if (error) return <Error message={error} onRetry={loadCustomers} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-secondary">Customer Management</h1>
          <p className="text-gray-600 mt-1">View and manage customer profiles</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <ApperIcon name="UserPlus" size={18} className="mr-2" />
          Add Customer
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <SearchBar
            placeholder="Search by name, email, or phone..."
            onSearch={handleSearch}
          />
        </div>

        {filteredCustomers.length === 0 ? (
          <Empty
            title="No customers found"
            message="Start by adding your first customer"
            icon="Users"
            actionLabel="Add Customer"
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map(customer => (
<Card 
                key={customer.Id} 
                hoverable 
                className="space-y-3"
                onClick={() => navigate(`/customers/${customer.Id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                      {customer.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary">{customer.name}</h3>
                      <p className="text-small text-gray-600">{customer.customerId}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Phone" size={16} className="text-gray-500" />
                    <p className="text-small text-gray-700">{customer.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Mail" size={16} className="text-gray-500" />
                    <p className="text-small text-gray-700 truncate">{customer.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-small text-gray-600">Purchases</p>
<p className="font-semibold text-secondary">{customer.purchaseHistory?.length ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-small text-gray-600">Repairs</p>
<p className="font-semibold text-secondary">{customer.repairHistory?.length ?? 0}</p>
                  </div>
                  {customer.storeCredit > 0 && (
                    <div>
                      <p className="text-small text-gray-600">Credit</p>
                      <Badge variant="success">${customer.storeCredit}</Badge>
                    </div>
                  )}
                </div>

                {customer.notes && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-small text-gray-600 italic">{customer.notes}</p>
                  </div>
                )}

                <div className="text-small text-gray-500">
                  Registered: {format(new Date(customer.dateRegistered), "MMM dd, yyyy")}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2 font-semibold text-secondary">Add New Customer</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ApperIcon name="X" size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-secondary">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-secondary">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-secondary">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-secondary">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Add Customer
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Customers;