import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
const navItems = [
    { path: "/dashboard", icon: "LayoutDashboard", label: "Dashboard" },
    { path: "/inventory", icon: "Package", label: "Inventory" },
    { path: "/pos", icon: "ShoppingCart", label: "Point of Sale" },
    { path: "/repairs", icon: "Wrench", label: "Repairs" },
    { path: "/customers", icon: "Users", label: "Customers" },
    { path: "/supplier-orders", icon: "Truck", label: "Supplier Orders" },
    { path: "/analytics", icon: "BarChart3", label: "Analytics" }
  ];
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 bg-secondary h-screen sticky top-0">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <ApperIcon name="Smartphone" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">CellTrack Pro</h1>
              <p className="text-gray-400 text-xs">Shop Manager</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150",
                  "text-gray-300 hover:bg-gray-700 hover:text-white",
                  isActive && "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                )
              }
            >
              <ApperIcon name={item.icon} size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      <aside
        className={cn(
          "fixed top-0 left-0 w-64 h-screen bg-secondary z-50 lg:hidden transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <ApperIcon name="Smartphone" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">CellTrack Pro</h1>
                <p className="text-gray-400 text-xs">Shop Manager</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <ApperIcon name="X" size={24} />
            </button>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150",
                  "text-gray-300 hover:bg-gray-700 hover:text-white",
                  isActive && "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                )
              }
            >
              <ApperIcon name={item.icon} size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;