import React, { useEffect, useState } from "react";
import { endOfMonth, format, startOfDay, startOfMonth, subDays } from "date-fns";
import ReactApexChart from "react-apexcharts";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Customers from "@/components/pages/Customers";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import customerService from "@/services/api/customerService";
import tradeInService from "@/services/api/tradeInService";
import saleService from "@/services/api/saleService";

const BusinessInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState(90);

  useEffect(() => {
    loadInsights();
  }, [dateRange]);

  const loadInsights = async () => {
    setLoading(true);
    setError("");
    
    try {
      const endDate = new Date();
      const startDate = startOfDay(subDays(endDate, dateRange));

      const [tradeInTrends, customerCLV, seasonalPatterns] = await Promise.all([
        tradeInService.getTradeInTrends(startDate, endDate),
        customerService.getCustomerLifetimeValue(),
        saleService.getSeasonalPatterns()
      ]);

      setInsights({
        tradeInTrends,
        customerCLV: customerCLV.slice(0, 10),
        seasonalPatterns,
        totalTradeInValue: tradeInTrends.timeline.reduce((sum, t) => sum + t.totalValue, 0),
        averageCLV: customerCLV.length > 0 
          ? customerCLV.reduce((sum, c) => sum + c.totalSpent, 0) / customerCLV.length 
          : 0,
        topCustomerCLV: customerCLV[0]?.totalSpent || 0,
        peakMonth: seasonalPatterns.peakMonth,
        peakSeason: seasonalPatterns.peakSeason
      });
    } catch (err) {
      setError(err.message || "Failed to load business insights");
      toast.error("Failed to load business insights");
    } finally {
      setLoading(false);
    }
  };

