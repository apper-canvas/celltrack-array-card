import ApperIcon from "@/components/ApperIcon";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
        <ApperIcon 
          name="Smartphone" 
          size={32} 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" 
        />
      </div>
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  );
};

export default Loading;