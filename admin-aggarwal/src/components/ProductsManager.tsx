"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GripVertical, Plus, Search, Trash2 } from "lucide-react";
import { ActiveToggle } from "@/components/CategoryFormDialog";
import { AdminDialog } from "@/components/AdminDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatProductVariantPrices, compareProductsByCatalogOrder } from "@/lib/product-utils";
import type { Category, ProductWithCategory } from "@/lib/firebase/types";
import { reorderProducts, restoreProduct, softDeleteProduct, updateProduct } from "@/lib/firebase/db";

interface ProductsManagerProps {
  products: ProductWithCategory[];
  deletedProducts: ProductWithCategory[];
  categories: Category[];
}

function matchesSearch(product: ProductWithCategory, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (product.name.toLowerCase().includes(q)) return true;
  if (product.title?.toLowerCase().includes(q)) return true;
  return (product.keywords ?? []).some((keyword) => keyword.toLowerCase().includes(q));
}

export function ProductsManager({
  products: initial,
  deletedProducts: initialDeleted,
  categories,
}: ProductsManagerProps) {
  const [items, setItems] = useState(initial);
  const [deletedItems] = useState(initialDeleted);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dragId, setDragId] = useState<string | null>(null);
  const [binOpen, setBinOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductWithCategory | null>(null);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories],
  );

  const visibleProducts = useMemo(() => {
    const filtered = items
      .filter((product) => matchesSearch(product, search))
      .filter((product) => categoryFilter === "all" || product.categoryId === categoryFilter);

    if (categoryFilter === "all") {
      return [...filtered].sort(compareProductsByCatalogOrder);
    }

    return filtered.sort((a, b) => a.order - b.order);
  }, [items, search, categoryFilter]);

  const canReorder = categoryFilter !== "all" && !search.trim();

  const persistOrder = useCallback(
    async (ordered: ProductWithCategory[]) => {
      await reorderProducts(ordered.map((product, index) => ({ id: product.id, order: index })));
    },
    [],
  );

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId || !canReorder) return;

    const categoryProducts = items
      .filter((product) => product.categoryId === categoryFilter)
      .sort((a, b) => a.order - b.order);

    const from = categoryProducts.findIndex((product) => product.id === dragId);
    const to = categoryProducts.findIndex((product) => product.id === targetId);
    if (from < 0 || to < 0) return;

    const next = [...categoryProducts];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    const orderMap = new Map(next.map((product, index) => [product.id, index]));
    setItems((prev) =>
      prev.map((product) =>
        orderMap.has(product.id) ? { ...product, order: orderMap.get(product.id)! } : product,
      ),
    );
    setDragId(null);
    void persistOrder(next);
  };

  const patchProduct = async (id: string, patch: { active?: boolean; isAvailable?: boolean }) => {
    setBusyId(id);
    const updated = await updateProduct(id, patch);
    if (updated) {
      setItems((prev) =>
        prev.map((product) =>
          product.id === id
            ? { ...product, active: updated.active, isAvailable: updated.isAvailable }
            : product,
        ),
      );
    }
    setBusyId(null);
  };

  const toggleActive = (product: ProductWithCategory) => {
    void patchProduct(product.id, { active: !product.active });
  };

  const toggleOutOfStock = (product: ProductWithCategory) => {
    void patchProduct(product.id, { isAvailable: !product.isAvailable });
  };

  const softDelete = async (product: ProductWithCategory) => {
    setBusyId(product.id);
    await softDeleteProduct(product.id);
    setItems((prev) => prev.filter((p) => p.id !== product.id));
    setDeleteTarget(null);
    setBusyId(null);
  };

  const restore = async (product: ProductWithCategory) => {
    setBusyId(product.id);
    await restoreProduct(product.id);
    window.location.reload();
    setBusyId(null);
  };

  return (
    <div className="admin-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative min-w-0 flex-1 max-w-md">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ui-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or keywords…"
            className="admin-input pl-9"
          />
        </div>
        <div className="flex shrink-0 gap-3">
          <button type="button" onClick={() => setBinOpen(true)} className="admin-btn-secondary">
            <Trash2 size={16} /> Bin
            {deletedItems.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-xs text-primary">
                {deletedItems.length}
              </span>
            )}
          </button>
          <Link href="/products/new" className="admin-btn-primary">
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`admin-chip transition-colors ${
              categoryFilter === "all"
                ? "border-primary bg-primary/10 text-primary"
                : "hover:bg-[var(--ui-surface-hover)]"
            }`}
          >
            All
          </button>
          {sortedCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryFilter(category.id)}
              className={`admin-chip transition-colors ${
                categoryFilter === category.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "hover:bg-[var(--ui-surface-hover)]"
              }`}
            >
              {category.name}
            </button>
          ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {canReorder && <th className="w-10" />}
              <th>Name</th>
              {categoryFilter === "all" && <th>Category</th>}
              <th>Variants</th>
              <th>Out of stock</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((product) => (
              <tr
                key={product.id}
                draggable={canReorder}
                onDragStart={() => canReorder && setDragId(product.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => canReorder && e.preventDefault()}
                onDrop={() => handleDrop(product.id)}
                className={dragId === product.id ? "opacity-50" : ""}
              >
                {canReorder && (
                  <td className="text-ui-faint">
                    <GripVertical size={16} className="cursor-grab active:cursor-grabbing" />
                  </td>
                )}
                <td className="font-medium">{product.name}</td>
                {categoryFilter === "all" && (
                  <td className="text-ui-muted">{product.category.name}</td>
                )}
                <td>{formatProductVariantPrices(product)}</td>
                <td>
                  <ActiveToggle
                    checked={!product.isAvailable}
                    onChange={() => toggleOutOfStock(product)}
                    label={`Out of stock ${product.name}`}
                  />
                </td>
                <td>
                  <ActiveToggle
                    checked={product.active}
                    onChange={() => toggleActive(product)}
                    label={`Active ${product.name}`}
                  />
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/products/edit?id=${product.id}`}
                      className={`admin-btn-text ${busyId === product.id ? "pointer-events-none opacity-50" : ""}`}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={busyId === product.id}
                      onClick={() => setDeleteTarget(product)}
                      className="admin-btn-text"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleProducts.length === 0 && (
          <p className="admin-empty">
            {items.length === 0
              ? "No products yet. Run the seed script or add manually."
              : "No products match your search or filter."}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product"
        message={
          deleteTarget
            ? `Move "${deleteTarget.name}" to bin? You can restore it later from the Bin.`
            : ""
        }
        confirmLabel="Move to bin"
        cancelLabel="Cancel"
        variant="danger"
        loading={Boolean(deleteTarget && busyId === deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && void softDelete(deleteTarget)}
      />

      <AdminDialog open={binOpen} title="Bin" onClose={() => setBinOpen(false)}>
        <div className="px-6 py-5">
          {deletedItems.length === 0 ? (
            <p className="text-sm text-ui-muted">No deleted products.</p>
          ) : (
            <ul className="space-y-3">
              {deletedItems.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-ui-border px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-ui-text">{product.name}</p>
                    <p className="text-xs text-ui-muted">{product.category.name}</p>
                  </div>
                  <button
                    type="button"
                    disabled={busyId === product.id}
                    onClick={() => restore(product)}
                    className="admin-btn-ghost text-sm"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </AdminDialog>
    </div>
  );
}
