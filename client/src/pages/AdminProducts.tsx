import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit2, Plus } from "lucide-react";

export default function AdminProducts() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titleTh: "",
    titleEn: "",
    slug: "",
    description: "",
    descriptionTh: "",
    price: "",
    discountPrice: "",
    imageUrl: "",
    purchaseLink: "",
    category: "",
  });

  const productsQuery = trpc.products.list.useQuery();
  const createMutation = trpc.products.admin.create.useMutation({
    onSuccess: () => {
      productsQuery.refetch();
      resetForm();
    },
  });
  const updateMutation = trpc.products.admin.update.useMutation({
    onSuccess: () => {
      productsQuery.refetch();
      resetForm();
    },
  });
  const deleteMutation = trpc.products.admin.delete.useMutation({
    onSuccess: () => {
      productsQuery.refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      titleTh: "",
      titleEn: "",
      slug: "",
      description: "",
      descriptionTh: "",
      price: "",
      discountPrice: "",
      imageUrl: "",
      purchaseLink: "",
      category: "",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        ...formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">จัดการสินค้า</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus size={20} /> เพิ่มสินค้าใหม่
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="ชื่อหนังสือ (ไทย)"
                  value={formData.titleTh}
                  onChange={(e) => setFormData({ ...formData, titleTh: e.target.value })}
                  required
                />
                <Input
                  placeholder="ชื่อหนังสือ (อังกฤษ)"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                />
                <Input
                  placeholder="Slug (URL)"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
                <Input
                  placeholder="หมวดหมู่"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
                <Input
                  placeholder="ราคา"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                <Input
                  placeholder="ราคาลด"
                  type="number"
                  value={formData.discountPrice}
                  onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                />
              </div>
              <Textarea
                placeholder="คำอธิบาย (ไทย)"
                value={formData.descriptionTh}
                onChange={(e) => setFormData({ ...formData, descriptionTh: e.target.value })}
              />
              <Textarea
                placeholder="คำอธิบาย (อังกฤษ)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                placeholder="URL รูปปก"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                required
              />
              <Input
                placeholder="ลิงก์ซื้อ (Gumroad, etc)"
                value={formData.purchaseLink}
                onChange={(e) => setFormData({ ...formData, purchaseLink: e.target.value })}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "อัปเดต" : "สร้าง"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {productsQuery.data?.map((product) => (
          <Card key={product.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.titleTh} className="w-24 h-32 object-cover rounded" />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{product.titleTh}</h3>
                  <p className="text-sm text-gray-500">{product.titleEn}</p>
                  <p className="text-sm mt-2">{product.descriptionTh}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="font-bold">฿{product.price}</span>
                    {product.discountPrice && (
                      <span className="line-through text-gray-500">฿{product.discountPrice}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(product.id);
                      setFormData({
                        titleTh: product.titleTh,
                        titleEn: product.titleEn || "",
                        slug: product.slug,
                        description: product.description || "",
                        descriptionTh: product.descriptionTh || "",
                        price: product.price.toString(),
                        discountPrice: product.discountPrice?.toString() || "",
                        imageUrl: product.imageUrl,
                        purchaseLink: product.purchaseLink || "",
                        category: product.category || "",
                      });
                      setShowForm(true);
                    }}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate({ id: product.id })}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
