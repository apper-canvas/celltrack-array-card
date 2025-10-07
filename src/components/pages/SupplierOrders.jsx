import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import supplierOrderService from "@/services/api/supplierOrderService";
import deviceService from "@/services/api/deviceService";
import supplierService from "@/services/api/supplierService";

const SupplierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [autoSuggestions, setAutoSuggestions] = useState([]);
  const [supplierPerformance, setSupplierPerformance] = useState([]);
  const [loadingPerformance, setLoadingPerformance] = useState(true);
  const [formData, setFormData] = useState({
    supplierId: '',
    expectedDelivery: '',
    items: [],
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ordersData, suppliersData, devicesData] = await Promise.all([
        supplierOrderService.getAll(),
        supplierService.getActiveSuppliers(),
        deviceService.getAll()
      ]);
      setOrders(ordersData);
      setSuppliers(suppliersData);
      setDevices(devicesData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load supplier orders');
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const suggestedItems = await supplierOrderService.getSuggestedItems();
      setSuggestions(suggestedItems);
      toast.success(`Found ${suggestedItems.length} items that need reordering`);
    } catch (err) {
      toast.error('Failed to load suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    
    if (!formData.supplierId) {
      toast.error('Please select a supplier');
      return;
    }
    
    if (!formData.expectedDelivery) {
      toast.error('Please select expected delivery date');
      return;
    }
    
    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      await supplierOrderService.create(formData);
      toast.success('Supplier order created successfully');
      setShowForm(false);
      resetForm();
      loadData();
    } catch (err) {
      toast.error('Failed to create order');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      await supplierOrderService.delete(id);
      toast.success('Order deleted successfully');
      loadData();
    } catch (err) {
      toast.error('Failed to delete order');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await supplierOrderService.update(id, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const addItemToOrder = (deviceId, suggestedQty = 1) => {
    const device = devices.find(d => d.Id === parseInt(deviceId));
    if (!device) return;

    const existingItem = formData.items.find(item => item.deviceId === device.Id);
    if (existingItem) {
      toast.info('Item already added to order');
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        deviceId: device.Id,
        deviceName: `${device.brand} ${device.model}`,
        quantity: suggestedQty,
        unitCost: device.cost
      }]
    }));
  };

  const updateItemQuantity = (index, quantity) => {
    const newItems = [...formData.items];
    newItems[index].quantity = Math.max(1, parseInt(quantity) || 1);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      supplierId: '',
      expectedDelivery: '',
      items: [],
      notes: ''
    });
    setSuggestions([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Ordered': return 'bg-blue-100 text-blue-800';
      case 'Received': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  };

if (loading) {
    return <Loading message="Loading supplier orders..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  async function loadAutoSuggestions() {
    try {
      setLoadingSuggestions(true);
      const suggestions = await supplierOrderService.getAutoGeneratedOrders();
      setAutoSuggestions(suggestions);
    } catch (err) {
      console.error('Error loading auto suggestions:', err);
      toast.error('Failed to load order suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function loadSupplierPerformance() {
    try {
      setLoadingPerformance(true);
      const performance = await supplierOrderService.getSupplierPerformance();
      setSupplierPerformance(performance);
    } catch (err) {
      console.error('Error loading supplier performance:', err);
      toast.error('Failed to load supplier performance data');
    } finally {
      setLoadingPerformance(false);
    }
  }

  async function handleApproveSuggestion(suggestion) {
    try {
      await supplierOrderService.approveSuggestedOrder(suggestion);
      toast.success(`Order approved for ${suggestion.deviceName}`);
      await Promise.all([loadAutoSuggestions(), loadData()]);
    } catch (err) {
      console.error('Error approving suggestion:', err);
      toast.error('Failed to approve order');
    }
  }

  async function handleDismissSuggestion(deviceId) {
    try {
      await supplierOrderService.dismissSuggestion(deviceId);
      toast.info('Suggestion dismissed');
      await loadAutoSuggestions();
    } catch (err) {
      console.error('Error dismissing suggestion:', err);
      toast.error('Failed to dismiss suggestion');
    }
  }

  useEffect(() => {
    loadAutoSuggestions();
    loadSupplierPerformance();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-h1 font-bold text-secondary">Supplier Orders</h1>
          <p className="text-gray-600 mt-1">Automated reordering and supplier performance tracking</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <ApperIcon name={showForm ? "X" : "Plus"} size={18} />
          {showForm ? 'Cancel' : 'New Order'}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`pb-3 px-1 relative ${
              activeTab === 'suggestions'
                ? 'text-primary font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <ApperIcon name="Sparkles" size={18} />
              Auto Suggestions
              {autoSuggestions.length > 0 && (
                <Badge variant="info" className="ml-2">
                  {autoSuggestions.length}
                </Badge>
              )}
            </div>
            {activeTab === 'suggestions' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-1 relative ${
              activeTab === 'orders'
                ? 'text-primary font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <ApperIcon name="Package" size={18} />
              Active Orders
              {orders.length > 0 && (
                <Badge variant="default" className="ml-2">
                  {orders.length}
                </Badge>
              )}
            </div>
            {activeTab === 'orders' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`pb-3 px-1 relative ${
              activeTab === 'performance'
                ? 'text-primary font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <ApperIcon name="TrendingUp" size={18} />
              Supplier Performance
            </div>
            {activeTab === 'performance' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreateOrder} className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-h3 font-semibold text-secondary">Create New Order</h2>
              <Button
                type="button"
                variant="secondary"
                onClick={loadSuggestions}
                disabled={loadingSuggestions}
                className="flex items-center gap-2"
              >
                <ApperIcon name="Lightbulb" size={18} />
                {loadingSuggestions ? 'Loading...' : 'Get Suggestions'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                label="Expected Delivery"
                type="date"
                required
                value={formData.expectedDelivery}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedDelivery: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {suggestions.length > 0 && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center gap-2 mb-3">
                  <ApperIcon name="TrendingUp" size={20} className="text-blue-600" />
                  <h3 className="font-semibold text-secondary">Suggested Items to Reorder</h3>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {suggestions.map(item => (
                    <div 
                      key={item.deviceId}
                      className="flex items-center justify-between p-3 bg-white rounded border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-secondary">{item.deviceName}</span>
                          <span className={`text-small font-semibold ${getPriorityColor(item.priority)}`}>
                            {item.priority.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-small text-gray-600 mt-1">
                          Stock: {item.currentStock} | Sales: {item.salesVelocity.toFixed(1)}/day | 
                          Days left: {item.daysOfStock}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-small text-gray-600">
                          Suggested: <span className="font-semibold">{item.suggestedQuantity}</span>
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addItemToOrder(item.deviceId, item.suggestedQuantity)}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-secondary">
                  Order Items <span className="text-error">*</span>
                </label>
                <select
                  className="px-3 py-1.5 text-sm border rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  onChange={(e) => {
                    if (e.target.value) {
                      addItemToOrder(e.target.value);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">+ Add Item</option>
                  {devices.map(device => (
                    <option key={device.Id} value={device.Id}>
                      {device.brand} {device.model}
                    </option>
                  ))}
                </select>
              </div>

              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  No items added yet. Use suggestions or add items manually.
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded bg-gray-50">
                      <div className="flex-1">
                        <span className="font-medium text-secondary">{item.deviceName}</span>
                        <div className="text-small text-gray-600">
                          ${item.unitCost.toFixed(2)} each
                        </div>
                      </div>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(index, e.target.value)}
                        className="w-24"
                      />
                      <span className="text-sm font-semibold text-secondary w-28 text-right">
                        ${(item.quantity * item.unitCost).toFixed(2)}
                      </span>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <ApperIcon name="Trash2" size={16} />
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-end pt-3 border-t">
                    <div className="text-right">
                      <span className="text-gray-600 mr-4">Total:</span>
                      <span className="text-h3 font-bold text-secondary">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <FormField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or special instructions..."
            />

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="secondary" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Order
              </Button>
            </div>
          </form>
        </Card>
)}

      {/* Auto Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
              {loadingSuggestions ? (
                <Loading />
              ) : autoSuggestions.length === 0 ? (
                <Empty 
                  icon="CheckCircle2"
                  title="No Reorder Suggestions"
                  description="All inventory levels are above minimum thresholds"
                />
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <ApperIcon name="Info" size={20} className="text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-1">
                          Automated Reorder Suggestions
                        </h3>
                        <p className="text-small text-blue-700">
                          These orders are automatically generated when stock falls below minimum thresholds. 
                          Review and approve to create purchase orders, or dismiss if not needed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {autoSuggestions.map(suggestion => {
                    const supplier = suppliers.find(s => s.Id === suggestion.supplierId);
                    return (
                      <Card key={suggestion.deviceId} hoverable>
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-h3 font-semibold text-secondary">
                                  {suggestion.deviceName}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-small font-medium ${getPriorityColor(suggestion.priority)}`}>
                                  {suggestion.priority.toUpperCase()} Priority
                                </span>
                              </div>
                              <div className="text-small text-gray-600 space-y-1">
                                <div className="flex items-center gap-2">
                                  <ApperIcon name="Building2" size={14} />
                                  {supplier?.name || 'Unknown Supplier'}
                                </div>
                                <div className="flex items-center gap-2">
                                  <ApperIcon name="Package" size={14} />
                                  Current Stock: {suggestion.currentStock} units
                                </div>
                                <div className="flex items-center gap-2">
                                  <ApperIcon name="TrendingDown" size={14} />
                                  Days of Stock: {suggestion.daysOfStock} days
                                </div>
                                <div className="flex items-center gap-2">
                                  <ApperIcon name="Activity" size={14} />
                                  Sales Velocity: {suggestion.salesVelocity.toFixed(1)} units/day
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-h3 font-bold text-secondary">
                                ${(suggestion.suggestedQuantity * suggestion.estimatedCost).toFixed(2)}
                              </div>
                              <div className="text-small text-gray-600">
                                {suggestion.suggestedQuantity} units @ ${suggestion.estimatedCost}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end border-t pt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDismissSuggestion(suggestion.deviceId)}
                            >
                              Dismiss
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleApproveSuggestion(suggestion)}
                              className="flex items-center gap-2"
                            >
                              <ApperIcon name="Check" size={16} />
                              Approve Order
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* Active Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.map(order => {
                const supplier = suppliers.find(s => s.Id === order.supplierId);
                return (
                  <Card key={order.Id} hoverable>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-h3 font-semibold text-secondary">
                              Order #{order.Id}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-small font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            {order.autoGenerated && (
                              <Badge variant="info" className="flex items-center gap-1">
                                <ApperIcon name="Sparkles" size={12} />
                                Auto-Generated
                              </Badge>
                            )}
                          </div>
                          <div className="text-small text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <ApperIcon name="Building2" size={14} />
                              {supplier?.name || 'Unknown Supplier'}
                            </div>
                            <div className="flex items-center gap-2">
                              <ApperIcon name="Calendar" size={14} />
                              Ordered: {format(new Date(order.orderDate), 'MMM dd, yyyy')}
                            </div>
                            <div className="flex items-center gap-2">
                              <ApperIcon name="Truck" size={14} />
                              Expected: {format(new Date(order.expectedDelivery), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-h3 font-bold text-secondary">
                            ${order.totalCost.toFixed(2)}
                          </div>
                          <div className="text-small text-gray-600">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="space-y-2">
                          {order.items.map((item, idx) => {
                            const device = devices.find(d => d.Id === item.deviceId);
                            return (
                              <div key={idx} className="flex justify-between items-center text-small">
                                <span className="text-secondary">
                                  {device ? `${device.brand} ${device.model}` : 'Unknown Device'}
                                </span>
                                <span className="text-gray-600">
                                  {item.quantity} × ${item.unitCost.toFixed(2)} = 
                                  <span className="font-semibold ml-1">
                                    ${(item.quantity * item.unitCost).toFixed(2)}
                                  </span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {order.notes && (
                        <div className="border-t pt-3">
                          <p className="text-small text-gray-600 italic">{order.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2 justify-end border-t pt-3">
                        {order.status === 'Pending' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleUpdateStatus(order.Id, 'Ordered')}
                          >
                            Mark as Ordered
                          </Button>
                        )}
                        {order.status === 'Ordered' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleUpdateStatus(order.Id, 'Received')}
                          >
                            Mark as Received
                          </Button>
                        )}
                        {order.status !== 'Received' && order.status !== 'Cancelled' && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleUpdateStatus(order.Id, 'Cancelled')}
                          >
                            Cancel Order
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteOrder(order.Id)}
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Supplier Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-4">
              {loadingPerformance ? (
                <Loading />
              ) : supplierPerformance.length === 0 ? (
                <Empty 
                  icon="BarChart3"
                  title="No Performance Data"
                  description="Performance metrics will appear once orders are completed"
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <ApperIcon name="TrendingUp" size={24} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-small text-gray-600">Avg On-Time Rate</p>
                          <p className="text-h2 font-bold text-secondary">
                            {(supplierPerformance.reduce((sum, s) => sum + s.onTimeDeliveryRate, 0) / supplierPerformance.length).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <ApperIcon name="Clock" size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-small text-gray-600">Avg Delivery Time</p>
                          <p className="text-h2 font-bold text-secondary">
                            {(supplierPerformance.reduce((sum, s) => sum + s.avgDeliveryDays, 0) / supplierPerformance.length).toFixed(1)} days
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <ApperIcon name="Package" size={24} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-small text-gray-600">Total Orders</p>
                          <p className="text-h2 font-bold text-secondary">
                            {supplierPerformance.reduce((sum, s) => sum + s.totalOrders, 0)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {supplierPerformance.map(performance => (
                    <Card key={performance.supplierId} hoverable>
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-h3 font-semibold text-secondary mb-2">
                              {performance.supplierName}
                            </h3>
                            <div className="flex items-center gap-4 text-small text-gray-600">
                              <div className="flex items-center gap-2">
                                <ApperIcon name="Package" size={14} />
                                {performance.totalOrders} total orders
                              </div>
                              <div className="flex items-center gap-2">
                                <ApperIcon name="CheckCircle" size={14} />
                                {performance.completedOrders} completed
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t">
                          <div>
                            <p className="text-small text-gray-600 mb-1">On-Time Delivery</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${performance.onTimeDeliveryRate}%` }}
                                />
                              </div>
                              <span className="text-body font-semibold text-secondary">
                                {performance.onTimeDeliveryRate.toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="text-small text-gray-600 mb-1">Avg Delivery Time</p>
                            <p className="text-body font-semibold text-secondary">
                              {performance.avgDeliveryDays.toFixed(1)} days
                            </p>
                          </div>

                          <div>
                            <p className="text-small text-gray-600 mb-1">Order Completion</p>
                            <p className="text-body font-semibold text-secondary">
                              {performance.orderCompletionRate.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </>
)}
            </div>
          )}
        )}
      </div>
    </div>
  );
};

export default SupplierOrders;