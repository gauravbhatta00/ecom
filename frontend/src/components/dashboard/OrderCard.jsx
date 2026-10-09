import { motion } from "framer-motion";
import { ChevronRight, ShoppingBag } from "lucide-react";

/**
 * OrderCard Component
 * Displays a single order in a clean, card format
 * 
 * @param {object} order - Order object with properties:
 *   - id: number
 *   - total_amount: number
 *   - created_at: string (ISO date)
 *   - items: array of order items
 *   - status: string (optional, default: 'Completed')
 * @param {function} onViewDetails - Callback when view details clicked
 * @param {boolean} showAllItems - Show all items or truncate to 2
 */
export const OrderCard = ({
  order,
  onViewDetails,
  showAllItems = false,
  maxItems = 2,
}) => {
  const itemsToShow = showAllItems ? order.items : order.items.slice(0, maxItems);
  const hasMoreItems = !showAllItems && order.items?.length > maxItems;

  if (!order) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 5 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer rounded-2xl border border-[#dedfd7] p-4 transition-all hover:bg-[#f7f6f1] hover:shadow-md"
      onClick={onViewDetails}
    >
      {/* Header with Order ID and Amount */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="flex items-center gap-2 font-semibold text-[#18231c]">
            <ShoppingBag size={16} className="text-[#173c2b]" />
            Order #{order.id}
          </p>
          <p className="text-sm text-[#68716b]">
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="rounded-full bg-[#173c2b] px-3 py-1 text-sm font-bold text-white">
          ${parseFloat(order.total_amount).toFixed(2)}
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-3 max-h-24 space-y-1 overflow-y-auto">
        {itemsToShow.map((item, idx) => (
          <p key={idx} className="line-clamp-1 text-sm text-[#68716b]">
            <span className="font-medium text-[#18231c]">{item.quantity}×</span> {item.product?.name || "Product"}
          </p>
        ))}
        {hasMoreItems && (
          <p className="text-sm font-medium italic text-[#8a9089]">
            +{order.items.length - maxItems} more item{order.items.length - maxItems > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Footer with Status and View Button */}
      <div className="flex items-center justify-between border-t border-[#eeeee7] pt-3">
        <div className="rounded-full border border-[#dedfd7] px-2.5 py-0.5 text-xs font-semibold text-[#59635c]">
          {order.status || "Completed"}
        </div>
        <button className="flex items-center gap-1 text-sm font-medium text-[#71813d] opacity-0 transition-opacity group-hover:opacity-100">
          View
          <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default OrderCard;
