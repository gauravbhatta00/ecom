import { motion } from "framer-motion";
import DashboardCard from "./DashboardCard";

/**
 * StatsGrid Component
 * Renders a responsive grid of statistics cards
 * 
 * @param {Array} stats - Array of stat objects with properties:
 *   - title: string
 *   - value: string or number
 *   - icon: React Component (Lucide icon)
 *   - color: string (blue, green, purple, orange, red, indigo)
 *   - subtitle: string (optional)
 * @param {object} variants - Framer Motion animation variants
 */
export const StatsGrid = ({ stats = [], variants }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={variants || containerVariants}
      initial="hidden"
      animate="show"
    >
      {stats.map((stat, idx) => (
        <DashboardCard
          key={idx}
          title={stat.title}
          value={stat.value}
          Icon={stat.icon}
          color={stat.color || "blue"}
          subtitle={stat.subtitle}
          variants={itemVariants}
        />
      ))}
    </motion.div>
  );
};

export default StatsGrid;
