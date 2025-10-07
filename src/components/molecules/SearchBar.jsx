import { useState } from "react";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch,
  className 
}) => {
  const [value, setValue] = useState("");
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch?.(newValue);
  };
  
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <ApperIcon name="Search" size={18} className="text-gray-400" />
      </div>
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  );
};

export default SearchBar;