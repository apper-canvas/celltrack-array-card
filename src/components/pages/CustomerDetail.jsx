import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Repairs from "@/components/pages/Repairs";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import customerService from "@/services/api/customerService";
import deviceService from "@/services/api/deviceService";
import repairService from "@/services/api/repairService";
import saleService from "@/services/api/saleService";

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [devices, setDevices] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCustomerData();
  }, [id]);

  async function loadCustomerData() {
    try {
      setLoading(true);
      setError(null);

      const customerId = parseInt(id);
      if (isNaN(customerId)) {
        setError("Invalid customer ID");
        setLoading(false);
        return;
      }

      const [customerData, allSales, allDevices, allRepairs] = await Promise.all([
        customerService.getById(customerId),
        saleService.getAll(),
        deviceService.getAll(),
        repairService.getAll(),
      ]);

      if (!customerData) {
        setError("Customer not found");
        setLoading(false);
        return;
      }

      setCustomer(customerData);
      setPurchases(allSales.filter((sale) => sale.customerId === customerId));
      setDevices(allDevices.filter((device) => device.customerId === customerId));
      setRepairs(allRepairs.filter((repair) => repair.customerId === customerId));
    } catch (err) {
      console.error("Failed to load customer data:", err);
      setError(err.message || "Failed to load customer data");
      toast.error("Failed to load customer data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loading message="Loading customer details..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadCustomerData} />;
  }

  if (!customer) {
    return <Empty message="Customer not found" />;
  }

  const totalSpent = purchases.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const activeDevices = devices.filter((d) => d.status === "In Stock" || d.status === "Active").length;
  const pendingRepairs = repairs.filter((r) => r.status === "Pending" || r.status === "In Progress").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/customers")}>
            <ApperIcon name="ArrowLeft" size={16} />
            Back
          </Button>
          <div>
            <h1 className="text-h1 font-bold text-secondary">Customer Details</h1>
            <p className="text-small text-secondary/60 mt-1">
              Complete customer information and history
            </p>
          </div>
        </div>
      </div>

      {/* Customer Info Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-h2 font-semibold text-secondary mb-2">{customer.name}</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-body text-secondary/70">
                <ApperIcon name="Mail" size={16} />
                {customer.email}
              </div>
              <div className="flex items-center gap-2 text-body text-secondary/70">
                <ApperIcon name="Phone" size={16} />
                {customer.phone}
              </div>
              {customer.address && (
                <div className="flex items-center gap-2 text-body text-secondary/70">
                  <ApperIcon name="MapPin" size={16} />
                  {customer.address}
                </div>
              )}
            </div>
          </div>
          <Badge variant={customer.membershipTier === "Gold" ? "warning" : customer.membershipTier === "Silver" ? "info" : "default"}>
            {customer.membershipTier} Member
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-secondary/10">
          <div className="text-center p-4 bg-background rounded-lg">
            <div className="text-h2 font-bold text-primary">${totalSpent.toFixed(2)}</div>
            <div className="text-small text-secondary/60 mt-1">Total Spent</div>
          </div>
          <div className="text-center p-4 bg-background rounded-lg">
            <div className="text-h2 font-bold text-success">{activeDevices}</div>
            <div className="text-small text-secondary/60 mt-1">Active Devices</div>
          </div>
          <div className="text-center p-4 bg-background rounded-lg">
            <div className="text-h2 font-bold text-warning">{pendingRepairs}</div>
            <div className="text-small text-secondary/60 mt-1">Pending Repairs</div>
          </div>
        </div>
      </Card>

      {/* Purchase History */}
      <div>
        <h3 className="text-h3 font-semibold text-secondary mb-4 flex items-center gap-2">
          <ApperIcon name="ShoppingBag" size={20} />
          Purchase History
        </h3>
        {purchases.length === 0 ? (
          <Empty message="No purchases found" icon="ShoppingBag" />
        ) : (
          <div className="grid gap-4">
{purchases.map((sale) => (
              <Card key={sale.Id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-body font-medium text-secondary">
                        Sale #{sale.Id}
                      </span>
                      <Badge variant="success">{sale.paymentMethod}</Badge>
                    </div>
                    <div className="text-small text-secondary/60 mb-2">
                      {sale.date ? format(new Date(sale.date), "MMM dd, yyyy 'at' h:mm a") : "Unknown date"}
                    </div>
                    <div className="text-h3 font-semibold text-primary">
                      ${sale.totalAmount.toFixed(2)}
                    </div>
                    {sale.discount > 0 && (
                      <div className="text-small text-success">
                        Saved ${sale.discount.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Device History */}
      <div>
        <h3 className="text-h3 font-semibold text-secondary mb-4 flex items-center gap-2">
          <ApperIcon name="Smartphone" size={20} />
          Device History
        </h3>
        {devices.length === 0 ? (
          <Empty message="No devices found" icon="Smartphone" />
        ) : (
          <div className="grid gap-4">
            {devices.map((device) => (
              <Card key={device.Id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-body font-medium text-secondary">
                        {device.brand} {device.model}
                      </span>
                      <Badge variant={device.status === "In Stock" ? "success" : device.status === "Sold" ? "default" : "info"}>
                        {device.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-small text-secondary/60">
                      <div>IMEI: {device.imei}</div>
                      <div>Storage: {device.storage}</div>
                      <div>Condition: {device.condition}</div>
                      <div>Color: {device.color}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-h3 font-semibold text-primary">
                      ${device.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Repair History */}
      <div>
        <h3 className="text-h3 font-semibold text-secondary mb-4 flex items-center gap-2">
          <ApperIcon name="Wrench" size={20} />
          Repair History
        </h3>
        {repairs.length === 0 ? (
          <Empty message="No repair history found" icon="Wrench" />
        ) : (
          <div className="grid gap-4">
{repairs.map((repair) => (
              <Card key={repair.Id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-body font-medium text-secondary">
                        Ticket #{repair.Id}
                      </span>
                      <Badge
                        variant={
                          repair.status === "Completed"
                            ? "success"
                            : repair.status === "In Progress"
                            ? "info"
                            : repair.status === "Pending"
                            ? "warning"
                            : "error"
                        }
                      >
                        {repair.status}
                      </Badge>
                      <Badge variant="default">{repair.priority}</Badge>
                    </div>
                    <div className="text-small text-secondary/70 mb-2">
                      {repair.deviceModel} - {repair.issueType}
                    </div>
                    <div className="text-small text-secondary/60 mb-2">
                      Created: {repair.createdAt ? format(new Date(repair.createdAt), "MMM dd, yyyy") : "Unknown date"}
                    </div>
                    <div className="text-h3 font-semibold text-primary">
                      ${repair.estimatedCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}