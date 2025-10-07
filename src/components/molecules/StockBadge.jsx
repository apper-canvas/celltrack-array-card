import Badge from "@/components/atoms/Badge";

const StockBadge = ({ quantity, threshold = 10 }) => {
  let variant = "success";
  let text = `${quantity} in stock`;
  
  if (quantity === 0) {
    variant = "error";
    text = "Out of stock";
  } else if (quantity < 5) {
    variant = "error";
    text = `${quantity} in stock`;
  } else if (quantity < threshold) {
    variant = "warning";
    text = `${quantity} in stock`;
  }
  
  return <Badge variant={variant}>{text}</Badge>;
};

export default StockBadge;