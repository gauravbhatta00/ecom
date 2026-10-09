import { apiBaseUrl } from '../lib/config';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { authFetch } from "../utils/auth";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Package,
  DollarSign,
  Clock,
  User,
  Settings,
  LogOut,
  TrendingUp,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { StatsGrid } from "../components/dashboard/StatsGrid";
import { SectionCard } from "../components/dashboard/SectionCard";
import { OrderCard } from "../components/dashboard/OrderCard";

const BASEURL = apiBaseUrl;

const Dashboard = () => {
  const { isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    loadDashboard();
  }, [isAuthenticated, navigate]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${BASEURL}/api/dashboard/`);
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f6f1] pt-24 pb-12 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#173c2b]"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f6f1] pt-24 pb-12 flex items-center justify-center">
        <div className="alert alert-error gap-2 max-w-md">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const isAdmin = dashboardData?.role === "admin";

  return (
    <div className="min-h-screen bg-[#f7f6f1] pt-24 pb-12">
      {/* Header Section */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-[#71813d]">{isAdmin ? "Store overview" : "Your account"}</p>
            <h1 className="display-font text-4xl text-[#18231c]">
              {isAdmin ? "Admin Dashboard" : `Welcome back, ${dashboardData?.user?.first_name || "Customer"}!`}
            </h1>
            <p className="text-[#68716b] mt-2">
              {isAdmin ? "Manage your store and track performance" : "Here's your shopping summary"}
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/admin/products")}
                className="btn btn-primary btn-sm gap-2"
              >
                <Package size={18} />
                Manage Products
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="btn btn-outline btn-sm gap-2"
            >
              <LogOut size={18} />
              Logout
            </motion.button>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* ADMIN DASHBOARD */}
        {isAdmin ? (
          <>
            {/* Admin Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  title: "Total Products",
                  value: dashboardData?.stats?.totalProducts,
                  icon: Package,
                  color: "blue",
                },
                {
                  title: "Total Orders",
                  value: dashboardData?.stats?.totalOrders,
                  icon: ShoppingBag,
                  color: "green",
                },
                {
                  title: "Total Revenue",
                  value: `$${dashboardData?.stats?.totalRevenue}`,
                  icon: TrendingUp,
                  color: "purple",
                },
                {
                  title: "Total Customers",
                  value: dashboardData?.stats?.totalCustomers,
                  icon: User,
                  color: "orange",
                },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                const colorClasses = {
                  blue: "bg-[#eaf1e7] text-[#173c2b]",
                  green: "bg-[#f2f7e4] text-[#5a7025]",
                  purple: "bg-[#f5f2e8] text-[#8a5a11]",
                  orange: "bg-[#f5f2e8] text-[#8a5a11]",
                };

                return (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="rounded-2xl border border-[#dedfd7] bg-white p-6 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#68716b]">{stat.title}</p>
                        <p className="mt-2 text-3xl font-bold text-[#18231c]">{stat.value}</p>
                      </div>
                      <div className={`rounded-xl p-3 ${colorClasses[stat.color]}`}>
                        <Icon size={24} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Admin Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Orders */}
              <motion.div variants={item} className="lg:col-span-2">
                <div className="overflow-hidden rounded-2xl border border-[#dedfd7] bg-white">
                  <div className="border-b border-[#eeeee7] bg-[#f7f6f1] px-6 py-4">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-[#18231c]">
                      <ShoppingBag size={20} />
                      Recent Orders
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {dashboardData?.orders && dashboardData.orders.length > 0 ? (
                        dashboardData.orders.map((order) => (
                          <motion.div
                            key={order.id}
                            whileHover={{ x: 5 }}
                            className="cursor-pointer rounded-xl border border-[#dedfd7] p-4 transition-colors hover:bg-[#f7f6f1]"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-[#18231c]">Order #{order.id}</p>
                                <p className="text-sm text-[#68716b]">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="rounded-full bg-[#173c2b] px-3 py-1 text-sm font-bold text-white">${order.total_amount}</div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <p className="py-8 text-center text-[#68716b]">No orders yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Top Products */}
              <motion.div variants={item}>
                <div className="overflow-hidden rounded-2xl border border-[#dedfd7] bg-white">
                  <div className="border-b border-[#eeeee7] bg-[#f7f6f1] px-6 py-4">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-[#18231c]">
                      <Package size={20} />
                      Top Products
                    </h2>
                  </div>
                  <div className="max-h-96 space-y-3 overflow-y-auto p-6">
                    {dashboardData?.products && dashboardData.products.length > 0 ? (
                      dashboardData.products.map((product) => (
                        <motion.div
                          key={product.id}
                          whileHover={{ x: 5 }}
                          className="rounded-xl border border-[#dedfd7] p-3 transition-colors hover:bg-[#f7f6f1]"
                        >
                          <div className="flex items-start justify-between">
                            <p className="line-clamp-2 text-sm font-medium text-[#18231c]">
                              {product.name}
                            </p>
                            <span className="rounded-full border border-[#dedfd7] px-2.5 py-0.5 text-xs font-semibold text-[#59635c]">${product.price}</span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="py-8 text-center text-[#68716b]">No products</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        ) : (
          /* CUSTOMER DASHBOARD */
          <>
            {/* Customer Stats Grid */}
            <div className="mb-8">
              <StatsGrid
                stats={[
                  {
                    title: "Total Orders",
                    value: dashboardData?.stats?.totalOrders,
                    icon: ShoppingBag,
                    color: "blue",
                    subtitle: "All time purchases",
                  },
                  {
                    title: "Total Spent",
                    value: `$${dashboardData?.stats?.totalSpent}`,
                    icon: DollarSign,
                    color: "green",
                    subtitle: "Lifetime value",
                  },
                  {
                    title: "Cart Items",
                    value: cart?.length || 0,
                    icon: Package,
                    color: "purple",
                    subtitle: "Ready to checkout",
                  },
                  {
                    title: "Last Order",
                    value: dashboardData?.stats?.lastOrderDate
                      ? new Date(dashboardData.stats.lastOrderDate).toLocaleDateString()
                      : "—",
                    icon: Clock,
                    color: "orange",
                    subtitle: "Most recent purchase",
                  },
                ]}
                variants={container}
              />
            </div>

            {/* Customer Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Recent Orders Section */}
              <motion.div variants={item} className="lg:col-span-2">
                <SectionCard
                  title="Recent Orders"
                  icon={Package}
                  isLoading={loading}
                  error={error}
                  actionText={dashboardData?.orders?.length > 5 ? "View All" : null}
                  onAction={() => navigate("/orders")}
                >
                  {dashboardData?.orders && dashboardData.orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-600">No orders yet. Start shopping!</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/products")}
                        className="btn btn-primary btn-sm mt-4"
                      >
                        Browse Products
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dashboardData?.orders?.slice(0, 5).map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onViewDetails={() => navigate(`/orders`)}
                          maxItems={2}
                        />
                      ))}
                    </div>
                  )}
                </SectionCard>
              </motion.div>

              {/* Sidebar: Quick Actions */}
              <motion.div variants={item} className="space-y-6">
                {/* Profile Card */}
                <div className="overflow-hidden rounded-2xl border border-[#dedfd7] bg-white">
                  <div className="bg-[#173c2b] px-6 py-8">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-[#24533d]">
                        {dashboardData?.user?.profile?.avatar_url ? (
                          <img
                            src={dashboardData.user.profile.avatar_url}
                            alt="avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User size={32} className="text-[#dff274]" />
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">
                          {dashboardData?.user?.first_name} {dashboardData?.user?.last_name}
                        </p>
                        <p className="text-sm text-white/60">{dashboardData?.user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 p-6">
                    <motion.button
                      whileHover={{ x: 5 }}
                      onClick={() => navigate("/profile")}
                      className="group flex w-full items-center justify-between rounded-xl p-3 transition-colors hover:bg-[#f7f6f1]"
                    >
                      <span className="flex items-center gap-3 font-medium text-[#59635c]">
                        <User size={18} className="text-[#68716b] group-hover:text-[#173c2b]" />
                        Edit Profile
                      </span>
                      <ChevronRight size={16} className="text-[#a3a89e] group-hover:text-[#173c2b]" />
                    </motion.button>
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="group flex w-full items-center justify-between rounded-xl p-3 transition-colors hover:bg-[#f7f6f1]"
                    >
                      <span className="flex items-center gap-3 font-medium text-[#59635c]">
                        <Settings size={18} className="text-[#68716b] group-hover:text-[#173c2b]" />
                        Preferences
                      </span>
                      <ChevronRight size={16} className="text-[#a3a89e] group-hover:text-[#173c2b]" />
                    </motion.button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="overflow-hidden rounded-2xl border border-[#dedfd7] bg-white">
                  <div className="border-b border-[#eeeee7] bg-[#f7f6f1] px-6 py-4">
                    <h3 className="text-sm font-bold text-[#18231c]">Quick Actions</h3>
                  </div>
                  <div className="space-y-3 p-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/products")}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#173c2b] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#24533d]"
                    >
                      <ShoppingBag size={16} />
                      Continue Shopping
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={cart?.length === 0}
                      onClick={() => navigate("/checkout")}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-[#dedfd7] px-4 py-2.5 text-sm font-bold text-[#173c2b] transition hover:bg-[#f7f6f1] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <TrendingUp size={16} />
                      Go to Checkout
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
