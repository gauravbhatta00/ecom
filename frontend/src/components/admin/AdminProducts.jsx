import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Edit2, FolderPlus, Package, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { apiBaseUrl } from "../../lib/config";
import { authFetch } from "../../utils/auth";
import AdminShell, { AdminEmpty, AdminLoading, AdminNotice, AdminPanel, money } from "./AdminShell";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import AdminCategoryTree from "./AdminCategoryTree";
import { categoryLabel } from "../../lib/categories";

const emptyProduct = { name: "", description: "", price: "", stock: "0", category_id: "", image_url: "" };
export default function AdminProducts() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryParent, setCategoryParent] = useState("");
  const [categoryEditingId, setCategoryEditingId] = useState(null);
  const [department, setDepartment] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageMode, setImageMode] = useState("upload");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const lock = useRef(false);
  const trigger = useRef(null);
  const addButton = useRef(null);
  const query = params.get("q") || "";
  const stock = params.get("stock") || "all";
  const category = params.get("category") || "all";
  const showProduct = editor === "product" || params.get("new") === "1";
  const categoryView = params.get("view") === "categories";
  const roots = categories.filter(item => !item.parent);
  const subcategories = categories.filter(item => String(item.parent) === department);
  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview); }, [imagePreview]);
  const load = useCallback(async () => {
    if (lock.current) return;
    lock.current = true; setLoading(true); setError("");
    try {
      const responses = await Promise.all([authFetch(`${apiBaseUrl}/api/products/`), authFetch(`${apiBaseUrl}/api/categories/`)]);
      if (responses.some(response => !response.ok)) throw new Error("The catalog could not be loaded. Please refresh to try again.");
      const [items, groups] = await Promise.all(responses.map(response => response.json()));
      setProducts(items); setCategories(groups);
    } catch (err) { setError(err.message || "Connection interrupted. Please try again."); }
    finally { lock.current = false; setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const filter = (key, value) => setParams(old => { const next = new URLSearchParams(old); if (value && value !== "all") next.set(key, value); else next.delete(key); return next; }, { replace: true });
  const close = () => { if (busy) return; setEditor(null); filter("new", ""); setFormError(""); setEditingId(null); setForm(emptyProduct); setImageFile(null); setImagePreview(""); setDepartment(""); };
  const openProduct = (event, product) => {
    trigger.current = event.currentTarget; setFormError(""); setEditingId(product?.id || null);
    setDepartment(product?.category?.parent ? String(product.category.parent) : "");
    setImageFile(null); setImagePreview(""); setImageMode(product?.image ? "upload" : product?.image_url ? "url" : "upload");
    setForm(product ? { name: product.name, description: product.description || "", price: String(product.price), stock: String(product.stock), category_id: String(product.category?.id || ""), image_url: product.image_url || "" } : emptyProduct);
    setEditor("product");
  };
  const mutate = async (url, method, payload, onSuccess, successMessage, inForm = true) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setFormError(""); setError(""); setMessage("");
    try {
      const response = await authFetch(`${apiBaseUrl}${url}`, { method, ...(payload instanceof FormData ? { body: payload } : payload ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) } : {}) });
      if (!response.ok) { const details = await response.json().catch(() => ({})); throw new Error(Object.entries(details).map(([key, value]) => `${key === "error" || key === "detail" ? "" : key + ": "}${Array.isArray(value) ? value.join(" ") : value}`).join(" · ") || "The change could not be saved. Please try again."); }
      onSuccess(method === "DELETE" ? null : await response.json()); setMessage(successMessage);
      if (inForm) { setEditor(null); filter("new", ""); setEditingId(null); setForm(emptyProduct); setCategoryName(""); setImageFile(null); setImagePreview(""); setDepartment(""); }
    } catch (err) { (inForm ? setFormError : setError)(err.message || "Connection interrupted. Your change was not confirmed."); }
    finally { lock.current = false; setBusy(false); }
  };
  const saveProduct = event => {
    event.preventDefault();
    if (!form.name.trim() || !form.category_id || !form.price.trim() || !Number.isFinite(Number(form.price)) || Number(form.price) < 0 || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) { setFormError("Enter a name, category, valid price, and a whole stock quantity of zero or more."); return; }
    const payload = new FormData();
    Object.entries({ ...form, name: form.name.trim() }).forEach(([key, value]) => payload.append(key, value));
    if (imageMode === "upload" && imageFile) { payload.append("image", imageFile); payload.set("image_url", ""); }
    if (imageMode === "url") payload.append("image", "");
    void mutate(editingId ? `/api/products/${editingId}/update/` : "/api/products/create/", editingId ? "PUT" : "POST", payload, product => setProducts(old => editingId ? old.map(item => item.id === editingId ? product : item) : [product, ...old]), editingId ? "Product updated." : "Product created.");
  };
  const remove = product => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    void mutate(`/api/products/${product.id}/delete/`, "DELETE", null, () => setProducts(old => old.filter(item => item.id !== product.id)), "Product deleted.", false);
  };
  const change = event => setForm(old => ({ ...old, [event.target.name]: event.target.value }));
  const openCategory = (event, item = null, parent = "") => { trigger.current = event.currentTarget; setCategoryName(item?.name || ""); setCategoryParent(String(item?.parent || parent || "")); setCategoryEditingId(item?.id || null); setFormError(""); setEditor("category"); };
  const saveCategory = event => { event.preventDefault(); if (!categoryName.trim()) { setFormError("Enter a category name."); return; } void mutate(categoryEditingId ? `/api/categories/${categoryEditingId}/update/` : "/api/categories/create/", categoryEditingId ? "PATCH" : "POST", { name: categoryName.trim(), parent: categoryParent ? Number(categoryParent) : null }, item => { setCategories(old => categoryEditingId ? old.map(existing => existing.id === item.id ? item : existing.parent === item.id ? { ...existing, parent_name: item.name, parent_slug: item.slug } : existing) : [...old, item]); setProducts(old => old.map(product => product.category.id === item.id ? { ...product, category: item } : product.category.parent === item.id ? { ...product, category: { ...product.category, parent_name: item.name } } : product)); }, "Category saved."); };
  const deleteCategory = item => { if (window.confirm(`Delete ${categoryLabel(item)}? Categories containing products or subcategories cannot be deleted.`)) void mutate(`/api/categories/${item.id}/delete/`, "DELETE", null, () => setCategories(old => old.filter(existing => existing.id !== item.id)), "Category deleted.", false); };
  const chooseImage = event => { const file = event.target.files?.[0]; if (!file) return; if (!/\.(jpe?g|png|webp|gif)$/i.test(file.name) || file.size > 10 * 1024 * 1024) { setFormError("Choose a JPG, PNG, WebP, or GIF image under 10 MB."); setImageFile(null); setImagePreview(""); event.target.value = ""; return; } setFormError(""); setImageFile(file); setImagePreview(URL.createObjectURL(file)); };
  const visible = products.filter(product => `${product.name} ${categoryLabel(product.category)}`.toLowerCase().includes(query.toLowerCase().trim()) && (category === "all" || String(product.category?.id) === category || String(product.category?.parent) === category) && (stock === "all" || (stock === "low" ? Number(product.stock) <= 5 : stock === "out" ? Number(product.stock) === 0 : Number(product.stock) > 0)));
  const restoreFocus = event => { event.preventDefault(); const target = trigger.current?.isConnected ? trigger.current : addButton.current; target?.focus(); };
  return <AdminShell title={categoryView ? "Categories & subcategories" : "Your collection"} description="Keep every piece, category, and stock count in order." actions={<><button className="admin-icon-button" disabled={loading || busy} onClick={() => void load()} aria-label="Refresh catalog"><RefreshCw size={17} /></button><button className="admin-button" disabled={loading || busy} onClick={event => openCategory(event)}><FolderPlus size={16} />Add category</button><button ref={addButton} className="admin-button admin-button-primary" disabled={loading || busy} onClick={event => openProduct(event)}><Plus size={16} />Add product</button></>}>
    {process.env.NEXT_PUBLIC_CATALOG_MODE === "demo" && <div className="admin-notice">You are managing live inventory. The storefront currently shows a separate sample clothing collection.</div>}
    <AdminNotice error={error} message={message} />
    {!categoryView && <div className="admin-toolbar"><label className="admin-field admin-search"><span>Find a product</span><Search size={16} /><input placeholder="Search by name or category" value={query} onChange={event => filter("q", event.target.value)} /></label><label className="admin-field"><span>Category</span><select value={category} onChange={event => filter("category", event.target.value)}><option value="all">All categories</option>{categories.map(item => <option key={item.id} value={item.id}>{categoryLabel(item)}</option>)}</select></label><label className="admin-field"><span>Availability</span><select value={stock} onChange={event => filter("stock", event.target.value)}><option value="all">All stock</option><option value="available">In stock</option><option value="low">Low stock (5 or fewer)</option><option value="out">Out of stock</option></select></label></div>}
    {loading ? <AdminLoading /> : categoryView ? <AdminCategoryTree categories={categories} busy={busy} onEdit={(event, item) => openCategory(event, item)} onAdd={(event, parent) => openCategory(event, null, parent)} onDelete={deleteCategory} /> : <AdminPanel title={`Products (${visible.length})`} description={`${categories.length} categories · ${products.length} products in your catalog`}>
      {!visible.length ? <AdminEmpty title={products.length ? "No matching pieces" : "Your collection starts here"}>{products.length ? "Try another search or adjust the filters." : "Add a category, then create your first product."}</AdminEmpty> : <div className="admin-table-scroll" tabIndex={0} role="region" aria-label="Product inventory"><table className="admin-table"><thead><tr>{["Product", "Category", "Price", "Stock", "Actions"].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{visible.map(product => <tr key={product.id}><td><div className="admin-product-cell">{product.image_url ? <img src={product.image_url} alt="" className="admin-product-thumb" loading="lazy" /> : <span className="admin-product-thumb"><Package size={20} /></span>}<div><strong>{product.name}</strong><small>#{product.id}</small></div></div></td><td>{categoryLabel(product.category)}</td><td>{money(product.price)}</td><td><span className={`admin-badge ${Number(product.stock) === 0 ? "admin-badge-out" : Number(product.stock) <= 5 ? "admin-badge-low" : ""}`}>{product.stock} units</span></td><td><div className="admin-actions"><button disabled={busy} onClick={event => openProduct(event, product)} className="admin-icon-button" aria-label={`Edit ${product.name}`}><Edit2 size={16} /></button><button disabled={busy} onClick={() => remove(product)} className="admin-icon-button admin-button-danger" aria-label={`Delete ${product.name}`}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>}
    </AdminPanel>}
    <Dialog open={showProduct} onOpenChange={open => { if (!open) close(); }}><DialogContent className="admin-dialog" onCloseAutoFocus={restoreFocus}><DialogTitle>{editingId ? "Edit your piece" : "Add a new piece"}</DialogTitle><DialogDescription className="admin-dialog-description">Product details appear in the live storefront. Fields marked * are required.</DialogDescription><AdminNotice error={formError} /><form onSubmit={saveProduct}><div className="admin-form-grid">
      <label className="admin-field"><span>Product name *</span><input name="name" required value={form.name} onChange={change} /></label>
      <div className="admin-field admin-form-wide"><span>Product URL (slug)</span>{editingId && products.find(item => item.id === editingId)?.slug ? <a className="break-all text-sm underline" href={`/product/${products.find(item => item.id === editingId).slug}`} target="_blank" rel="noreferrer">/product/{products.find(item => item.id === editingId).slug}</a> : <small>Generated automatically when you save, for example /product/cotton-shirt-23.</small>}<small>Slugs are unique and stay the same when you rename a product.</small></div>
      <label className="admin-field"><span>Category *</span><select required value={department} onChange={event => { setDepartment(event.target.value); setForm(old => ({ ...old, category_id: "" })); }}><option value="">Choose Men, Women, or Kids</option>{roots.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="admin-field admin-form-wide"><span>Subcategory *</span><select name="category_id" required value={form.category_id} onChange={change} disabled={!department}><option value="">Choose a clothing subcategory</option>{subcategories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{department && !subcategories.length && <small>Add a subcategory in Categories before creating a product here.</small>}</label>
      <label className="admin-field"><span>Price ($) *</span><input type="number" name="price" min="0" step="0.01" required value={form.price} onChange={change} /></label>
      <label className="admin-field"><span>Stock quantity *</span><input type="number" name="stock" min="0" step="1" required value={form.stock} onChange={change} /></label>
      <label className="admin-field admin-form-wide"><span>Description</span><textarea name="description" value={form.description} onChange={change} placeholder="Describe the fit, fabric, and details of this piece." /></label>
      <fieldset className="admin-form-wide"><legend className="mb-3 text-xs font-semibold">Product photograph</legend><div className="mb-4 flex flex-wrap gap-5 text-sm"><label className="flex min-h-11 items-center gap-2"><input type="radio" name="image_source" checked={imageMode === "upload"} onChange={() => setImageMode("upload")} />Upload photo</label><label className="flex min-h-11 items-center gap-2"><input type="radio" name="image_source" checked={imageMode === "url"} onChange={() => setImageMode("url")} />Use image URL</label></div>{imageMode === "upload" ? <label className="admin-field"><span>Choose a photo</span><input type="file" accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif" onChange={chooseImage} /><small>JPG/JPEG, PNG, WebP, or GIF · Maximum 10 MB. Uploading replaces the current photo; leave empty to keep it.</small></label> : <label className="admin-field"><span>Image URL</span><input type="url" name="image_url" value={form.image_url} onChange={change} placeholder="https://…" /><small>Saving this option replaces any uploaded photo.</small></label>}{(imageMode === "upload" ? imagePreview || form.image_url : form.image_url) && <img className="mt-4 h-40 w-32 rounded border border-border object-cover" src={imageMode === "upload" ? imagePreview || form.image_url : form.image_url} alt="Product photograph preview" />}</fieldset>
    </div><div className="admin-form-actions"><button type="button" className="admin-button" disabled={busy} onClick={close}>Cancel</button><button className="admin-button admin-button-primary" disabled={busy || loading}>{busy ? "Saving…" : editingId ? "Save changes" : "Create product"}</button></div></form></DialogContent></Dialog>
    <Dialog open={editor === "category"} onOpenChange={open => { if (!open) close(); }}><DialogContent className="admin-dialog max-w-lg" onCloseAutoFocus={restoreFocus}><DialogTitle>{categoryEditingId ? "Edit category" : "Organize your collection"}</DialogTitle><DialogDescription className="admin-dialog-description">Create a main category such as Men, Women, or Kids, or choose a parent for a clothing subcategory.</DialogDescription><AdminNotice error={formError} /><form onSubmit={saveCategory}><label className="admin-field"><span>Parent category</span><select value={categoryParent} onChange={event => setCategoryParent(event.target.value)}><option value="">None — main category</option>{roots.filter(item => item.id !== categoryEditingId).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="admin-field mt-5"><span>{categoryParent ? "Subcategory" : "Category"} name *</span><input required maxLength={100} value={categoryName} onChange={event => setCategoryName(event.target.value)} placeholder={categoryParent ? "e.g. Jackets or Trousers" : "e.g. Men, Women, or Kids"} /></label><div className="admin-field mt-5"><span>Category URL (slug)</span>{categoryEditingId ? <a className="break-all text-sm underline" href={`/products?category=${categories.find(item => item.id === categoryEditingId)?.slug}`} target="_blank" rel="noreferrer">/products?category={categories.find(item => item.id === categoryEditingId)?.slug}</a> : <small>Generated from the category and parent names, for example men-jackets.</small>}<small>Existing slugs stay the same after renaming, so saved links still work.</small></div><div className="admin-form-actions"><button type="button" className="admin-button" disabled={busy} onClick={close}>Cancel</button><button className="admin-button admin-button-primary" disabled={busy}>{busy ? "Saving…" : "Save category"}</button></div></form></DialogContent></Dialog>
  </AdminShell>;
}
