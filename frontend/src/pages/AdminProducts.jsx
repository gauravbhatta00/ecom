import { apiBaseUrl } from '../lib/config';
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/auth";
import { motion } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Save,
  Package,
  Folder,
} from "lucide-react";

const BASEURL = apiBaseUrl;

const AdminProducts = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image_url: "",
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/dashboard", { replace: true });
      return;
    }
    loadData();
  }, [isAuthenticated, user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        authFetch(`${BASEURL}/api/products/`),
        authFetch(`${BASEURL}/api/categories/`),
      ]);

      if (!productsRes.ok || !categoriesRes.ok)
        throw new Error("Failed to fetch data");

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category_id: "",
      image_url: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      const res = await authFetch(`${BASEURL}/api/categories/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create category");
      }

      const newCategory = await res.json();
      setCategories((prev) => [newCategory, ...prev]);
      setCategoryName("");
      setShowCategoryForm(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category_id) {
      setError("Name, price, and category are required");
      return;
    }

    try {
      const url = editingId
        ? `${BASEURL}/api/products/${editingId}/update/`
        : `${BASEURL}/api/products/create/`;

      const method = editingId ? "PUT" : "POST";

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock) || 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save product");
      }

      const newProduct = await res.json();

      if (editingId) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? newProduct : p))
        );
      } else {
        setProducts((prev) => [newProduct, ...prev]);
      }

      resetForm();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const res = await authFetch(`${BASEURL}/api/products/${id}/delete/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete product");

      setProducts((prev) => prev.filter((p) => p.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category.id.toString(),
      image_url: product.image_url || "",
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-24 pb-12">
      {/* Header */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Product Management
            </h1>
            <p className="text-slate-600 mt-2">
              Add, edit, or manage your products
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCategoryForm(true)}
              className="btn btn-outline gap-2"
            >
              <Folder size={18} />
              Add Category
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="btn btn-primary gap-2"
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="alert alert-error gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Creation Modal */}
        {showCategoryForm && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Create New Category
                </h2>
                <button
                  onClick={() => {
                    setShowCategoryForm(false);
                    setCategoryName("");
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="e.g., Electronics, Fashion, Home"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="btn btn-primary gap-2 flex-1"
                  >
                    <Save size={18} />
                    Create Category
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryForm(false);
                      setCategoryName("");
                    }}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Product Form Modal */}
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="e.g., Premium Headphones"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Category *
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        className="select select-bordered w-full flex-1"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowCategoryForm(true)}
                        className="btn btn-sm btn-outline gap-1"
                        title="Create new category"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered w-full"
                    rows="3"
                    placeholder="Product description..."
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Web Image URL
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    🔗 Suggested sources: Unsplash (unsplash.com), Pexels (pexels.com), Pixabay (pixabay.com)
                  </p>
                  {formData.image_url && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e2e8f0' width='400' height='300'/%3E%3Ctext x='50%' y='50%' font-size='18' fill='%2364748b' text-anchor='middle' dy='.3em'%3EImage failed to load%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="btn btn-primary gap-2 flex-1"
                  >
                    <Save size={18} />
                    {editingId ? "Update Product" : "Create Product"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-blue-600"></span>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 text-lg">No products yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary mt-4"
            >
              Add First Product
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((product) => (
                  <motion.tr
                    key={product.id}
                    className="hover:bg-slate-50 transition-colors"
                    whileHover={{ backgroundColor: "#f8fafc" }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <div>
                          <p className="font-medium text-slate-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.category?.name}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      ${parseFloat(product.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge badge-sm">{product.stock}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="btn btn-sm btn-ghost gap-1"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="btn btn-sm btn-ghost text-red-600 gap-1"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
