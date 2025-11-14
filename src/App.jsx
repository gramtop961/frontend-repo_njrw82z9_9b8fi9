import { useMemo, useState } from 'react'

const DEFAULT_MENU = [
  {
    id: 'marg',
    name: 'Margherita',
    description: 'Tomato sauce, mozzarella, fresh basil',
    base_price: 8.99,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixid=M3w3OTkxMTl8MHwxfHNlYXJjaHwxfHxNYXJnaGVyaXRhfGVufDB8MHx8fDE3NjMxMDY3NDd8MA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80',
    tags: ['Classic', 'Veg']
  },
  {
    id: 'pepp',
    name: 'Pepperoni',
    description: 'Tomato sauce, mozzarella, pepperoni',
    base_price: 10.49,
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?ixid=M3w3OTkxMTl8MHwxfHNlYXJjaHwxfHxQZXBwZXJvbml8ZW58MHwwfHx8MTc2MzEwNjc0OHww&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80',
    tags: ['Best Seller']
  },
  {
    id: 'bbq',
    name: 'BBQ Chicken',
    description: 'BBQ sauce, chicken, red onion, cilantro',
    base_price: 11.99,
    image: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=800&q=80',
    tags: ['Savory']
  },
  {
    id: 'veggie',
    name: 'Garden Veggie',
    description: 'Mushroom, bell pepper, olive, onion',
    base_price: 9.99,
    image: 'https://images.unsplash.com/photo-1518568403628-df55701ade9e?ixid=M3w3OTkxMTl8MHwxfHNlYXJjaHwxfHxHYXJkZW4lMjBWZWdnaWV8ZW58MHwwfHx8MTc2MzEwNjc0OHww&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80',
    tags: ['Veg']
  }
]

const SIZES = [
  { key: 'S', label: 'Small', mult: 1 },
  { key: 'M', label: 'Medium', mult: 1.25 },
  { key: 'L', label: 'Large', mult: 1.5 },
]

function App() {
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [checkout, setCheckout] = useState(false)
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' })
  const [note, setNote] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(null)

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart])
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart])

  const addToCart = (pizza, sizeKey = 'M') => {
    const size = SIZES.find(s => s.key === sizeKey) || SIZES[1]
    const price = +(pizza.base_price * size.mult).toFixed(2)
    const key = `${pizza.id}-${size.key}`
    setCart(prev => {
      const existing = prev.find(i => i.key === key)
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [
        ...prev,
        { key, name: `${pizza.name} (${size.label})`, size: size.label, price, quantity: 1 }
      ]
    })
    setShowCart(true)
  }

  const updateQty = (key, delta) => {
    setCart(prev => prev
      .map(i => i.key === key ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
      .filter(i => i.quantity > 0)
    )
  }

  const removeItem = (key) => setCart(prev => prev.filter(i => i.key !== key))

  const startCheckout = () => {
    setShowCart(false)
    setCheckout(true)
  }

  const placeOrder = async () => {
    if (!customer.name || !customer.phone || !customer.address) return
    const payload = {
      items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, size: i.size })),
      customer,
      notes: note,
    }

    // Try to POST to backend if available (optional). If it fails, just simulate success.
    try {
      const base = import.meta.env.VITE_BACKEND_URL
      if (base) {
        const res = await fetch(`${base}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (res.ok) {
          const data = await res.json()
          setOrderPlaced({ id: data.id || 'temp-id', total: data.total ?? cartTotal.toFixed(2) })
          setCart([])
          return
        }
      }
    } catch (e) {
      // ignore, fallback below
    }

    setOrderPlaced({ id: 'temp-id', total: cartTotal.toFixed(2) })
    setCart([])
  }

  const reset = () => {
    setCheckout(false)
    setOrderPlaced(null)
    setCustomer({ name: '', phone: '', address: '' })
    setNote('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600 font-bold text-xl">
            <span role="img" aria-label="pizza">🍕</span>
            <span>Blue Pizza</span>
          </div>
          <button onClick={() => setShowCart(v => !v)} className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition">
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="ml-1 bg-black/80 text-white text-xs min-w-[20px] h-5 px-1 grid place-items-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          {!checkout && !orderPlaced && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Menu</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {DEFAULT_MENU.map(item => (
                  <article key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.tags?.map(t => (
                              <span key={t} className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200">{t}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">from</p>
                          <p className="text-xl font-bold text-gray-900">${item.base_price.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        {SIZES.map(s => (
                          <button key={s.key} onClick={() => addToCart(item, s.key)} className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:border-red-400 hover:text-red-700 transition">
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {checkout && !orderPlaced && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Checkout</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input value={customer.name} onChange={e => setCustomer(v => ({ ...v, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input value={customer.phone} onChange={e => setCustomer(v => ({ ...v, phone: e.target.value }))} className="w-full border rounded-lg px-3 py-2" placeholder="(555) 123-4567" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea value={customer.address} onChange={e => setCustomer(v => ({ ...v, address: e.target.value }))} className="w-full border rounded-lg px-3 py-2" rows="3" placeholder="123 Main St, City"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                  <input value={note} onChange={e => setNote(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="No onions, please" />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <button onClick={() => setCheckout(false)} className="px-4 py-2 rounded-lg border">Back to Cart</button>
                <button onClick={placeOrder} disabled={!customer.name || !customer.phone || !customer.address || cart.length === 0} className="px-5 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50">
                  Place Order (${cartTotal.toFixed(2)})
                </button>
              </div>
            </div>
          )}

          {orderPlaced && (
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
              <div className="text-5xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Order confirmed!</h2>
              <p className="text-gray-600">Your order ID is <span className="font-mono">{orderPlaced.id}</span>. Estimated delivery in 30-40 minutes.</p>
              <p className="mt-2 font-semibold">Total: ${orderPlaced.total}</p>
              <button onClick={() => { reset() }} className="mt-6 px-5 py-2 rounded-lg bg-red-600 text-white">Order More Pizza</button>
            </div>
          )}
        </section>

        {/* Cart */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-20">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Your Cart</h3>
              <span className="text-sm text-gray-500">{cartCount} items</span>
            </div>

            {cart.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Your cart is empty</div>
            ) : (
              <ul className="divide-y">
                {cart.map(item => (
                  <li key={item.key} className="p-4 flex items-start gap-3">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">${item.price.toFixed(2)} each</div>
                      <div className="mt-2 inline-flex items-center gap-2">
                        <button className="w-6 h-6 rounded-full border grid place-items-center" onClick={() => updateQty(item.key, -1)}>-</button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button className="w-6 h-6 rounded-full border grid place-items-center" onClick={() => updateQty(item.key, 1)}>+</button>
                        <button className="ml-3 text-sm text-red-600" onClick={() => removeItem(item.key)}>Remove</button>
                      </div>
                    </div>
                    <div className="text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
                  </li>
                ))}
              </ul>
            )}

            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${cartTotal.toFixed(2)}</span>
              </div>
              <button onClick={() => (cart.length ? startCheckout() : null)} disabled={cart.length === 0} className="w-full px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50">
                Checkout
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Floating cart for mobile */}
      {showCart && (
        <div className="fixed inset-0 bg-black/30 lg:hidden" onClick={() => setShowCart(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Your Cart</h3>
              <button onClick={() => setShowCart(false)} className="text-gray-500">Close</button>
            </div>
            <div className="p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-gray-500">Your cart is empty</div>
              ) : (
                cart.map(item => (
                  <div key={item.key} className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">${item.price.toFixed(2)} each</div>
                      <div className="mt-2 inline-flex items-center gap-2">
                        <button className="w-6 h-6 rounded-full border grid place-items-center" onClick={() => updateQty(item.key, -1)}>-</button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button className="w-6 h-6 rounded-full border grid place-items-center" onClick={() => updateQty(item.key, 1)}>+</button>
                      </div>
                    </div>
                    <div className="text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${cartTotal.toFixed(2)}</span>
              </div>
              <button onClick={() => { setShowCart(false); cart.length && setCheckout(true) }} disabled={cart.length === 0} className="w-full px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50">
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center py-8 text-sm text-gray-500">© {new Date().getFullYear()} Blue Pizza. All rights reserved.</footer>
    </div>
  )
}

export default App
