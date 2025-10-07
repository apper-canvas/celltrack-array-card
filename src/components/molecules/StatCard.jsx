import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend,
  trendDirection = "up",
  className 
}) => {
  const trendColor = trendDirection === "up" ? "text-success" : "text-error";
  
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-small text-gray-600 font-medium">{title}</p>
          <p className="text-h2 font-bold text-secondary mt-2">{value}</p>
          {trend && (
            <div className={cn("flex items-center mt-2 text-small font-medium", trendColor)}>
              <ApperIcon 
                name={trendDirection === "up" ? "TrendingUp" : "TrendingDown"} 
                size={16} 
                className="mr-1" 
              />
              <span>{trend}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <ApperIcon name={icon} size={24} className="text-white" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;