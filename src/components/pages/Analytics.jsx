import React, { useEffect, useState } from "react";
import { format, startOfDay, subDays } from "date-fns";
import ReactApexChart from "react-apexcharts";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Dashboard from "@/components/pages/Dashboard";
import Card from "@/components/atoms/Card";
import repairService from "@/services/api/repairService";
import saleService from "@/services/api/saleService";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError("");
    
    try {
      const endDate = new Date();
      const startDate = startOfDay(subDays(endDate, dateRange));

      const [salesData, repairsData] = await Promise.all([
        saleService.getSalesAnalytics(startDate, endDate),
        repairService.getAll()
      ]);

      const activeRepairs = repairsData.filter(r => 
        r.status !== "Completed" && r.status !== "Cancelled"
      ).length;

      setAnalytics({
        ...salesData,
        activeRepairs
      });
    } catch (err) {
      setError(err.message || "Failed to load analytics");
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

const revenueChartOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#0066FF"]
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3
      }
    },
    xaxis: {
      categories: Array.from({ length: dateRange }, (_, i) => {
        const date = subDays(new Date(), dateRange - i - 1);
        return date && !isNaN(date.getTime()) ? format(date, "MMM dd") : "Invalid";
      })
    },
    yaxis: {
      labels: {
        style: { colors: "#64748b" },
        formatter: (value) => `$${value.toFixed(0)}`
      }
    },
    grid: { borderColor: "#e2e8f0" },
    tooltip: {
      y: { formatter: (value) => `$${value.toFixed(2)}` }
    }
  };

  const revenueSeries = [{
    name: "Revenue",
    data: Array.from({ length: dateRange }, () => 
      Math.floor(Math.random() * 2000) + 500
    )
  }];

  if (loading) return <Loading message="Loading analytics..." />;
  if (error) return <Error message={error} onRetry={loadAnalytics} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-secondary">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">View your business performance metrics</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${analytics.totalRevenue.toFixed(2)}`}
          icon="DollarSign"
          trend="+15.3%"
          trendDirection="up"
        />
        <StatCard
          title="Total Sales"
          value={analytics.totalSales}
          icon="ShoppingCart"
          trend="+8.7%"
          trendDirection="up"
        />
        <StatCard
          title="Avg Transaction"
          value={`$${analytics.averageTransaction.toFixed(2)}`}
          icon="TrendingUp"
          trend="+3.2%"
          trendDirection="up"
        />
        <StatCard
          title="Active Repairs"
          value={analytics.activeRepairs}
          icon="Wrench"
          trend={`${analytics.activeRepairs} jobs`}
          trendDirection="up"
        />
      </div>

      <Card>
        <h2 className="text-h3 font-semibold text-secondary mb-4">Revenue Trend</h2>
        <ReactApexChart
          options={revenueChartOptions}
          series={revenueSeries}
          type="line"
          height={300}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-h3 font-semibold text-secondary mb-4">Top Selling Products</h2>
          <div className="space-y-3">
            {analytics.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-secondary">{product.name}</p>
                    <p className="text-small text-gray-600">{product.quantity} units sold</p>
                  </div>
                </div>
                <p className="font-semibold text-primary">${product.revenue.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-h3 font-semibold text-secondary mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary to-accent rounded-lg text-white">
              <div className="flex items-center gap-3">
                <ApperIcon name="TrendingUp" size={24} />
                <div>
                  <p className="text-sm opacity-90">Revenue Growth</p>
                  <p className="text-h3 font-bold">+15.3%</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-success to-green-600 rounded-lg text-white">
              <div className="flex items-center gap-3">
                <ApperIcon name="Users" size={24} />
                <div>
                  <p className="text-sm opacity-90">Customer Satisfaction</p>
                  <p className="text-h3 font-bold">94%</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-warning to-yellow-600 rounded-lg text-white">
              <div className="flex items-center gap-3">
                <ApperIcon name="Clock" size={24} />
                <div>
                  <p className="text-sm opacity-90">Avg Repair Time</p>
                  <p className="text-h3 font-bold">2.5 days</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;