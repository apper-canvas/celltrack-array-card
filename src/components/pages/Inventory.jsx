import { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import StockBadge from "@/components/molecules/StockBadge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import deviceService from "@/services/api/deviceService";
import { toast } from "react-toastify";

const Inventory = () => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({
    imei: "",
    serialNumber: "",
    brand: "",
    model: "",
    condition: "New",
    purchasePrice: "",
    salePrice: "",
    quantity: "",
    category: "Smartphone",
    lowStockThreshold: "10"
  });

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    setFilteredDevices(devices);
  }, [devices]);

  const loadDevices = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await deviceService.getAll();
      setDevices(data);
    } catch (err) {
      setError(err.message || "Failed to load inventory");
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredDevices(devices);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = devices.filter(device =>
      device.brand.toLowerCase().includes(lowerQuery) ||
      device.model.toLowerCase().includes(lowerQuery) ||
      device.imei.toLowerCase().includes(lowerQuery) ||
      device.category.toLowerCase().includes(lowerQuery)
    );
    setFilteredDevices(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const deviceData = {
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice),
        salePrice: parseFloat(formData.salePrice),
        quantity: parseInt(formData.quantity),
        lowStockThreshold: parseInt(formData.lowStockThreshold)
      };

      if (editingDevice) {
        await deviceService.update(editingDevice.Id, deviceData);
        toast.success("Device updated successfully!");
      } else {
        await deviceService.create(deviceData);
        toast.success("Device added successfully!");
      }

      setShowAddModal(false);
      setEditingDevice(null);
      resetForm();
      loadDevices();
    } catch (err) {
      toast.error(err.message || "Failed to save device");
    }
  };

  const handleEdit = (device) => {
    setEditingDevice(device);
    setFormData({
      imei: device.imei,
      serialNumber: device.serialNumber,
      brand: device.brand,
      model: device.model,
      condition: device.condition,
      purchasePrice: device.purchasePrice.toString(),
      salePrice: device.salePrice.toString(),
      quantity: device.quantity.toString(),
      category: device.category,
      lowStockThreshold: device.lowStockThreshold.toString()
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this device?")) return;
    
    try {
      await deviceService.delete(id);
      toast.success("Device deleted successfully!");
      loadDevices();
    } catch (err) {
      toast.error(err.message || "Failed to delete device");
    }
  };

  const resetForm = () => {
    setFormData({
      imei: "",
      serialNumber: "",
      brand: "",
      model: "",
      condition: "New",
      purchasePrice: "",
      salePrice: "",
      quantity: "",
      category: "Smartphone",
      lowStockThreshold: "10"
    });
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingDevice(null);
    resetForm();
  };

  if (loading) return <Loading message="Loading inventory..." />;
  if (error) return <Error message={error} onRetry={loadDevices} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-secondary">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your product stock</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <ApperIcon name="Plus" size={18} className="mr-2" />
          Add Device
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <SearchBar
            placeholder="Search by brand, model, IMEI, or category..."
            onSearch={handleSearch}
          />
        </div>

        <div className="overflow-x-auto">
          {filteredDevices.length === 0 ? (
            <Empty
              title="No devices found"
              message="Start by adding your first device to inventory"
              icon="Package"
              actionLabel="Add Device"
              onAction={() => setShowAddModal(true)}
            />
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-small font-semibold text-secondary">Product</th>
                  <th className="text-left px-4 py-3 text-small font-semibold text-secondary">IMEI/Serial</th>
                  <th className="text-left px-4 py-3 text-small font-semibold text-secondary">Category</th>
                  <th className="text-left px-4 py-3 text-small font-semibold text-secondary">Price</th>
                  <th className="text-left px-4 py-3 text-small font-semibold text-secondary">Stock</th>
                  <th className="text-right px-4 py-3 text-small font-semibold text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDevices.map(device => (
                  <tr key={device.Id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-secondary">{device.brand} {device.model}</p>
                        <p className="text-small text-gray-600">{device.condition}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-small text-gray-700">{device.imei}</p>
                      <p className="text-small text-gray-500">{device.serialNumber}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-small text-gray-700">{device.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-secondary">${device.salePrice}</p>
                      <p className="text-small text-gray-500">Cost: ${device.purchasePrice}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StockBadge quantity={device.quantity} threshold={device.lowStockThreshold} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(device)}>
                          <ApperIcon name="Edit" size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(device.Id)}>
                          <ApperIcon name="Trash2" size={16} className="text-error" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2 font-semibold text-secondary">
                {editingDevice ? "Edit Device" : "Add New Device"}
              </h2>
              <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-700">
                <ApperIcon name="X" size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-secondary">Brand *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-secondary">Model *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-secondary">IMEI</label>
                  <input
                    type="text"
                    value={formData.imei}
                    onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-secondary">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-secondary">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Smartphone">Smartphone</option>
                    <option value="Accessory">Accessory</option>
                    <option value="Tablet">Tablet</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-secondary">Condition *</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="New">New</option>
                    <option value="Refurbished">Refurbished</option>
                    <option value="Used">Used</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-secondary">Purchase Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-secondary">Sale Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-secondary">Quantity *</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-secondary">Low Stock Alert *</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="secondary" type="button" onClick={handleModalClose}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {editingDevice ? "Update Device" : "Add Device"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Inventory;