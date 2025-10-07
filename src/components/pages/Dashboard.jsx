import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Repairs from "@/components/pages/Repairs";
import Customers from "@/components/pages/Customers";
import Inventory from "@/components/pages/Inventory";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import deviceService from "@/services/api/deviceService";
import repairService from "@/services/api/repairService";
import saleService from "@/services/api/saleService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todaySales: 0,
    lowStockCount: 0,
    activeRepairs: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockDevices, setLowStockDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [revenue, sales, devices, repairs] = await Promise.all([
        saleService.getTotalRevenue(),
        saleService.getRecentSales(5),
        deviceService.getLowStock(10),
        repairService.getActiveRepairs()
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaySalesData = sales.filter(s => new Date(s.timestamp) >= today);
      const todayRevenue = todaySalesData.reduce((sum, s) => sum + s.total, 0);

      setStats({
        totalRevenue: revenue,
        todaySales: todayRevenue,
        lowStockCount: devices.length,
        activeRepairs: repairs.length
      });

      setRecentSales(sales);
      setLowStockDevices(devices);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading dashboard..." />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-secondary">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your shop management center</p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => navigate("/pos")}>
            <ApperIcon name="ShoppingCart" size={18} className="mr-2" />
            New Sale
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon="DollarSign"
          trend="+12.5%"
          trendDirection="up"
        />
        <StatCard
          title="Today's Sales"
          value={`$${stats.todaySales.toFixed(2)}`}
          icon="TrendingUp"
          trend="+8.2%"
          trendDirection="up"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockCount}
          icon="AlertTriangle"
          trend={stats.lowStockCount > 0 ? "Needs attention" : "All good"}
          trendDirection={stats.lowStockCount > 0 ? "down" : "up"}
        />
        <StatCard
          title="Active Repairs"
          value={stats.activeRepairs}
          icon="Wrench"
          trend={`${stats.activeRepairs} pending`}
          trendDirection="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h3 font-semibold text-secondary">Recent Sales</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/analytics")}>
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentSales.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No sales yet</p>
            ) : (
recentSales.map(sale => (
                <div
                  key={sale.Id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <ApperIcon name="ShoppingBag" size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary">Sale #{sale.Id}</p>
                      <p className="text-small text-gray-600">
                        {sale.timestamp && !isNaN(new Date(sale.timestamp).getTime()) ? format(new Date(sale.timestamp), "MMM dd, yyyy HH:mm") : "Unknown time"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-secondary">${sale.total.toFixed(2)}</p>
                    <Badge variant="success">{sale.paymentMethod}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h3 font-semibold text-secondary">Low Stock Alerts</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")}>
              Manage Stock
            </Button>
          </div>
          <div className="space-y-3">
            {lowStockDevices.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="CheckCircle" size={48} className="text-success mx-auto mb-2" />
                <p className="text-gray-600">All items well stocked!</p>
              </div>
            ) : (
              lowStockDevices.map(device => (
                <div
                  key={device.Id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <ApperIcon name="AlertTriangle" size={20} className="text-error" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary">{device.brand} {device.model}</p>
                      <p className="text-small text-gray-600">{device.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={device.quantity < 5 ? "error" : "warning"}>
                      {device.quantity} left
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card hoverable className="cursor-pointer" onClick={() => navigate("/inventory")}>
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-3 flex items-center justify-center">
              <ApperIcon name="Package" size={28} className="text-white" />
            </div>
            <p className="font-semibold text-secondary">Inventory</p>
            <p className="text-small text-gray-600 mt-1">Manage stock</p>
          </div>
        </Card>

        <Card hoverable className="cursor-pointer" onClick={() => navigate("/pos")}>
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-success to-green-600 mx-auto mb-3 flex items-center justify-center">
              <ApperIcon name="ShoppingCart" size={28} className="text-white" />
            </div>
            <p className="font-semibold text-secondary">Point of Sale</p>
            <p className="text-small text-gray-600 mt-1">Process sales</p>
          </div>
        </Card>

        <Card hoverable className="cursor-pointer" onClick={() => navigate("/repairs")}>
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-warning to-yellow-600 mx-auto mb-3 flex items-center justify-center">
              <ApperIcon name="Wrench" size={28} className="text-white" />
            </div>
            <p className="font-semibold text-secondary">Repairs</p>
            <p className="text-small text-gray-600 mt-1">Track jobs</p>
          </div>
        </Card>

        <Card hoverable className="cursor-pointer" onClick={() => navigate("/customers")}>
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-info to-blue-600 mx-auto mb-3 flex items-center justify-center">
              <ApperIcon name="Users" size={28} className="text-white" />
            </div>
            <p className="font-semibold text-secondary">Customers</p>
            <p className="text-small text-gray-600 mt-1">View profiles</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;