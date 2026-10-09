import { motion } from "framer-motion";

/**
 * DashboardCard Component
 * Reusable card component for dashboard statistics
 * 
 * @param {string} title - Card title
 * @param {string|number} value - Main value to display
 * @param {React.ComponentType} Icon - Lucide icon component
 * @param {string} color - Color scheme (blue, green, purple, orange)
 * @param {string} subtitle - Subtitle/description text
 * @param {React.ReactNode} children - Additional content
 * @param {object} variants - Framer Motion animation variants
 */
export const DashboardCard = ({
  title,
  value,
  Icon,
  color = "blue",
  subtitle,
  children,
  variants,
}) => {
  const colorClasses = {
    blue: "bg-[#eaf1e7] text-[#173c2b] border-l-4 border-[#173c2b]",
    green: "bg-[#f2f7e4] text-[#5a7025] border-l-4 border-[#8ea649]",
    purple: "bg-[#f5f2e8] text-[#8a5a11] border-l-4 border-[#d79a3c]",
    orange: "bg-[#f5f2e8] text-[#8a5a11] border-l-4 border-[#d79a3c]",
    red: "bg-[#fbeeeb] text-[#8a3223] border-l-4 border-[#b3462f]",
    indigo: "bg-[#eaf1e7] text-[#173c2b] border-l-4 border-[#173c2b]",
  };

  const gradientClasses = {
    blue: "from-[#eaf1e7] to-transparent",
    green: "from-[#f2f7e4] to-transparent",
    purple: "from-[#f5f2e8] to-transparent",
    orange: "from-[#f5f2e8] to-transparent",
    red: "from-[#fbeeeb] to-transparent",
    indigo: "from-[#eaf1e7] to-transparent",
  };

  return (
    <motion.div
      variants={variants}
      className="overflow-hidden rounded-2xl border border-[#dedfd7] bg-white transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between p-6">
        <div>
          <p className="text-sm font-medium text-[#68716b]">{title}</p>
          <p className="mt-2 text-3xl font-bold text-[#18231c]">{value}</p>
          {subtitle && <p className="mt-2 text-xs text-[#8a9089]">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`rounded-xl p-3 ${colorClasses[color]}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
      {children && <div className="px-6 pb-4">{children}</div>}
      <div className={`bg-gradient-to-r ${gradientClasses[color]} h-1`}></div>
    </motion.div>
  );
};

export default DashboardCard;
