import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BundleFormData {
  id?: number;
  name: string;
  nameTh: string;
  description: string;
  descriptionTh: string;
  minBooks: number;
  discountPercent: number;
  isActive: number;
}

const defaultForm: BundleFormData = {
  name: "",
  nameTh: "",
  description: "",
  descriptionTh: "",
  minBooks: 2,
  discountPercent: 10,
  isActive: 1,
};

export default function AdminBundles() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<BundleFormData>(defaultForm);

  const { data: bundles, isLoading, refetch } = trpc.admin.listBundleDeals.useQuery();
  const utils = trpc.useUtils();

  const upsert = trpc.admin.upsertBundleDeal.useMutation({
    onSuccess: () => {
      toast.success(form.id ? "อัปเดตโปรโมชั่นสำเร็จ" : "เพิ่มโปรโมชั่นสำเร็จ");
      refetch();
      utils.bundleDeals.list.invalidate();
      setIsDialogOpen(false);
      setForm(defaultForm);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.deleteBundleDeal.useMutation({
    onSuccess: () => {
      toast.success("ลบโปรโมชั่นสำเร็จ");
      refetch();
      utils.bundleDeals.list.invalidate();
      setDeleteId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleEdit = (bundle: any) => {
    setForm({
      id: bundle.id,
      name: bundle.name,
      nameTh: bundle.nameTh,
      description: bundle.description ?? "",
      descriptionTh: bundle.descriptionTh ?? "",
      minBooks: bundle.minBooks,
      discountPercent: Number(bundle.discountPercent),
      isActive: bundle.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.nameTh || !form.minBooks || form.discountPercent <= 0) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    upsert.mutate(form);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">ชุดโปรโมชั่น</h1>
          <p className="text-gray-400 text-sm mt-1">จัดการส่วนลดสำหรับการซื้อหลายเล่ม</p>
        </div>
        <Button
          onClick={() => { setForm(defaultForm); setIsDialogOpen(true); }}
          className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มโปรโมชั่น
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-amber-400/5 border-amber-400/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Tag className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 text-sm font-medium">วิธีการทำงานของโปรโมชั่น</p>
              <p className="text-gray-400 text-xs mt-1">
                เมื่อลูกค้าเพิ่มหนังสือในตะกร้าครบตามจำนวนที่กำหนด ระบบจะคำนวณส่วนลดให้อัตโนมัติ
                โดยใช้โปรโมชั่นที่ให้ส่วนลดสูงสุดที่ตรงเงื่อนไข
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bundle List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !bundles?.length ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-16 text-center">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">ยังไม่มีโปรโมชั่น</p>
            <Button
              onClick={() => { setForm(defaultForm); setIsDialogOpen(true); }}
              className="mt-4 bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มโปรโมชั่นแรก
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bundles.map(bundle => (
            <Card key={bundle.id} className={`border transition-all ${bundle.isActive ? "bg-slate-800 border-slate-700 hover:border-amber-400/30" : "bg-slate-800/50 border-slate-700/50 opacity-60"}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={bundle.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}>
                        {bundle.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </div>
                    <h3 className="text-white font-bold text-lg">{bundle.nameTh}</h3>
                    <p className="text-gray-400 text-xs">{bundle.name}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-amber-400 text-2xl font-bold">{Number(bundle.discountPercent)}%</p>
                    <p className="text-gray-500 text-xs">ส่วนลด</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 p-2 bg-slate-700/50 rounded">
                  <Package className="w-4 h-4 text-amber-400" />
                  <span className="text-gray-300 text-sm">ซื้อขั้นต่ำ <strong className="text-white">{bundle.minBooks} เล่ม</strong></span>
                </div>

                {bundle.descriptionTh && (
                  <p className="text-gray-400 text-xs mb-4 line-clamp-2">{bundle.descriptionTh}</p>
                )}

                <div className="flex gap-2 pt-3 border-t border-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(bundle)}
                    className="flex-1 text-gray-400 hover:text-white hover:bg-slate-700 text-xs"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    แก้ไข
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(bundle.id)}
                    className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    ลบ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={open => { if (!open) { setIsDialogOpen(false); setForm(defaultForm); } }}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{form.id ? "แก้ไขโปรโมชั่น" : "เพิ่มโปรโมชั่นใหม่"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">ชื่อ (ภาษาไทย) *</label>
                <Input
                  value={form.nameTh}
                  onChange={e => setForm({ ...form, nameTh: e.target.value })}
                  placeholder="เช่น ซื้อ 3 เล่ม ลด 15%"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">ชื่อ (ภาษาอังกฤษ)</label>
                <Input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Buy 3 Save 15%"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">จำนวนขั้นต่ำ (เล่ม) *</label>
                <Input
                  type="number"
                  min={1}
                  value={form.minBooks}
                  onChange={e => setForm({ ...form, minBooks: parseInt(e.target.value) || 1 })}
                  className="bg-slate-700 border-slate-600 text-white focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">ส่วนลด (%) *</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={form.discountPercent}
                  onChange={e => setForm({ ...form, discountPercent: parseFloat(e.target.value) || 0 })}
                  className="bg-slate-700 border-slate-600 text-white focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-xs mb-1 block">คำอธิบาย (ภาษาไทย)</label>
              <Textarea
                value={form.descriptionTh}
                onChange={e => setForm({ ...form, descriptionTh: e.target.value })}
                placeholder="รายละเอียดโปรโมชั่น..."
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 focus:border-amber-400 resize-none h-20"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-gray-400 text-sm">สถานะ:</label>
              <button
                onClick={() => setForm({ ...form, isActive: form.isActive ? 0 : 1 })}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? "bg-amber-400" : "bg-slate-600"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className={`text-sm ${form.isActive ? "text-amber-400" : "text-gray-500"}`}>
                {form.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => { setIsDialogOpen(false); setForm(defaultForm); }}
                className="flex-1 text-gray-400 hover:text-white hover:bg-slate-700"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={upsert.isPending}
                className="flex-1 bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold"
              >
                {upsert.isPending ? "กำลังบันทึก..." : form.id ? "อัปเดต" : "เพิ่มโปรโมชั่น"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              คุณต้องการลบโปรโมชั่นนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
