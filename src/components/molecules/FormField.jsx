import Input from "@/components/atoms/Input";
import { cn } from "@/utils/cn";

const FormField = ({ 
  label, 
  error, 
  required = false,
  className,
  ...inputProps 
}) => {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-sm font-medium text-secondary">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <Input error={error} {...inputProps} />
      {error && (
        <p className="text-small text-error mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField;