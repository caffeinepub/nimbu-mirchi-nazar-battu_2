import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Loader2, Package, Plus, Trash2, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ProductCategory } from "../../backend.d";
import type { Product, ProductInput } from "../../backend.d";
import {
  ExternalBlob,
  useAddProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "../../hooks/useQueries";
import { formatRupees } from "../../utils/format";

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: ProductCategory;
  isActive: boolean;
  imageFile: File | null;
  imageUrl: string;
};

const DEFAULT_FORM: ProductFormData = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: ProductCategory.home,
  isActive: true,
  imageFile: null,
  imageUrl: "",
};

export function ProductsAdminPage() {
  const { data: products, isLoading } = useProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(DEFAULT_FORM);
  const [uploadProgress, setUploadProgress] = useState(0);

  const openAdd = () => {
    setEditingProduct(null);
    setForm(DEFAULT_FORM);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: (Number(product.price) / 100).toString(),
      stock: Number(product.stock).toString(),
      category: product.category,
      isActive: product.isActive,
      imageFile: null,
      imageUrl: product.image.getDirectURL(),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      let imageBlob: ExternalBlob;

      if (form.imageFile) {
        const bytes = new Uint8Array(await form.imageFile.arrayBuffer());
        imageBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) =>
          setUploadProgress(p),
        );
      } else if (editingProduct) {
        imageBlob = ExternalBlob.fromURL(editingProduct.image.getDirectURL());
      } else {
        toast.error("Please add a product image");
        return;
      }

      const input: ProductInput = {
        name: form.name,
        description: form.description,
        price: BigInt(Math.round(Number.parseFloat(form.price) * 100)),
        stock: BigInt(Number.parseInt(form.stock)),
        category: form.category,
        isActive: form.isActive,
        image: imageBlob,
      };

      if (editingProduct) {
        await updateProduct.mutateAsync({
          productId: editingProduct.id,
          input,
        });
        toast.success("Product updated!");
      } else {
        await addProduct.mutateAsync(input);
        toast.success("Product added!");
      }

      setShowModal(false);
      setUploadProgress(0);
    } catch {
      toast.error("Failed to save product. Please try again.");
      setUploadProgress(0);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const isPending = addProduct.isPending || updateProduct.isPending;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Products
          </h1>
          <p className="text-muted-foreground text-sm">
            {products?.filter((p) => p.isActive).length ?? 0} active products
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gold-gradient text-foreground border-0 font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </motion.div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
            <div
              key={k}
              className="bg-card rounded-2xl border border-border overflow-hidden"
            >
              <Skeleton className="h-40 w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (products ?? []).length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            No products yet. Add your first product!
          </p>
          <Button
            onClick={openAdd}
            className="mt-4 gold-gradient text-foreground border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(products ?? []).map((product, i) => (
            <motion.div
              key={product.id.toString()}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl border border-border overflow-hidden shadow-card"
            >
              <div className="relative h-40 bg-muted overflow-hidden">
                <img
                  src={product.image.getDirectURL()}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1.5">
                  {!product.isActive && (
                    <Badge className="bg-red-100 text-red-800 border-0 text-xs">
                      Inactive
                    </Badge>
                  )}
                  {Number(product.stock) <= 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-foreground text-sm leading-tight">
                    {product.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-xs ml-2 shrink-0 capitalize"
                  >
                    {product.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gold-700">
                    {formatRupees(product.price)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Number(product.stock)} in stock
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(product)}
                    className="flex-1 h-8 text-xs"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(product)}
                    disabled={deleteProduct.isPending}
                    className="h-8 text-xs border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={(o) => !o && setShowModal(false)}>
        <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="p-name">Product Name *</Label>
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Home Nazar Battu Premium"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="p-desc">Description</Label>
              <Textarea
                id="p-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Traditional handcrafted nazar battu..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="p-price">Price (₹) *</Label>
                <Input
                  id="p-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="50"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="p-stock">Stock *</Label>
                <Input
                  id="p-stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock: e.target.value }))
                  }
                  placeholder="100"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as ProductCategory }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProductCategory.home}>🏠 Home</SelectItem>
                  <SelectItem value={ProductCategory.shop}>🏪 Shop</SelectItem>
                  <SelectItem value={ProductCategory.car}>🚗 Car</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="p-image">
                Product Image {!editingProduct && "*"}
              </Label>
              <div className="mt-1">
                {(form.imageUrl || form.imageFile) && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden mb-2 bg-muted">
                    <img
                      src={
                        form.imageFile
                          ? URL.createObjectURL(form.imageFile)
                          : form.imageUrl
                      }
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {form.imageFile ? form.imageFile.name : "Upload image"}
                  </span>
                  <input
                    id="p-image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setForm((f) => ({ ...f, imageFile: file }));
                    }}
                  />
                </label>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="p-active"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
              <Label htmlFor="p-active" className="text-sm">
                Active (visible to customers)
              </Label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 gold-gradient text-foreground border-0 font-semibold"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {editingProduct ? "Update" : "Add Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
