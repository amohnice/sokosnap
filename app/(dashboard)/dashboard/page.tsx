"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, Sparkles, Send, Copy, ExternalLink, 
  Package, ShoppingCart, BarChart3, Settings, 
  Loader2, Check, Share2, ShoppingBag, Pencil, Trash2,
  ImagePlus, X, Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { QRCodeSVG } from "qrcode.react";
import { DashboardNavbar } from "@/components/dashboard-navbar";

export default function DashboardPage() {
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [importText, setImportText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [qrOpen, setQrOpen] = useState(false);
  const [hostname, setHostname] = useState("sokosnap.com");
  
  // Product CRUD states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    stockCount: "",
    description: "",
    imageUrl: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    tagline: "",
    mpesaNumber: ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStore();
    if (typeof window !== "undefined") {
      setHostname(window.location.host);
    }
  }, []);

  const fetchStore = async () => {
    try {
      const res = await fetch("/api/stores");
      if (res.ok) {
        const data = await res.json();
        if (!data) return window.location.href = "/onboarding";
        setStore(data);
        fetchProducts();
        fetchOrders();
      }
    } catch (error) {
      toast.error("Failed to fetch store");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data);
    }
  };

  const fetchOrders = async () => {
    const res = await fetch("/api/orders/seller");
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success("Order updated");
        fetchOrders();
      }
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/stores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        toast.success("Store settings updated");
        setIsSettingsModalOpen(false);
        fetchStore();
      }
    } catch (error) {
      toast.error("Failed to update store");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickImport = async () => {
    if (!importText.trim()) return;
    setParsing(true);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: importText }),
      });
      if (res.ok) {
        const newProducts = await res.json();
        const bulkRes = await fetch("/api/products/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: newProducts }),
        });
        if (bulkRes.ok) {
          toast.success(`Imported ${newProducts.length} products!`);
          setImportText("");
          fetchProducts();
        }
      }
    } catch (error) {
      toast.error("Parsing failed");
    } finally {
      setParsing(false);
    }
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary configuration missing. Please check .env.local and RESTART your dev server.");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      
      if (res.ok) {
        const data = await res.json();
        setProductForm({ ...productForm, imageUrl: data.secure_url });
        toast.success("Image uploaded!");
      } else {
        toast.error("Upload failed. Check your connection or file size.");
      }
    } catch (error) {
      toast.error("Network error during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductForm({ name: "", price: "", stockCount: "", description: "", imageUrl: "" });
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      stockCount: product.stockCount.toString(),
      description: product.description || "",
      imageUrl: product.imageUrl || ""
    });
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Product deleted");
        fetchProducts();
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : "/api/products";
      const method = editingProduct ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          stockCount: parseInt(productForm.stockCount) || 0
        }),
      });

      if (res.ok) {
        toast.success(editingProduct ? "Product updated" : "Product created");
        setIsProductModalOpen(false);
        fetchProducts();
      }
    } catch (error) {
      toast.error("Process failed");
    } finally {
      setSubmitting(false);
    }
  };

  const copyStoreLink = () => {
    const url = `${window.location.origin}/store/${store.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const totalSales = orders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <>
      <DashboardNavbar storeSlug={store?.slug} />
      <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-6xl pb-28">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-8 bg-[#091515]/60 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl animate-slide-up text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="h-16 w-16 md:h-20 md:w-20 bg-primary p-4 md:p-5 text-primary-foreground flex items-center justify-center rounded-2xl md:rounded-[1.5rem] shadow-[0_0_30px_rgba(174,234,0,0.3)] animate-float">
              <ShoppingBag size={32} />
            </div>
            <div className="flex flex-col items-center md:items-start space-y-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight font-display text-brand-gradient leading-none">{store?.name}</h1>
              <p className="text-white/60 font-bold text-base md:text-xl italic leading-tight">
                {store?.tagline || "Your personalized boutique experience"}
              </p>
              <div 
                onClick={copyStoreLink}
                className="inline-flex items-center gap-2 mt-4 bg-white/5 border border-white/10 rounded-full px-5 py-2 group cursor-pointer hover:bg-white/10 hover:border-primary/30 transition-all shadow-inner"
              >
                 <LinkIcon size={14} className="text-primary group-hover:scale-110 transition-transform" />
                 <span className="text-[11px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">
                   {hostname}/store/{store?.slug}
                 </span>
                 <Copy size={12} className="text-white/20 group-hover:text-primary transition-all ml-1" />
              </div>
            </div>
          </div>
          <div className="flex flex-row md:flex-row gap-3 w-full md:w-auto justify-center">
            <Button 
              variant="outline" 
              onClick={() => {
                setSettingsForm({
                  name: store?.name || "",
                  tagline: store?.tagline || "",
                  mpesaNumber: store?.mpesaNumber || ""
                });
                setIsSettingsModalOpen(true);
              }} 
              className="rounded-xl h-12 border-white/10 bg-white/5 text-white hover:text-primary hover:border-primary/40 hover:bg-primary/15 transition-all font-bold group"
            >
              <Settings size={18} className="mr-2 text-primary group-hover:rotate-45 transition-transform" /> Settings
            </Button>
            <Button variant="default" onClick={() => setQrOpen(true)} className="rounded-xl h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-black shadow-lg shadow-primary/20 transition-transform active:scale-95">
              <Share2 size={18} className="mr-2" /> Share QR
            </Button>
          </div>
        </div>

      {/* Product Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto no-scrollbar rounded-[3rem] p-10 bg-[#091515]/95 backdrop-blur-3xl border border-white/10 shadow-3xl text-white">
          <DialogTitle className="text-3xl font-black font-display text-brand-gradient mb-2">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <form onSubmit={handleProductSubmit} className="space-y-5 mt-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-black tracking-widest text-white/40 px-1">Product Name</Label>
              <Input 
                required
                className="rounded-xl h-12 bg-white/5 border-white/10"
                value={productForm.name}
                onChange={e => setProductForm({ ...productForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black tracking-widest text-white/40 px-1">Price (KES)</Label>
                <Input 
                  required
                  type="number"
                  className="rounded-xl h-12 bg-white/5 border-white/10"
                  value={productForm.price}
                  onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black tracking-widest text-white/40 px-1">Stock</Label>
                <Input 
                  type="number"
                  className="rounded-xl h-12 bg-white/5 border-white/10"
                  value={productForm.stockCount}
                  onChange={e => setProductForm({ ...productForm, stockCount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
               <Label className="text-[10px] uppercase font-black tracking-widest text-white/40 px-1">Description (Optional)</Label>
               <Input 
                className="rounded-xl h-12 bg-white/5 border-white/10"
                value={productForm.description}
                onChange={e => setProductForm({ ...productForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
               <Label className="text-[10px] uppercase font-black tracking-widest text-white/40 px-1">Product Image</Label>
               {productForm.imageUrl ? (
                 <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group/img shadow-2xl">
                   <img src={productForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                   <button 
                    type="button"
                    onClick={() => setProductForm({ ...productForm, imageUrl: "" })}
                    className="absolute top-3 right-3 h-10 w-10 bg-black/60 backdrop-blur-md rounded-2xl flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-all hover:bg-destructive hover:scale-110 active:scale-95 border border-white/10 shadow-xl"
                   >
                     <X size={20} />
                   </button>
                 </div>
               ) : (
                <div className="relative">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleDirectUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-32 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-3 group relative overflow-hidden"
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform group-hover:bg-primary/20">
                          <ImagePlus size={28} />
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-bold text-white group-hover:text-primary transition-colors block">Share Image</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/20">PNG, JPG up to 10MB</span>
                        </div>
                      </>
                    )}
                  </button>
                </div>
               )}
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/10 mt-2"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="animate-spin" /> : editingProduct ? "Save Changes" : "Create Product"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-md rounded-[3rem] p-10 flex flex-col items-center text-center bg-[#091515]/95 backdrop-blur-3xl border border-white/10 shadow-3xl animate-pop-in overflow-hidden">
          <DialogTitle className="text-3xl font-black font-display text-white mb-2 text-brand-gradient">Spread the word!</DialogTitle>
          <DialogDescription className="font-bold text-white/50 mb-8 text-base">
            Customers can scan this to open your shop instantly.
          </DialogDescription>
          <div className="p-8 bg-white rounded-[2rem] border-[12px] border-primary/10 mb-8 shadow-inner-soft overflow-hidden">
            <QRCodeSVG value={`${window.location.origin}/store/${store?.slug}`} size={220} className="rounded-xl" />
          </div>
          <Button onClick={copyStoreLink} className="w-full h-14 rounded-2xl font-black text-lg bg-primary hover:bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">
             <Copy size={22} className="mr-3" /> Copy Link instead
          </Button>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 backdrop-blur-md p-1 rounded-2xl h-14 w-full md:w-auto justify-start border border-white/10 overflow-x-auto gap-1 no-scrollbar md:flex hidden">
          <TabsTrigger value="overview" className="rounded-xl px-6 h-11 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-bold transition-all">
            <BarChart3 size={18} className="mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-xl px-6 h-11 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-bold transition-all">
            <Package size={18} className="mr-2" /> Inventory
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-xl px-6 h-11 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-bold transition-all">
            <ShoppingCart size={18} className="mr-2" /> Orders
          </TabsTrigger>
          <TabsTrigger value="quick-import" className="rounded-xl px-6 h-11 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-bold transition-all">
            <Sparkles size={18} className="mr-2" /> Quick Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pop-in">
            <Card className="rounded-[2rem] border-white/10 bg-[#091515]/40 backdrop-blur-xl shadow-xl overflow-hidden group hover:border-primary/30 transition-colors">
              <CardHeader className="pb-4">
                <CardTitle className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Total Sales</CardTitle>
                <div className="text-3xl font-black font-display text-white group-hover:text-primary transition-colors">KES {totalSales.toLocaleString()}</div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-white/30 font-bold">All time performance</p>
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] border-white/10 bg-[#091515]/40 backdrop-blur-xl shadow-xl overflow-hidden group hover:border-primary/30 transition-colors">
              <CardHeader className="pb-4">
                <CardTitle className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Active Products</CardTitle>
                <div className="text-3xl font-black font-display text-white group-hover:text-primary transition-colors">{products.length}</div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-white/30 font-bold">In your public catalog</p>
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] border-white/10 bg-[#091515]/40 backdrop-blur-xl shadow-xl overflow-hidden group hover:border-primary/30 transition-colors">
              <CardHeader className="pb-4">
                <CardTitle className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Total Orders</CardTitle>
                <div className="text-3xl font-black font-display text-white group-hover:text-primary transition-colors">{orders.length}</div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-white/30 font-bold">Across all statuses</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6 animate-pop-in">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-2xl font-black font-display text-white">Product Inventory</h2>
            <Button onClick={handleOpenAddModal} className="rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold h-11">
              <Plus size={20} className="mr-2 text-primary" /> Add Product
            </Button>
          </div>
          <Card className="rounded-[2.5rem] border border-white/10 bg-[#091515]/60 backdrop-blur-2xl shadow-3xl overflow-hidden p-2">
            <div className="rounded-[2rem] overflow-hidden">
              {/* Desktop Table */}
              <Table className="hidden md:table">
                <TableHeader className="bg-white/5 border-b border-white/5 hover:bg-white/5">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="font-black text-white px-6 h-14">Product</TableHead>
                    <TableHead className="font-black text-white px-6">Price</TableHead>
                    <TableHead className="font-black text-white px-6">Stock</TableHead>
                    <TableHead className="font-black text-white px-6">Status</TableHead>
                    <TableHead className="text-right font-black text-white px-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p._id} className="border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell className="font-bold text-white px-6 py-5">{p.name}</TableCell>
                      <TableCell className="text-white/70 font-medium px-6">KES {p.price.toLocaleString()}</TableCell>
                      <TableCell className="text-white/70 font-medium px-6">{p.stockCount}</TableCell>
                      <TableCell className="px-6">
                        <Badge variant="outline" className="rounded-lg bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1">Active</Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-lg text-white/40 hover:text-primary hover:bg-primary/10 active:bg-primary/20 active:text-primary transition-all h-9 w-9"
                            onClick={() => handleOpenEditModal(p)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-lg text-white/40 hover:text-destructive hover:bg-destructive/10 active:bg-destructive/20 active:text-destructive transition-all h-9 w-9"
                            onClick={() => handleDeleteProduct(p._id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-white/20">
                        <Package size={48} className="mx-auto mb-4 opacity-5" />
                        No products found. Use Quick Import to add some!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Mobile Card List View */}
              <div className="md:hidden space-y-4 p-4">
                {(activeTab === 'inventory' ? products : orders).map((item) => (
                  <div key={item._id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                    {activeTab === 'inventory' ? (
                      <>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-white text-lg">{(item as any).name}</h3>
                            <p className="text-primary font-black">KES {(item as any).price.toLocaleString()}</p>
                          </div>
                          <Badge variant="outline" className="rounded-lg bg-primary/10 text-primary border-primary/20 font-bold">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold text-white/40 uppercase tracking-widest">
                          <span>Stock: {(item as any).stockCount}</span>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 bg-white/5 border border-white/5 rounded-xl text-white/60 hover:text-primary hover:bg-primary/10 active:bg-primary/20 active:text-primary transition-all"
                              onClick={() => handleOpenEditModal(item)}
                            >
                              <Pencil size={18} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 bg-white/5 border border-white/5 rounded-xl text-white/60 hover:text-destructive hover:bg-destructive/10 active:bg-destructive/20 active:text-destructive transition-all"
                              onClick={() => handleDeleteProduct(item._id)}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="font-black text-white text-lg leading-none">{(item as any).buyerPhone}</div>
                            <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{new Date((item as any).createdAt).toLocaleDateString()}</div>
                          </div>
                          <Badge className={`rounded-lg text-[9px] px-2 py-0.5 font-black uppercase tracking-wider ${
                            (item as any).status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            (item as any).status === 'CONFIRMED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            (item as any).status === 'SHIPPED' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            (item as any).status === 'DELIVERED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            'bg-white/5 text-white/40 border-white/10'
                          }`}>
                            {(item as any).status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(item as any).items.map((subItem: any, i: number) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-white/60">
                              {subItem.name} <span className="text-primary">x{subItem.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <div className="text-xl font-black text-primary">KES {(item as any).totalAmount.toLocaleString()}</div>
                          <select 
                            className="text-xs bg-white/10 text-white rounded-lg p-2 outline-none border border-white/10 font-bold cursor-pointer transition-all active:scale-95"
                            value={(item as any).status}
                            onChange={(e) => handleUpdateStatus(item._id, e.target.value)}
                          >
                            <option value="PENDING" className="bg-[#091515]">Status: Pending</option>
                            <option value="CONFIRMED" className="bg-[#091515]">Status: Confirm</option>
                            <option value="SHIPPED" className="bg-[#091515]">Status: Ship</option>
                            <option value="DELIVERED" className="bg-[#091515]">Status: Deliver</option>
                            <option value="CANCELLED" className="bg-[#091515]">Status: Cancel</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {(activeTab === 'inventory' ? products.length : orders.length) === 0 && (
                  <div className="text-center py-16 text-white/20">
                    <Package size={40} className="mx-auto mb-3 opacity-10" />
                    <p className="font-bold">No items found</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="quick-import" className="animate-pop-in">
          <Card className="max-w-2xl rounded-[2.5rem] border border-white/10 bg-[#091515]/60 backdrop-blur-2xl shadow-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-white/5 mb-8 p-8 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-black text-white">
                <div className="bg-primary/20 p-2 rounded-xl">
                  <Sparkles size={24} className="text-primary" />
                </div>
                AI Quick Import
              </CardTitle>
              <CardDescription className="text-white/40 font-bold mt-2">
                Paste a list of products and prices (e.g., "Shoes 2500, Belt 1k") and we'll handle the rest.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8 pt-0">
              <div className="space-y-2 group">
                <textarea
                  className="w-full min-h-[220px] p-6 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none font-medium leading-relaxed"
                  placeholder="Paste your product list here..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleQuickImport} 
                className="w-full h-14 text-lg font-black rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground border-none transition-all shadow-xl shadow-primary/20 active:scale-95" 
                disabled={parsing || !importText.trim()}
              >
                {parsing ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <><Send size={20} className="mr-3" /> Generate Catalog</>}
              </Button>
              <p className="text-[10px] text-center text-white/20 font-black uppercase tracking-widest">
                Pro tip: You can include stock info too, like "Shirt 1500 (Qty: 20)"
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="animate-pop-in">
          <Card className="rounded-[2.5rem] border border-white/10 bg-[#091515]/60 backdrop-blur-2xl shadow-3xl overflow-hidden p-2">
            <div className="rounded-[2rem] overflow-hidden">
              {/* Desktop Table View */}
              <Table className="hidden md:table w-full">
                <TableHeader className="bg-white/5 border-b border-white/5 hover:bg-white/5">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="font-black text-white px-6 h-14">Order Info</TableHead>
                    <TableHead className="font-black text-white px-6">Items</TableHead>
                    <TableHead className="font-black text-white px-6">Total</TableHead>
                    <TableHead className="font-black text-white px-6">Status</TableHead>
                    <TableHead className="text-right font-black text-white px-6 uppercase text-[10px] tracking-[0.2em] opacity-40">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o._id} className="border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell className="px-6 py-5">
                        <div className="font-black text-white text-base">{o.buyerPhone}</div>
                        <div className="text-[10px] text-white/30 font-bold uppercase tracking-tight">{new Date(o.createdAt).toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex flex-wrap gap-2 max-w-[240px]">
                          {o.items.map((item: any, i: number) => (
                            <Badge key={i} variant="secondary" className="rounded-lg text-[10px] bg-white/5 text-white/60 border-white/10 font-bold px-2 py-0.5">
                              {item.name} <span className="text-primary ml-1">x{item.quantity}</span>
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 font-black text-primary text-base">KES {o.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className="px-6">
                        <Badge className={`rounded-lg text-[10px] px-3 py-1 font-black uppercase tracking-wider ${
                          o.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          o.status === 'CONFIRMED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          o.status === 'SHIPPED' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          o.status === 'DELIVERED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          'bg-white/5 text-white/40 border-white/10'
                        }`}>
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <select 
                          className="text-xs bg-white/5 text-white/70 rounded-lg p-2 outline-none border border-white/10 font-bold cursor-pointer hover:bg-white/10 transition-all active:scale-95"
                          value={o.status}
                          onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                        >
                          <option value="PENDING" className="bg-[#091515]">Pending</option>
                          <option value="CONFIRMED" className="bg-[#091515]">Confirm</option>
                          <option value="SHIPPED" className="bg-[#091515]">Ship</option>
                          <option value="DELIVERED" className="bg-[#091515]">Deliver</option>
                          <option value="CANCELLED" className="bg-[#091515]">Cancel</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-24 text-white/20 flex flex-col items-center">
                        <div className="bg-white/5 p-6 rounded-3xl mb-4 group-hover:bg-white/10 transition-colors">
                          <ShoppingCart size={48} className="opacity-20 translate-x-1" />
                        </div>
                        <p className="text-xl font-black text-white/40 mb-1">No orders yet</p>
                        <p className="text-sm font-bold opacity-30">Sharing your store gets you more sales!</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Mobile Card List View */}
              <div className="md:hidden space-y-4 p-4">
                {(activeTab === 'inventory' ? products : orders).map((item) => (
                  <div key={item._id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                    {activeTab === 'inventory' ? (
                      <>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-white text-lg">{(item as any).name}</h3>
                            <p className="text-primary font-black">KES {(item as any).price.toLocaleString()}</p>
                          </div>
                          <Badge variant="outline" className="rounded-lg bg-primary/10 text-primary border-primary/20 font-bold">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold text-white/40 uppercase tracking-widest">
                          <span>Stock: {(item as any).stockCount}</span>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 bg-white/5 rounded-xl text-white/60 hover:text-primary transition-all"
                              onClick={() => handleOpenEditModal(item)}
                            >
                              <Pencil size={18} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 bg-white/5 rounded-xl text-white/60 hover:text-destructive transition-all"
                              onClick={() => handleDeleteProduct(item._id)}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="font-black text-white text-lg leading-none">{(item as any).buyerPhone}</div>
                            <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{new Date((item as any).createdAt).toLocaleDateString()}</div>
                          </div>
                          <Badge className={`rounded-lg text-[9px] px-2 py-0.5 font-black uppercase tracking-wider ${
                            (item as any).status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            (item as any).status === 'CONFIRMED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            (item as any).status === 'SHIPPED' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            (item as any).status === 'DELIVERED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            'bg-white/5 text-white/40 border-white/10'
                          }`}>
                            {(item as any).status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(item as any).items.map((subItem: any, i: number) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-white/60">
                              {subItem.name} <span className="text-primary">x{subItem.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <div className="text-xl font-black text-primary">KES {(item as any).totalAmount.toLocaleString()}</div>
                          <select 
                            className="text-xs bg-white/10 text-white rounded-lg p-2 outline-none border border-white/10 font-bold cursor-pointer transition-all active:scale-95"
                            value={(item as any).status}
                            onChange={(e) => handleUpdateStatus(item._id, e.target.value)}
                          >
                            <option value="PENDING" className="bg-[#091515]">Status: Pending</option>
                            <option value="CONFIRMED" className="bg-[#091515]">Status: Confirm</option>
                            <option value="SHIPPED" className="bg-[#091515]">Status: Ship</option>
                            <option value="DELIVERED" className="bg-[#091515]">Status: Deliver</option>
                            <option value="CANCELLED" className="bg-[#091515]">Status: Cancel</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {(activeTab === 'inventory' ? products.length : orders.length) === 0 && (
                  <div className="text-center py-16 text-white/20">
                    <Package size={40} className="mx-auto mb-3 opacity-10" />
                    <p className="font-bold">No items found</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Store Settings Modal */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] bg-[#091515] border-white/10 text-white backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black font-display text-brand-gradient">Store Settings</DialogTitle>
            <DialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Customize your brand presence</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStore} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Shop Name</Label>
              <Input 
                value={settingsForm.name}
                onChange={e => setSettingsForm({...settingsForm, name: e.target.value})}
                className="rounded-xl bg-white/5 border-white/10 text-white h-12 font-bold"
                placeholder="My Awesome Shop"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Brand Tagline</Label>
              <Input 
                value={settingsForm.tagline}
                onChange={e => setSettingsForm({...settingsForm, tagline: e.target.value})}
                className="rounded-xl bg-white/5 border-white/10 text-white h-12 font-bold"
                placeholder="Curations you'll love, prices you'll adore"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">M-Pesa Number</Label>
              <Input 
                value={settingsForm.mpesaNumber}
                onChange={e => setSettingsForm({...settingsForm, mpesaNumber: e.target.value})}
                className="rounded-xl bg-white/5 border-white/10 text-white h-12 font-bold italic"
                placeholder="07XX XXX XXX"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="animate-spin" /> : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden">
        <div className="bg-[#091515]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 flex items-center justify-around shadow-2xl">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'overview' ? 'text-primary scale-110' : 'text-white/40'}`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'overview' ? 'bg-primary/10 shadow-[0_0_15px_rgba(174,234,0,0.2)]' : ''}`}>
              <BarChart3 size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Dash</span>
          </button>

          <button 
            onClick={() => setActiveTab("inventory")}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'inventory' ? 'text-primary scale-110' : 'text-white/40'}`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'inventory' ? 'bg-primary/10 shadow-[0_0_15px_rgba(174,234,0,0.2)]' : ''}`}>
              <Package size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Inventory</span>
          </button>

          <button 
            onClick={() => setActiveTab("orders")}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'orders' ? 'text-primary scale-110' : 'text-white/40'}`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'orders' ? 'bg-primary/10 shadow-[0_0_15px_rgba(174,234,0,0.2)]' : ''}`}>
              <ShoppingCart size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Orders</span>
          </button>

          <button 
            onClick={() => setActiveTab("quick-import")}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'quick-import' ? 'text-primary scale-110' : 'text-white/40'}`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'quick-import' ? 'bg-primary/10 shadow-[0_0_15px_rgba(174,234,0,0.2)]' : ''}`}>
              <Sparkles size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">AI Import</span>
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
