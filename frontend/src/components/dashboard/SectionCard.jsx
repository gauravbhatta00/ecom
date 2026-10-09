import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

/**
 * SectionCard Component
 * Consistent section wrapper for dashboard areas (orders, profile, etc.)
 * 
 * @param {string} title - Section title
 * @param {React.ComponentType} icon - Lucide icon component
 * @param {React.ReactNode} children - Section content/children
 * @param {string} actionText - Text for action button (optional)
 * @param {function} onAction - Callback for action button (optional)
 * @param {boolean} isLoading - Show loading state
 * @param {string} error - Error message to display
 */
export const SectionCard = ({
  title,
  icon: Icon,
  children,
  actionText,
  onAction,
  isLoading = false,
  error = null,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#dedfd7] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#eeeee7] bg-[#f7f6f1] px-6 py-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#18231c]">
          {Icon && <Icon size={20} className="text-[#173c2b]" />}
          {title}
        </h2>
        {actionText && (
          <motion.button
            whileHover={{ x: 5 }}
            onClick={onAction}
            className="flex items-center gap-1 text-sm font-semibold text-[#71813d] transition-colors hover:text-[#173c2b]"
          >
            {actionText}
            <ChevronRight size={16} />
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <span className="loading loading-spinner loading-lg text-[#173c2b]"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error gap-2 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4v2m0 0a9 9 0 11-9-9m9 9V2m9-9a9 9 0 1118 0"
              />
            </svg>
            <span>{error}</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default SectionCard;
