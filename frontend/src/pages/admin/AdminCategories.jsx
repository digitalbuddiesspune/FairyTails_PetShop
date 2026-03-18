import { useEffect, useMemo, useState } from "react";
import { Edit2, Plus, Trash2, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_BACKEND_API;

const EMPTY_FORM = {
  name: "",
  slug: "",
  image: "",
  subcategoriesText: "",
};

const normalizeSlug = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[&]/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseSubcategories = (text) => {
  if (!text.trim()) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, subSubPart = ""] = line.split("|");
      const name = String(namePart || "").trim();
      if (!name) return null;

      const subSubCategories = subSubPart
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);

      return { name, subSubCategories };
    })
    .filter(Boolean);
};

const formatSubcategories = (subcategories = []) =>
  subcategories
    .map((sub) => {
      const name = sub?.name || "";
      const subSub = Array.isArray(sub?.subSubCategories)
        ? sub.subSubCategories.join(", ")
        : "";
      return subSub ? `${name} | ${subSub}` : name;
    })
    .join("\n");

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(EMPTY_FORM);

  const token = localStorage.getItem("adminToken");

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [categories]
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/categories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setCategories(Array.isArray(data.data) ? data.data : []);
      } else {
        setError(data.message || "Failed to fetch categories");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Error fetching categories");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingCategory(null);
    setError("");
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category?.name || "",
      slug: category?.slug || "",
      image: category?.image || "",
      subcategoriesText: formatSubcategories(category?.subcategories || []),
    });
    setError("");
    setShowModal(true);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const name = formData.name.trim();
    if (!name) {
      setError("Category name is required");
      return;
    }

    const slug = normalizeSlug(formData.slug || name);
    const payload = {
      name,
      image: formData.image.trim(),
      subcategories: parseSubcategories(formData.subcategoriesText),
    };

    if (!editingCategory) {
      payload.slug = slug;
    }

    try {
      setSubmitting(true);
      const url = editingCategory
        ? `${API_BASE}/categories/${editingCategory.slug}`
        : `${API_BASE}/categories`;
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Unable to save category");
        return;
      }

      await fetchCategories();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Error saving category:", err);
      setError("Error saving category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    try {
      const res = await fetch(`${API_BASE}/categories/${category.slug}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Unable to delete category");
        return;
      }

      setDeleteConfirm(null);
      await fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Error deleting category");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-100">
          {error}
        </div>
      )}

      {sortedCategories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <span className="text-5xl mb-4 block">📂</span>
          <p className="text-gray-500 text-lg font-medium">No categories yet</p>
          <p className="text-gray-400 text-sm mt-1">Organize your products into categories</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category Name</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedCategories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-16 h-10 object-cover rounded-md border border-gray-200"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">No image</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {category.name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                          title="Edit Category"
                        >
                          <Edit2 size={13} />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(category)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
                          title="Delete Category"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  placeholder="e.g. Dogs"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug {editingCategory ? "(readonly while editing)" : "*"}
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="e.g. dogs"
                  disabled={Boolean(editingCategory)}
                  required={!editingCategory}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleChange("image", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subcategories
                </label>
                <textarea
                  rows={8}
                  value={formData.subcategoriesText}
                  onChange={(e) => handleChange("subcategoriesText", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  placeholder={"Dry Food\nTreats | Dental Treats, Biscuits\nWet Food"}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use one subcategory per line. Optional sub-subcategories can be added as
                  `Subcategory | sub1, sub2`.
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {submitting
                    ? editingCategory
                      ? "Updating..."
                      : "Creating..."
                    : editingCategory
                      ? "Update Category"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <h4 className="text-lg font-bold text-gray-900 mb-2">Delete Category</h4>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete <b>{deleteConfirm.name}</b>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default AdminCategories;
