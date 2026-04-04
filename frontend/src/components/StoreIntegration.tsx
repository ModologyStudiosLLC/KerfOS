// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';

interface StoreIntegrationProps {
  materials?: Material[];
  hardware?: Hardware[];
  zipCode?: string;
  onCartUpdate?: (cart: CartItem[]) => void;
}

interface Material { id: string; name: string; type: string; dimensions: string; quantity: number; unitPrice: number; }
interface Hardware { id: string; name: string; type: string; quantity: number; unitPrice: number; }
interface CartItem { id: string; name: string; quantity: number; unitPrice: number; totalPrice: number; store: Store; sku: string; inStock: boolean; aisle?: string; }
interface Store { id: string; name: string; logo: string; color: string; url: string; }
interface StoreInventory { store: Store; items: { id: string; sku: string; name: string; price: number; inStock: boolean; quantity: number; aisle?: string }[]; }

const stores: Store[] = [
  { id: 'homedepot', name: 'Home Depot', logo: '🟠', color: '#F96302', url: 'https://www.homedepot.com' },
  { id: 'lowes', name: "Lowe's", logo: '🔵', color: '#004990', url: 'https://www.lowes.com' },
  { id: 'menards', name: 'Menards', logo: '🟢', color: '#006633', url: 'https://www.menards.com' },
];

