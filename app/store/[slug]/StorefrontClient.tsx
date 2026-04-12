"use client";

import { useState, useMemo } from "react";
import { 
  ShoppingBag, Search, Plus, Minus, 
  X, Smartphone, CheckCircle2, History,
  ArrowRight, Loader2, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function StorefrontClient({ store, products }: { store: any, products: any[] }) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product._id);
      if (existing) {
        return prev.map(item => item.id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: product._id, name: product.name, price: product.price, quantity: 1 }];
    });
    toast.success(`Added ${product.name} to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return toast.error("Phone number is required");
    
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: store.slug,
          buyerPhone: phone,
          items: cart.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          totalAmount: total
        }),
      });

      if (res.ok) {
        setOrderComplete(true);
        setCart([]);
        toast.success("Order placed successfully!");
      }
    } catch (error) {
      toast.error("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!phone) return toast.error("Enter your phone number to see history");
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?phone=${phone}`);
      if (res.ok) {
        const data = await res.json();
        setOrderHistory(data);
        setIsHistoryOpen(true);
      }
    } catch (error) {
      toast.error("Could not fetch history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-[#091515]/90 backdrop-blur-2xl border-b border-white/5 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary text-primary-foreground flex items-center justify-center rounded-2xl shadow-[0_0_25px_rgba(174,234,0,0.25)] animate-float shrink-0">
              <ShoppingBag size={22} />
            </div>
            <div className="min-w-0 flex flex-col">
              <h1 className="text-xl font-black tracking-tight text-white line-clamp-1 font-display leading-tight">{store.name}</h1>
              {store.tagline && (
                <p className="text-[10px] font-bold italic text-white/40 line-clamp-1 leading-tight mt-0.5">
                  {store.tagline}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-1 max-w-md justify-end">
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-xl border border-white/10 bg-white/5 text-[10px] uppercase font-black tracking-widest text-white/60 hover:text-primary hover:border-primary/30 transition-all active:scale-95"
            >
              <History size={14} className="text-primary" />
              <span>My Orders</span>
            </button>
            <div className="relative flex-1 hidden lg:block group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary h-4 w-4 transition-colors" />
              <input 
                type="text" 
                placeholder="Search products..."
                className="bg-white/5 border border-white/10 text-white rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary/30 outline-none w-full transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {cart.length > 0 && (
              <Button onClick={() => setIsCheckoutOpen(true)} className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-xl shadow-primary/20 text-sm gap-2 transition-all active:scale-95">
                <ShoppingBag size={18} strokeWidth={3} />
                <span>KES {total.toLocaleString()}</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
             <div className="h-1 w-8 bg-primary rounded-full" />
             <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30">Catalog</span>
           </div>
           <div className="text-[10px] uppercase font-black tracking-[0.3em] text-white/20">
             {products.length} Items
           </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map((product, idx) => (
            <div key={product._id} className="animate-pop-in" style={{ animationDelay: `${idx * 40}ms` }}>
              <div 
                onClick={() => setSelectedProduct(product)}
                className="group relative bg-[#091515]/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden hover:border-primary/20 transition-all duration-300 shadow-xl cursor-pointer"
              >
                <div className="aspect-square bg-white/[0.02] relative overflow-hidden rounded-t-2xl">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center opacity-5">
                      <ShoppingBag size={48} />
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-bold text-xs text-white/50 group-hover:text-primary transition-colors truncate uppercase tracking-widest">{product.name}</h3>
                  <p className="text-xl font-black text-brand-gradient tracking-tight transition-transform group-hover:scale-[1.02]">KES {product.price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent 
          className="sm:max-w-[440px] rounded-[3.5rem] p-0 overflow-hidden border-white/10 bg-[#091515]/95 backdrop-blur-3xl shadow-3xl"
          closeButtonClassName="text-[#091515] bg-black/10 hover:bg-black/20"
        >
          {!orderComplete ? (
            <div className="flex flex-col">
              <div className="bg-primary p-10 text-primary-foreground relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
                  <Smartphone size={160} strokeWidth={1} />
                </div>
                <h3 className="text-3xl font-black tracking-tight font-display mb-2">Checkout</h3>
                <p className="font-black uppercase tracking-widest text-[10px] opacity-60">M-Pesa STK Push Payment</p>
              </div>
              
              <div className="p-10 space-y-8">
                <div className="space-y-5 max-h-[320px] overflow-y-auto pr-3 no-scrollbar rounded-2xl">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-5 p-1">
                      <div className="h-16 w-16 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                        <ShoppingBag size={24} className="text-white opacity-20" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-white text-sm truncate">{item.name}</p>
                        <p className="text-primary font-black text-xs uppercase tracking-widest">KES {item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                        <button onClick={() => updateQuantity(item.id, -1)} className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all active:scale-90"><Minus size={14} strokeWidth={3}/></button>
                        <span className="w-6 text-center font-black text-white text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all active:scale-90"><Plus size={14} strokeWidth={3}/></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white/30 font-black text-xs uppercase tracking-[0.2em]">Total Amount</span>
                    <span className="text-3xl font-black text-primary tracking-tighter">KES {total.toLocaleString()}</span>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-white/30 block px-1">M-Pesa Phone Number</Label>
                    <Input 
                      placeholder="07XX XXX XXX" 
                      className="rounded-2xl h-14 bg-white/5 border-white/10 px-6 text-white text-lg font-black focus:ring-primary/40 focus:border-primary/40 placeholder:text-white/10"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={handleCheckout} 
                    className="w-full h-16 rounded-[2rem] text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95"
                    disabled={loading || !phone}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Confirm Payment"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center flex flex-col items-center space-y-8 animate-pop-in">
              <div className="h-24 w-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center shadow-3xl">
                <CheckCircle2 size={56} strokeWidth={3} />
              </div>
              <div className="space-y-3">
                <h3 className="text-4xl font-black font-display text-white tracking-tight">Confirmed!</h3>
                <p className="text-white/40 font-bold max-w-xs mx-auto leading-relaxed">
                  Thank you! We've sent an M-Pesa push to your phone <strong>{phone}</strong>.
                </p>
              </div>
              <Button 
                onClick={() => { setIsCheckoutOpen(false); setOrderComplete(false); }}
                className="w-full h-16 rounded-[2rem] font-black text-lg bg-white/10 hover:bg-white/20 text-white transition-all shadow-xl"
              >
                Continue Shopping
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent 
          className="sm:max-w-[440px] rounded-[3.5rem] p-10 border-white/10 bg-[#091515]/95 backdrop-blur-3xl shadow-3xl text-white overflow-hidden"
          closeButtonClassName="text-white/40 hover:text-white bg-white/5 hover:bg-white/10"
        >
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black font-display text-brand-gradient">Order History</DialogTitle>
            <DialogDescription className="font-black text-white/30 uppercase tracking-widest text-[10px] mt-2">
              Recognized by your phone number
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-8">
            {!orderHistory.length ? (
              <div className="space-y-6">
                 <div className="space-y-3 text-left">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-white/30 px-1">Enter Phone Number</Label>
                    <Input 
                      placeholder="07XX XXX XXX" 
                      className="rounded-2xl h-14 bg-white/5 border-white/10 px-6 text-lg font-black focus:ring-primary/40 text-white placeholder:text-white/10"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                  <Button onClick={fetchHistory} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg shadow-xl shadow-primary/10" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "View History"}
                  </Button>
              </div>
            ) : (
              <div className="space-y-5 max-h-[420px] overflow-y-auto pr-3 no-scrollbar py-2 rounded-3xl">
                {orderHistory.map((order: any) => (
                  <div key={order._id} className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.03] space-y-4 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="font-black text-primary text-lg tracking-tight">KES {order.totalAmount.toLocaleString()}</p>
                      </div>
                      <Badge className={`rounded-xl text-[9px] font-black uppercase tracking-wider px-2 py-1 h-6 ${
                        order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        'bg-white/5 text-white/40 border-white/10'
                      }`}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                       {order.items.map((item: any, i: number) => (
                         <Badge key={i} variant="outline" className="rounded-lg h-6 text-[9px] whitespace-nowrap bg-white/5 border-white/5 text-white/60 font-bold">{item.name} x{item.quantity}</Badge>
                       ))}
                    </div>
                  </div>
                ))}
                <div className="pt-2 flex justify-center">
                  <button 
                    onClick={() => setOrderHistory([])}
                    className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-primary transition-colors py-2"
                  >
                    Change Number or Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent 
          className="sm:max-w-[420px] max-h-[85vh] overflow-y-auto no-scrollbar rounded-[2.5rem] p-0 border-white/10 bg-[#091515]/95 backdrop-blur-3xl shadow-3xl text-white"
          closeButtonClassName="text-white bg-black/40 hover:bg-black/60 m-3 fixed top-3 right-3 z-50 h-8 w-8 rounded-full"
        >
          {selectedProduct && (
            <div className="flex flex-col max-h-[85vh]">
              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
                <div className="aspect-[4/3] bg-white/5 relative">
                  {selectedProduct.imageUrl ? (
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center opacity-10">
                      <ShoppingBag size={80} />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#091515] to-transparent" />
                </div>
                
                <div className="p-8 -mt-8 relative z-10 space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black font-display tracking-tight text-white leading-tight">{selectedProduct.name}</h3>
                    <p className="text-2xl font-black text-brand-gradient tracking-tighter">KES {selectedProduct.price.toLocaleString()}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-black tracking-[0.2em] text-white/30">Description</span>
                    <p className="text-white/60 font-bold leading-relaxed text-sm">
                      {selectedProduct.description || "No description provided for this catalog item."}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Fixed Bottom Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#091515] via-[#091515] to-transparent pt-12 z-20 flex gap-4">
                <Button 
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-sm border border-white/5 transition-all"
                >
                  Add to Cart
                </Button>
                <Button 
                  onClick={() => {
                    setCart([{ id: selectedProduct._id, name: selectedProduct.name, price: selectedProduct.price, quantity: 1 }]);
                    setSelectedProduct(null);
                    setIsCheckoutOpen(true);
                  }}
                  className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-2xl shadow-primary-20 transition-all hover:scale-[1.01] active:scale-95"
                >
                  Buy Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Mobile Cart Floating Button */}
      {cart.length > 0 && (
         <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 w-full px-8 flex justify-center md:hidden animate-pop-in">
            <Button 
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full max-w-[340px] h-16 rounded-[2.5rem] shadow-[0_20px_40px_rgba(174,234,0,0.4)] text-lg font-black bg-primary text-primary-foreground flex items-center justify-between px-10 transition-transform active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-white/20 rounded-xl flex items-center justify-center text-sm font-black">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </div>
                <span>Order</span>
              </div>
              <ArrowRight size={22} strokeWidth={3} className="opacity-40" />
              <span className="tracking-tighter">KES {total.toLocaleString()}</span>
            </Button>
         </div>
      )}
      {/* Footer */}
      <footer className="mt-20 py-16 border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Identity Section */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-primary" />
              <span className="font-heading text-lg font-black italic tracking-tighter text-white">
                {store.name}
              </span>
            </div>
            {store.tagline && (
              <p className="text-xs font-medium text-white/40 italic">
                {store.tagline}
              </p>
            )}
          </div>
          
          {/* Central Copyright (Mobile Stack) */}
          <div className="flex flex-col items-center space-y-4">
             <div className="flex items-center gap-2 grayscale opacity-40 hover:opacity-100 transition-all cursor-default">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Powered by</span>
                <span className="font-heading text-sm font-black italic tracking-tighter text-white">
                  Soko<span className="text-primary">Snap</span>
                </span>
              </div>
              <p className="text-sm font-medium text-white/40">© {new Date().getFullYear()} {store.name}</p>
          </div>

          {/* Legal Links */}
          <div className="flex gap-8">
            <button className="text-sm font-medium text-white/40 hover:text-white transition-colors">Privacy</button>
            <button className="text-sm font-medium text-white/40 hover:text-white transition-colors">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <label className={`block text-sm font-medium leading-none ${className}`}>{children}</label>
);