const processTradeInData = () => {
    if (!insights?.tradeInTrends) return { categories: [], series: [] };
    
    const { timeline } = insights.tradeInTrends;
    
    return {
      categories: timeline.map(t => t.date && !isNaN(new Date(t.date).getTime()) ? format(new Date(t.date), "MMM dd") : "N/A"),
      series: [
        {
          name: "Trade-In Value",
          type: "line",
          data: timeline.map(t => t.averageOffer)
        },
        {
          name: "Acceptance Rate %",
          type: "area",
          data: timeline.map(t => t.acceptanceRate)
        }
      ]
    };
  };

  const processCLVData = () => {
    if (!insights?.customerCLV) return { categories: [], series: [] };
    
    return {
      categories: insights.customerCLV.map(c => c.name),
      series: [{
        name: "Lifetime Value",
        data: insights.customerCLV.map(c => c.totalSpent)
      }]
    };
  };

  const processSeasonalData = () => {
    if (!insights?.seasonalPatterns) return { categories: [], series: [] };
    
    const { monthlyRevenue } = insights.seasonalPatterns;
    
    return {
      categories: monthlyRevenue.map(m => m.month),
      series: [{
        name: "Revenue",
        data: monthlyRevenue.map(m => m.revenue)
      }]
    };
  };

  const tradeInData = processTradeInData();
  const clvData = processCLVData();
  const seasonalData = processSeasonalData();

  const tradeInChartOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: {
      curve: "smooth",
      width: [3, 0],
      colors: ["#0066FF", "#10B981"]
    },
    fill: {
      type: ["solid", "gradient"],
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: tradeInData.categories,
      labels: { style: { colors: "#64748b" } }
    },
    yaxis: [
      {
        title: { text: "Offer Amount ($)", style: { color: "#64748b" } },
        labels: {
          style: { colors: "#64748b" },
          formatter: (value) => `$${value.toFixed(0)}`
        }
      },
      {
        opposite: true,
        title: { text: "Acceptance Rate (%)", style: { color: "#64748b" } },
        labels: {
          style: { colors: "#64748b" },
          formatter: (value) => `${value.toFixed(0)}%`
        }
      }
    ],
    grid: { borderColor: "#e2e8f0" },
    legend: { position: "top", horizontalAlign: "right" },
    tooltip: {
      shared: true,
      intersect: false,
      y: [
        { formatter: (value) => `$${value.toFixed(2)}` },
        { formatter: (value) => `${value.toFixed(1)}%` }
      ]
    }
  };

  const clvChartOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        dataLabels: { position: "top" }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => `$${value.toFixed(0)}`,
      offsetX: 0,
      style: { fontSize: "12px", colors: ["#fff"] }
    },
    xaxis: {
      categories: clvData.categories,
      labels: {
        style: { colors: "#64748b" },
        formatter: (value) => `$${value.toFixed(0)}`
      }
    },
    yaxis: {
      labels: { style: { colors: "#64748b" } }
    },
    colors: ["#0066FF"],
    grid: { borderColor: "#e2e8f0" },
    tooltip: {
      y: { formatter: (value) => `$${value.toFixed(2)}` }
    }
  };

  const seasonalChartOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#10B981"]
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.6,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: seasonalData.categories,
      labels: { style: { colors: "#64748b" } }
    },
    yaxis: {
      labels: {
        style: { colors: "#64748b" },
        formatter: (value) => `$${(value / 1000).toFixed(1)}K`
      }
    },
    colors: ["#10B981"],
    grid: { borderColor: "#e2e8f0" },
    tooltip: {
      y: { formatter: (value) => `$${value.toFixed(2)}` }
    }
  };

  if (loading) return <Loading message="Loading business insights..." />;
  if (error) return <Error message={error} onRetry={loadInsights} />;
  if (!insights) return <Error message="No insights data available" onRetry={loadInsights} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-secondary">Business Insights</h1>
          <p className="text-body text-gray-600 mt-1">
            Trade-in trends, customer lifetime value, and seasonal patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={dateRange === 30 ? "primary" : "outline"}
            onClick={() => setDateRange(30)}
            size="sm"
          >
            30 Days
          </Button>
          <Button
            variant={dateRange === 60 ? "primary" : "outline"}
            onClick={() => setDateRange(60)}
            size="sm"
          >
            60 Days
          </Button>
          <Button
            variant={dateRange === 90 ? "primary" : "outline"}
            onClick={() => setDateRange(90)}
            size="sm"
          >
            90 Days
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Trade-In Value"
          value={`$${insights.totalTradeInValue.toFixed(2)}`}
          icon="TrendingUp"
          trend="+12.5%"
          trendDirection="up"
        />
        <StatCard
          title="Average CLV"
          value={`$${insights.averageCLV.toFixed(2)}`}
          icon="Users"
          trend="+8.3%"
          trendDirection="up"
        />
        <StatCard
          title="Peak Month"
          value={insights.peakMonth}
          icon="Calendar"
          trend="Highest revenue"
          trendDirection="up"
        />
        <StatCard
          title="Peak Season"
          value={insights.peakSeason}
          icon="Sun"
          trend="Best performance"
          trendDirection="up"
        />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3 font-semibold text-secondary">Trade-In Value Trends</h2>
          <div className="flex items-center gap-2 text-small text-gray-600">
            <ApperIcon name="Info" size={16} />
            <span>Offer amounts vs acceptance rates</span>
          </div>
        </div>
        <ReactApexChart
          options={tradeInChartOptions}
          series={tradeInData.series}
          type="line"
          height={320}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-small text-gray-600 mb-1">Total Trade-Ins</p>
            <p className="text-h3 font-bold text-secondary">
              {insights.tradeInTrends.timeline.reduce((sum, t) => sum + t.count, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-small text-gray-600 mb-1">Avg Acceptance Rate</p>
            <p className="text-h3 font-bold text-success">
              {(insights.tradeInTrends.timeline.reduce((sum, t) => sum + t.acceptanceRate, 0) / 
                insights.tradeInTrends.timeline.length).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-small text-gray-600 mb-1">Avg Offer Value</p>
            <p className="text-h3 font-bold text-primary">
              ${(insights.tradeInTrends.timeline.reduce((sum, t) => sum + t.averageOffer, 0) / 
                insights.tradeInTrends.timeline.length).toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3 font-semibold text-secondary">Customer Lifetime Value</h2>
          <div className="flex items-center gap-2 text-small text-gray-600">
            <ApperIcon name="TrendingUp" size={16} />
            <span>Top 10 customers by total spend</span>
          </div>
        </div>
        <ReactApexChart
          options={clvChartOptions}
          series={clvData.series}
          type="bar"
          height={400}
        />
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {insights.customerCLV.slice(0, 3).map((customer, index) => (
              <div key={customer.Id} className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-secondary truncate">{customer.name}</p>
                    <p className="text-small text-gray-600">{customer.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-small">
                    <span className="text-gray-600">Lifetime Value:</span>
                    <span className="font-semibold text-primary">${customer.totalSpent.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-small">
                    <span className="text-gray-600">Purchases:</span>
                    <span className="font-medium text-secondary">{customer.purchaseCount}</span>
                  </div>
                  <div className="flex justify-between text-small">
                    <span className="text-gray-600">Avg Order:</span>
                    <span className="font-medium text-secondary">${customer.averageOrderValue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3 font-semibold text-secondary">Seasonal Sales Patterns</h2>
          <div className="flex items-center gap-2 text-small text-gray-600">
            <ApperIcon name="Calendar" size={16} />
            <span>Monthly revenue trends</span>
          </div>
        </div>
        <ReactApexChart
          options={seasonalChartOptions}
          series={seasonalData.series}
          type="area"
          height={320}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          {Object.entries(insights.seasonalPatterns.seasonalTotals).map(([season, revenue]) => {
            const seasonIcons = {
              Winter: "Snowflake",
              Spring: "Flower2",
              Summer: "Sun",
              Fall: "Leaf"
            };
            const seasonColors = {
              Winter: "from-blue-500 to-blue-600",
              Spring: "from-green-500 to-green-600",
              Summer: "from-yellow-500 to-orange-500",
              Fall: "from-orange-500 to-red-500"
            };
            
            return (
              <div 
                key={season} 
                className={`bg-gradient-to-br ${seasonColors[season]} rounded-lg p-4 text-white`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <ApperIcon name={seasonIcons[season]} size={20} />
                  <p className="font-semibold">{season}</p>
                </div>
                <p className="text-h3 font-bold">${revenue.toFixed(2)}</p>
                <p className="text-small opacity-90 mt-1">
                  {season === insights.peakSeason ? "🏆 Peak Season" : "Total Revenue"}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-h3 font-semibold text-secondary mb-4">Trade-In Insights</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
              <div className="flex items-center gap-3">
                <ApperIcon name="CheckCircle" size={24} className="text-success" />
                <div>
                  <p className="text-small text-gray-600">Acceptance Rate</p>
                  <p className="text-h3 font-bold text-secondary">
                    {((insights.tradeInTrends.timeline.filter(t => t.acceptanceRate > 50).length / 
                      insights.tradeInTrends.timeline.length) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-success/10 to-green-600/10 rounded-lg">
              <div className="flex items-center gap-3">
                <ApperIcon name="Smartphone" size={24} className="text-primary" />
                <div>
                  <p className="text-small text-gray-600">Most Common Condition</p>
                  <p className="text-h3 font-bold text-secondary">Good</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-warning/10 to-yellow-600/10 rounded-lg">
              <div className="flex items-center gap-3">
                <ApperIcon name="DollarSign" size={24} className="text-warning" />
                <div>
                  <p className="text-small text-gray-600">Highest Offer</p>
                  <p className="text-h3 font-bold text-secondary">
                    ${Math.max(...insights.tradeInTrends.timeline.map(t => t.averageOffer)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-h3 font-semibold text-secondary mb-4">Customer Insights</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
              <div className="flex items-center gap-3">
                <ApperIcon name="Users" size={24} className="text-primary" />
                <div>
                  <p className="text-small text-gray-600">Total Customers Analyzed</p>
                  <p className="text-h3 font-bold text-secondary">{insights.customerCLV.length}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-success/10 to-green-600/10 rounded-lg">
              <div className="flex items-center gap-3">
                <ApperIcon name="Star" size={24} className="text-success" />
                <div>
                  <p className="text-small text-gray-600">Top Customer CLV</p>
                  <p className="text-h3 font-bold text-secondary">${insights.topCustomerCLV.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-info/10 to-blue-600/10 rounded-lg">
              <div className="flex items-center gap-3">
                <ApperIcon name="ShoppingCart" size={24} className="text-info" />
                <div>
                  <p className="text-small text-gray-600">Avg Purchase Frequency</p>
                  <p className="text-h3 font-bold text-secondary">
                    {(insights.customerCLV.reduce((sum, c) => sum + c.purchaseCount, 0) / 
                      insights.customerCLV.length).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BusinessInsights;