import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks.js';
import Modal from '../components/Modal.jsx';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  selectAllProducts,
  selectProductsStatus,
  selectProductMutationStatus,
} from '../../features/products/productsSlice.js';
import { fetchCategories, selectAllCategories } from '../../features/categories/categoriesSlice.js';

const EMPTY_FORM = {
  title: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  featured: false,
  active: true,
};

function AdminProducts() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectAllProducts);
  const status = useAppSelector(selectProductsStatus);
  const mutationStatus = useAppSelector(selectProductMutationStatus);
  const categories = useAppSelector(selectAllCategories);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  const openCreate = () => {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
    setImages([]);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingSlug(product.slug);
    setForm({
      title: product.title,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: product.categorySlug || '',
      featured: Boolean(product.badge),
      active: product.active,
    });
    setImages([]);
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const fields = { ...form, featured: String(form.featured), active: String(form.active) };
    const thunk = editingSlug
      ? updateProduct({ slug: editingSlug, fields, images })
      : createProduct({ fields, images });
    const result = await dispatch(thunk);
    if (result.meta.requestStatus === 'fulfilled') setModalOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-[-.03em]">Products</h1>
        <button
          className="rounded-full bg-[#141311] px-4 py-2 text-sm font-bold text-white hover:bg-[#6F9E23]"
          onClick={openCreate}
          type="button"
        >
          + New product
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#141311]/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#141311]/10 font-mono text-[10px] uppercase tracking-widest text-[#141311]/45">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141311]/5">
            {status === 'loading' && (
              <tr>
                <td className="px-4 py-6 text-[#141311]/50" colSpan={6}>Loading…</td>
              </tr>
            )}
            {status === 'succeeded' && products.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-[#141311]/50" colSpan={6}>No products yet.</td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.slug}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img className="size-10 rounded-lg object-cover" src={product.image} alt="" />
                    <span className="font-semibold">{product.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#141311]/60">{product.category}</td>
                <td className="px-4 py-3">₹{product.price}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 font-mono text-[10px] uppercase ${
                      product.active ? 'bg-[#6F9E23]/10 text-[#6F9E23]' : 'bg-[#141311]/5 text-[#141311]/40'
                    }`}
                  >
                    {product.active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="mr-3 text-xs font-semibold text-[#6F9E23] hover:underline"
                    onClick={() => openEdit(product)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs font-semibold text-[#d95743] hover:underline"
                    onClick={() => {
                      if (window.confirm(`Delete "${product.title}"?`)) dispatch(deleteProduct(product.slug));
                    }}
                    type="button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editingSlug ? 'Edit product' : 'New product'} onClose={() => setModalOpen(false)}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#141311]/70">Title</label>
              <input
                className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#141311]/70">Description</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
                rows={3}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#141311]/70">Price</label>
                <input
                  className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#141311]/70">Stock</label>
                <input
                  className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) => setForm({ ...form, stock: event.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#141311]/70">Category</label>
              <select
                className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#141311]/70">
                Images {editingSlug && '(adds to existing — use the category/product API to remove one)'}
              </label>
              <input
                className="mt-1 w-full text-sm"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => setImages(event.target.files)}
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => setForm({ ...form, featured: event.target.checked })}
                />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setForm({ ...form, active: event.target.checked })}
                />
                Active (visible to customers)
              </label>
            </div>
            <button
              className="w-full rounded-full bg-[#141311] px-4 py-3 text-sm font-bold text-white hover:bg-[#6F9E23] disabled:opacity-50"
              type="submit"
              disabled={mutationStatus === 'loading'}
            >
              {mutationStatus === 'loading' ? 'Saving…' : editingSlug ? 'Save changes' : 'Create product'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminProducts;