const StoreIntegration: React.FC<StoreIntegrationProps> = ({ materials = [], hardware = [], zipCode = '', onCartUpdate }) => {
  const [localZipCode, setLocalZipCode] = useState(zipCode);
  const [inventory, setInventory] = useState<StoreInventory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'comparison' | 'cart'>('comparison');

  useEffect(() => { if (localZipCode) checkInventory(); }, [localZipCode, materials, hardware]);

  const checkInventory = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const allItems = [...materials.map(m => ({ ...m, category: 'material' })), ...hardware.map(h => ({ ...h, category: 'hardware' }))];
    const mockInventory: StoreInventory[] = stores.map(store => ({
      store,
      items: allItems.map(item => ({
        id: `${store.id}-${item.id}`,
        sku: `${store.id.toUpperCase()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        name: item.name,
        price: Math.round((item.unitPrice + (Math.random() - 0.5) * item.unitPrice * 0.2) * 100) / 100,
        inStock: Math.random() > 0.2,
        quantity: item.quantity,
        aisle: Math.random() > 0.3 ? String.fromCharCode(65 + Math.floor(Math.random() * 10)) : undefined,
      })),
    }));
    setInventory(mockInventory);
    setLoading(false);
  };

  const addToCart = (store: Store, item: any, quantity: number) => {
    const existingIndex = cart.findIndex(c => c.id === `${store.id}-${item.id}`);
    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setCart(updated);
    } else {
      setCart([...cart, { id: `${store.id}-${item.id}`, name: item.name, quantity, unitPrice: item.price, totalPrice: item.price * quantity, store, sku: item.sku, inStock: item.inStock, aisle: item.aisle }]);
    }
    onCartUpdate?.(cart);
  };

  const removeFromCart = (id: string) => setCart(cart.filter(c => c.id !== id));
  const getCartTotal = () => cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const getBestPrice = (itemId: string) => {
    let bestPrice = Infinity, bestStore: Store | null = null, inStock = false;
    inventory.forEach(inv => {
      const item = inv.items.find(i => i.id.endsWith(`-${itemId}`));
      if (item && item.price < bestPrice && item.inStock) { bestPrice = item.price; bestStore = inv.store; inStock = item.inStock; }
    });
    return { price: bestPrice === Infinity ? null : bestPrice, store: bestStore, inStock };
  };

  const filteredInventory = selectedStore === 'all' ? inventory : inventory.filter(inv => inv.store.id === selectedStore);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><span className="text-3xl">🛒</span> Store Integration</h2>
      <p className="text-gray-600 mb-6">Check inventory and add materials to your cart at local stores.</p>

      <div className="mb-6 flex gap-2">
        <input type="text" value={localZipCode} onChange={(e) => setLocalZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))} placeholder="Enter zip code" className="flex-1 px-4 py-2 border rounded-lg" />
        <button onClick={checkInventory} disabled={!localZipCode || localZipCode.length !== 5 || loading} className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300">{loading ? 'Checking...' : 'Check Inventory'}</button>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setViewMode('comparison')} className={`flex-1 py-2 px-4 rounded-lg border-2 ${viewMode === 'comparison' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>📊 Price Comparison</button>
        <button onClick={() => setViewMode('cart')} className={`flex-1 py-2 px-4 rounded-lg border-2 relative ${viewMode === 'cart' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
          🛒 My Cart {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cart.length}</span>}
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setSelectedStore('all')} className={`px-4 py-1.5 rounded-full text-sm ${selectedStore === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}>All Stores</button>
        {stores.map(store => <button key={store.id} onClick={() => setSelectedStore(store.id)} className={`px-4 py-1.5 rounded-full text-sm ${selectedStore === store.id ? 'text-white' : 'bg-gray-100'}`} style={selectedStore === store.id ? { backgroundColor: store.color } : {}}>{store.logo} {store.name}</button>)}
      </div>

      {viewMode === 'comparison' && (loading ? <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div><p className="text-gray-500">Checking inventory...</p></div> : inventory.length === 0 ? <div className="text-center py-12 bg-gray-50 rounded-lg"><p className="text-gray-500">Enter your zip code to check inventory</p></div> :
        <div className="space-y-4">
          {[...materials, ...hardware].map(item => {
            const best = getBestPrice(item.id);
            return (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div><h4 className="font-semibold">{item.name}</h4><p className="text-sm text-gray-500">Qty: {item.quantity}</p></div>
                  {best.price && <div className="text-right"><p className="text-lg font-bold text-green-600">${best.price.toFixed(2)}</p><p className="text-xs text-gray-500">at {best.store?.name}</p></div>}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {filteredInventory.map(inv => {
                    const storeItem = inv.items.find(i => i.id.endsWith(`-${item.id}`));
                    if (!storeItem) return null;
                    return (
                      <div key={inv.store.id} className={`border rounded p-3 ${best.store?.id === inv.store.id ? 'border-green-500 bg-green-50' : ''}`}>
                        <div className="flex items-center gap-1 mb-2"><span>{inv.store.logo}</span><span className="font-medium text-sm">{inv.store.name}</span></div>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`font-bold ${storeItem.inStock ? '' : 'text-red-600'}`}>${storeItem.price.toFixed(2)}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${storeItem.inStock ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>{storeItem.inStock ? 'In Stock' : 'Out'}</span>
                        </div>
                        {storeItem.inStock && <button onClick={() => addToCart(inv.store, storeItem, item.quantity)} className="w-full py-1.5 bg-blue-500 text-white rounded text-sm">Add to Cart</button>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'cart' && (cart.length === 0 ? <div className="text-center py-12 bg-gray-50 rounded-lg"><p className="text-gray-500">Your cart is empty</p></div> :
        <div className="space-y-4">
          {Object.entries(cart.reduce((acc, item) => { (acc[item.store.id] = acc[item.store.id] || []).push(item); return acc; }, {} as Record<string, CartItem[]>)).map(([storeId, items]) => {
            const store = stores.find(s => s.id === storeId)!;
            return (
              <div key={storeId} className="border rounded-lg overflow-hidden">
                <div className="px-4 py-2 text-white font-semibold" style={{ backgroundColor: store.color }}>{store.logo} {store.name}</div>
                <div className="divide-y">
                  {items.map(item => (
                    <div key={item.id} className="p-3 flex items-center gap-4">
                      <div className="flex-1"><p className="font-medium">{item.name}</p><p className="text-sm text-gray-500">{item.inStock ? <span className="text-green-600">In Stock {item.aisle && `(Aisle ${item.aisle})`}</span> : <span className="text-red-600">Out of Stock</span>}</p></div>
                      <p className="font-semibold">${item.totalPrice.toFixed(2)}</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="border-t pt-4"><p className="text-lg font-semibold">Total: ${getCartTotal().toFixed(2)}</p></div>
        </div>
      )}
    </div>
  );
};

export default StoreIntegration;
