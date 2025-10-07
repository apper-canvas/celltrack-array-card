import { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import deviceService from "@/services/api/deviceService";
import customerService from "@/services/api/customerService";
import saleService from "@/services/api/saleService";
import { toast } from "react-toastify";

const POS = () => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [discount, setDiscount] = useState(0);
  const TAX_RATE = 0.08;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [devicesData, customersData] = await Promise.all([
        deviceService.getAll(),
        customerService.getAll()
      ]);
      
      const availableDevices = devicesData.filter(d => d.quantity > 0);
      setDevices(availableDevices);
      setFilteredDevices(availableDevices);
      setCustomers(customersData);
    } catch (err) {
      setError(err.message || "Failed to load data");
      toast.error("Failed to load data");
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
      device.imei.toLowerCase().includes(lowerQuery)
    );
    setFilteredDevices(filtered);
  };

  const addToCart = (device) => {
    const existingItem = cart.find(item => item.deviceId === device.Id);
    
    if (existingItem) {
      if (existingItem.quantity >= device.quantity) {
        toast.warning("Cannot add more than available stock");
        return;
      }
      setCart(cart.map(item =>
        item.deviceId === device.Id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        deviceId: device.Id,
        name: `${device.brand} ${device.model}`,
        price: device.salePrice,
        quantity: 1,
        maxQuantity: device.quantity
      }]);
    }
    toast.success("Item added to cart");
  };

  const updateQuantity = (deviceId, newQuantity) => {
    const item = cart.find(i => i.deviceId === deviceId);
    if (newQuantity > item.maxQuantity) {
      toast.warning("Exceeds available stock");
      return;
    }
    if (newQuantity <= 0) {
      removeFromCart(deviceId);
      return;
    }
    setCart(cart.map(item =>
      item.deviceId === deviceId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (deviceId) => {
    setCart(cart.filter(item => item.deviceId !== deviceId));
    toast.info("Item removed from cart");
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const tax = afterDiscount * TAX_RATE;
    const total = afterDiscount + tax;
    
    return { subtotal, discountAmount, tax, total };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.warning("Cart is empty");
      return;
    }

    if (!selectedCustomer) {
      toast.warning("Please select a customer");
      return;
    }

    try {
      const { subtotal, tax, total } = calculateTotals();
      
      const saleData = {
        customerId: selectedCustomer.customerId,
        items: cart,
        subtotal,
        tax,
        discount: discount,
        total,
        paymentMethod
      };

      await saleService.create(saleData);

      for (const item of cart) {
        const device = devices.find(d => d.Id === item.deviceId);
        await deviceService.updateStock(item.deviceId, device.quantity - item.quantity);
      }

      toast.success("Sale completed successfully!");
      setCart([]);
      setSelectedCustomer(null);
      setDiscount(0);
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to complete sale");
    }
  };

  const { subtotal, discountAmount, tax, total } = calculateTotals();

  if (loading) return <Loading message="Loading POS..." />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 font-bold text-secondary">Point of Sale</h1>
        <p className="text-gray-600 mt-1">Process sales and manage transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <SearchBar
              placeholder="Search products by name, brand, or IMEI..."
              onSearch={handleSearch}
            />
          </Card>

          <Card>
            <h2 className="text-h3 font-semibold text-secondary mb-4">Available Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {filteredDevices.map(device => (
                <div
                  key={device.Id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => addToCart(device)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-secondary">{device.brand} {device.model}</p>
                      <p className="text-small text-gray-600">{device.category}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="font-semibold text-primary">${device.salePrice}</p>
                        <Badge variant="success">{device.quantity} available</Badge>
                      </div>
                    </div>
                    <Button variant="primary" size="sm">
                      <ApperIcon name="Plus" size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h2 className="text-h3 font-semibold text-secondary mb-4">Shopping Cart</h2>
            
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ApperIcon name="ShoppingCart" size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>Cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.deviceId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-secondary text-sm">{item.name}</p>
                      <p className="text-small text-gray-600">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.deviceId, item.quantity - 1)}
                        className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        <ApperIcon name="Minus" size={14} />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.deviceId, item.quantity + 1)}
                        className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        <ApperIcon name="Plus" size={14} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.deviceId)}
                        className="ml-2 text-error hover:text-red-700"
                      >
                        <ApperIcon name="Trash2" size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-200">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-secondary">Select Customer</label>
                <select
                  value={selectedCustomer?.Id || ""}
                  onChange={(e) => {
                    const customer = customers.find(c => c.Id === parseInt(e.target.value));
                    setSelectedCustomer(customer);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Choose customer...</option>
                  {customers.map(customer => (
                    <option key={customer.Id} value={customer.Id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-secondary">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-secondary">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                </select>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-h3 font-semibold text-secondary mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount ({discount}%):</span>
                  <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-700">
                <span>Tax (8%):</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-h3 font-bold text-secondary pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              variant="primary"
              className="w-full mt-4"
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              <ApperIcon name="CreditCard" size={18} className="mr-2" />
              Complete Sale
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default POS;