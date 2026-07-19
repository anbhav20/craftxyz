import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks.js';
import Modal from '../components/Modal.jsx';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  selectAllCategories,
  selectCategoriesStatus,
  selectCategoryMutationStatus,
} from '../../features/categories/categoriesSlice.js';

const EMPTY_FORM = { name: '', description: '', active: true };

function AdminCategories() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectAllCategories);
  const status = useAppSelector(selectCategoriesStatus);
  const mutationStatus = useAppSelector(selectCategoryMutationStatus);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const openCreate = () => {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
    setImage(null);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditingSlug(category.slug);
    setForm({ name: category.name, description: category.description || '', active: category.active });
    setImage(null);
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const fields = { ...form, active: String(form.active) };
    const thunk = editingSlug
      ? updateCategory({ slug: editingSlug, fields, image })
      : createCategory({ fields, image });
    const result = await dispatch(thunk);
    if (result.meta.requestStatus === 'fulfilled') setModalOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-[-.03em]">Categories</h1>
        <button
          className="rounded-full bg-[#141311] px-4 py-2 text-sm font-bold text-white hover:bg-[#6F9E23]"
          onClick={openCreate}
          type="button"
        >
          + New category
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {status === 'loading' && <p className="text-sm text-[#141311]/50">Loading…</p>}
        {status === 'succeeded' && categories.length === 0 && (
          <p className="text-sm text-[#141311]/50">No categories yet.</p>
        )}
        {categories.map((category) => (
          <div key={category.slug} className="rounded-2xl border border-[#141311]/10 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{category.name}</p>
                <p className="mt-1 text-xs text-[#141311]/50">{category.count} pieces</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 font-mono text-[10px] uppercase ${
                  category.active ? 'bg-[#6F9E23]/10 text-[#6F9E23]' : 'bg-[#141311]/5 text-[#141311]/40'
                }`}
              >
                {category.active ? 'Active' : 'Hidden'}
              </span>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                className="text-xs font-semibold text-[#6F9E23] hover:underline"
                onClick={() => openEdit(category)}
                type="button"
              >
                Edit
              </button>
              <button
                className="text-xs font-semibold text-[#d95743] hover:underline"
                onClick={() => {
                  if (window.confirm(`Delete "${category.name}"?`)) dispatch(deleteCategory(category.slug));
                }}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <Modal title={editingSlug ? 'Edit category' : 'New category'} onClose={() => setModalOpen(false)}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#141311]/70">Name</label>
              <input
                className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#141311]/70">Description</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
                rows={2}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#141311]/70">Image</label>
              <input
                className="mt-1 w-full text-sm"
                type="file"
                accept="image/*"
                onChange={(event) => setImage(event.target.files[0] || null)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm({ ...form, active: event.target.checked })}
              />
              Active (visible to customers)
            </label>
            <button
              className="w-full rounded-full bg-[#141311] px-4 py-3 text-sm font-bold text-white hover:bg-[#6F9E23] disabled:opacity-50"
              type="submit"
              disabled={mutationStatus === 'loading'}
            >
              {mutationStatus === 'loading' ? 'Saving…' : editingSlug ? 'Save changes' : 'Create category'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminCategories;
