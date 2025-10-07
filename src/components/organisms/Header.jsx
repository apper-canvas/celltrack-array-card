import { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = ({ onMenuClick }) => {
  const [notifications] = useState(3);
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-secondary hover:text-primary transition-colors"
          >
            <ApperIcon name="Menu" size={24} />
          </button>
          <div className="hidden sm:block">
            <h2 className="text-lg font-semibold text-secondary">Mobile Shop Manager</h2>
            <p className="text-small text-gray-600">Manage your retail operations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="relative">
            <ApperIcon name="Bell" size={20} />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center font-semibold">
                {notifications}
              </span>
            )}
          </Button>
          
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-secondary">Shop Manager</p>
              <p className="text-xs text-gray-600">Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
              SM
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;