"use client";

import { FormEvent, useEffect, useState } from "react";
import { Protected } from "../../../components/Protected";
import { EmptyState, ErrorMessage, Field, PageHeader, inputClass } from "../../../components/ui";
import { api, type Category } from "../../../lib/api";

const emptyForm = { name: "", slug: "", description: "" };

function AdminCategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setCategories(await api.getCategories());
  };

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Cannot load categories"));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api.updateCategory(editingId, form);
      } else {
        await api.createCategory(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot save category");
    }
  };

  const edit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? ""
    });
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this category?")) {
      return;
    }

    try {
      await api.deleteCategory(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot delete category");
    }
  };

  return (
    <div>
      <PageHeader title="Admin categories" description="Create and maintain product categories." />
      <ErrorMessage message={error} />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form className="space-y-4 rounded-lg border border-slate-200 bg-white p-5" onSubmit={submit}>
          <h2 className="font-semibold">{editingId ? "Edit category" : "New category"}</h2>
          <Field label="Name">
            <input className={inputClass} onChange={(event) => setForm({ ...form, name: event.target.value })} required value={form.name} />
          </Field>
          <Field label="Slug">
            <input className={inputClass} onChange={(event) => setForm({ ...form, slug: event.target.value })} value={form.slug} />
          </Field>
          <Field label="Description">
            <textarea className={inputClass} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} value={form.description} />
          </Field>
          <div className="flex gap-2">
            <button className="rounded-md bg-rosewood px-4 py-2 text-white" type="submit">
              Save
            </button>
            {editingId && (
              <button
                className="rounded-md border border-slate-300 px-4 py-2"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                type="button"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        <section>
          {categories.length === 0 ? (
            <EmptyState message="No categories." />
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              {categories.map((category) => (
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between" key={category.id}>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-slate-500">{category.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-md border border-slate-300 px-3 py-2 text-sm" onClick={() => edit(category)} type="button">
                      Edit
                    </button>
                    <button className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700" onClick={() => remove(category.id)} type="button">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <Protected adminOnly>
      <AdminCategoriesContent />
    </Protected>
  );
}
