import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit2, Plus } from "lucide-react";

export default function AdminBlog() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    imageUrl: "",
    category: "",
    author: "",
    isPublished: 1,
  });

  const postsQuery = trpc.blog.list.useQuery({ page: 1, limit: 100 });
  const createMutation = trpc.blog.admin.create.useMutation({
    onSuccess: () => {
      postsQuery.refetch();
      resetForm();
    },
  });
  const updateMutation = trpc.blog.admin.update.useMutation({
    onSuccess: () => {
      postsQuery.refetch();
      resetForm();
    },
  });
  const deleteMutation = trpc.blog.admin.delete.useMutation({
    onSuccess: () => {
      postsQuery.refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      imageUrl: "",
      category: "",
      author: "",
      isPublished: 1,
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
        <h1 className="text-3xl font-bold">จัดการบทความ</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus size={20} /> เพิ่มบทความใหม่
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "แก้ไขบทความ" : "เพิ่มบทความใหม่"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="ชื่อบทความ"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <Input
                  placeholder="Slug (URL)"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
                <Input
                  placeholder="ผู้เขียน"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
                <Input
                  placeholder="หมวดหมู่"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <Textarea
                placeholder="บทคัดย่อ"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
              />
              <Textarea
                placeholder="เนื้อหาบทความ (HTML หรือ Markdown)"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                required
              />
              <Input
                placeholder="URL รูปภาพ"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPublished === 1}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked ? 1 : 0 })}
                />
                <label>เผยแพร่</label>
              </div>
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
        {postsQuery.data?.posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                {post.imageUrl && (
                  <img src={post.imageUrl} alt={post.title} className="w-24 h-24 object-cover rounded" />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{post.title}</h3>
                  <p className="text-sm text-gray-500">โดย {post.author || "ไม่ระบุ"}</p>
                  <p className="text-sm mt-2">{post.excerpt}</p>
                  <div className="flex gap-2 mt-2">
                    {post.category && <span className="text-xs bg-gray-200 px-2 py-1 rounded">{post.category}</span>}
                    {post.isPublished === 1 && <span className="text-xs bg-green-200 px-2 py-1 rounded">เผยแพร่แล้ว</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(post.id);
                      setFormData({
                        title: post.title,
                        slug: post.slug,
                        content: post.content,
                        excerpt: post.excerpt || "",
                        imageUrl: post.imageUrl || "",
                        category: post.category || "",
                        author: post.author || "",
                        isPublished: post.isPublished,
                      });
                      setShowForm(true);
                    }}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate({ id: post.id })}
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
