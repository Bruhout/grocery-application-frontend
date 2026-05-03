const { createElement: h, useState, useEffect, useReducer, useCallback } = React;
const { render } = ReactDOM;
const { createStore } = Redux;

/* ────────────────────────────────────────────
   REDUX STORE
──────────────────────────────────────────── */
const ADD_TO_CART = 'ADD_TO_CART';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
const UPDATE_QTY = 'UPDATE_QTY';
const SET_PAGE = 'SET_PAGE';
const SET_FILTER = 'SET_FILTER';

const PRODUCTS = [
  { id:1,  name:'Organic Avocados',   qty:'4 pack',    emoji:'🥑', price:366, original:629, discount:42, category:'Produce' },
  { id:2,  name:'Wild Blueberries',   qty:'300g',  emoji:'🫐', price:240, original:366, discount:34, category:'Produce' },
  { id:3,  name:'Greek Yoghurt',      qty:'500g',         emoji:'🥛', price:188, original:314, discount:40, category:'Dairy' },
  { id:4,  name:'Sourdough Loaf',     qty:'800g',         emoji:'🍞', price:261, original:366, discount:29, category:'Bakery' },
  { id:5,  name:'Free-Range Eggs',    qty:'12 pack',      emoji:'🥚', price:314, original:471, discount:33, category:'Dairy' },
  { id:6,  name:'Atlantic Salmon',    qty:'300g',  emoji:'🐟', price:524, original:786, discount:33, category:'Seafood' },
  { id:7,  name:'Baby Spinach',       qty:'200g',     emoji:'🥬', price:104, original:188, discount:45, category:'Produce' },
  { id:8,  name:'Cheddar Cheese',     qty:'400g',   emoji:'🧀', price:230, original:345, discount:33, category:'Dairy' },
  { id:9,  name:'Chicken Breast',     qty:'500g',    emoji:'🍗', price:366, original:555, discount:34, category:'Meat' },
  { id:10, name:'Pasta Rigate',       qty:'500g',         emoji:'🍝', price:83,  original:135, discount:39, category:'Pantry' },
  { id:11, name:'Olive Oil',          qty:'500ml',        emoji:'🫙', price:471, original:734, discount:36, category:'Pantry' },
  { id:12, name:'Strawberries',       qty:'400g',  emoji:'🍓', price:198, original:314, discount:37, category:'Produce' }
];

const ORDERS = [
  { id:'xyz', date:'29 Apr 2026', total:'₹514', items:6, status:'delivered' },
];

const initialState = {
  cart: {},
  page: 'home',
  filter: 'All',
};

function reducer(state = initialState, action) {
  switch(action.type) {
    case ADD_TO_CART: {
      const item = state.cart[action.id] || { qty: 0 };
      return { ...state, cart: { ...state.cart, [action.id]: { qty: item.qty + 1 } } };
    }
    case REMOVE_FROM_CART: {
      const next = { ...state.cart };
      delete next[action.id];
      return { ...state, cart: next };
    }
    case UPDATE_QTY: {
      if (action.qty <= 0) {
        const next = { ...state.cart };
        delete next[action.id];
        return { ...state, cart: next };
      }
      return { ...state, cart: { ...state.cart, [action.id]: { qty: action.qty } } };
    }
    case SET_PAGE: return { ...state, page: action.page };
    case SET_FILTER: return { ...state, filter: action.filter };
    default: return state;
  }
}

const store = createStore(reducer);

/* hooks */
function useStore() {
  const [state, setState] = useState(store.getState());
  useEffect(() => {
    const unsub = store.subscribe(() => setState(store.getState()));
    return unsub;
  }, []);
  return state;
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((msg) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2500);
  }, []);
  return [toasts, addToast];
}

/* components */
function Sidebar({ collapsed }) {
  const state = useStore();
  const cartCount = Object.values(state.cart).reduce((s, v) => s + v.qty, 0);
  const navigate = (page) => store.dispatch({ type: SET_PAGE, page });

  const navItems = [
    { id:'home',    icon:'🏠', label:'Home' },
    { id:'deals',   icon:'🏷️', label:'Today\'s Deals' },
    { id:'produce', icon:'🥦', label:'Produce' },
    { id:'dairy',   icon:'🧀', label:'Dairy & Eggs' },
    { id:'meat',    icon:'🥩', label:'Meat & Fish' },
    { id:'bakery',  icon:'🥐', label:'Bakery' },
    { id:'pantry',  icon:'🛒', label:'Pantry' },
  ];

  const extras = [
    { id:'orders',  icon:'📦', label:'My Orders' },
    { id:'cart',    icon:'🛍️', label:'Cart', badge: cartCount > 0 ? cartCount : null },
  ];

  return h('nav', { id:'sidebar', className: collapsed ? 'collapsed' : '' },
    h('div', { className:'sidebar-logo' },
      h('div', { className:'brand' }, '🌿 Bigger Basket'),
      h('div', { className:'tagline' }, 'Fresh Produce Straight to your Door')
    ),
    h('div', { className:'sidebar-nav' },
      h('div', { className:'nav-section-label' }, 'Shop'),
      navItems.map(item =>
        h('div', { key:item.id, className:`nav-item ${state.page === item.id ? 'active' : ''}`, onClick:() => navigate(item.id) },
          h('span', { className:'icon' }, item.icon),
          item.label
        )
      ),
      h('div', { className:'nav-section-label' }, 'Account'),
      extras.map(item =>
        h('div', { key:item.id, className:`nav-item ${state.page === item.id ? 'active' : ''}`, onClick:() => navigate(item.id) },
          h('span', { className:'icon' }, item.icon),
          item.label,
          item.badge ? h('span', { className:'nav-badge' }, item.badge) : null
        )
      )
    ),
    h('div', { className:'sidebar-footer' },
      h('div', { className:'avatar' }, 'IG'),
      h('span', null, 'Ishaan Gupta')
    )
  );
}

function ProductCard({ product, inCart, onAdd, onRemove }) {
  return h('div', { className:`product-card ${inCart ? 'in-cart' : ''}`, onClick: onAdd },
    h('span', { className:'discount-badge' }, `-${product.discount}%`),
    h('div', { className:'product-emoji' }, product.emoji),
    h('div', { className:'product-name' }, product.name),
    h('div', { className:'product-qty' }, product.qty),
    h('div', { className:'product-pricing' },
      h('span', { className:'price-new' }, `₹${product.price.toFixed(2)}`),
      h('span', { className:'price-old' }, `₹${product.original.toFixed(2)}`)
    ),
    h('div', { className:'card-actions', onClick: e => e.stopPropagation() },
      inCart
        ? h('button', { className:'btn-cart remove', onClick: onRemove }, '✓ In Cart')
        : h('button', { className:'btn-cart add', onClick: onAdd }, '+ Add to Cart')
    )
  );
}

function HomePage({ addToast }) {
  const state = useStore();
  const categories = [
    { label:'Produce', icon:'🥦' }, { label:'Dairy', icon:'🥛' },
    { label:'Meat', icon:'🥩' }, { label:'Bakery', icon:'🍞' },
    { label:'Pantry', icon:'🛒' }, { label:'Seafood', icon:'🐟' },
    { label:'Snacks', icon:'🍿' }, { label:'Drinks', icon:'🧃' },
  ];

  const handleAdd = (product) => {
    store.dispatch({ type: ADD_TO_CART, id: product.id });
    addToast(`${product.emoji} ${product.name} added to cart`);
  };
  const handleRemove = (product) => {
    store.dispatch({ type: REMOVE_FROM_CART, id: product.id });
    addToast(`Removed ${product.name}`);
  };

  return h('div', { className:'page' },
    h('div', { className:'deal-banner' },
      h('div', { className:'deal-banner-text' },
        h('h2', null, "Weekend Savings"),
        h('p', null, "Stock up on fresh produce, dairy & pantry essentials.")
      ),
      h('div', { className:'deal-banner-badge' }, "Up to\n45% off")
    ),

    h('div', { className:'section-header' },
      h('h2', null, "Today's Top Deals"),
      h('a', { onClick: () => store.dispatch({ type:SET_PAGE, page:'deals' }) }, "View all →")
    ),
    h('div', { className:'discounts-flex' },
      PRODUCTS.slice(0, 6).map(p =>
        h(ProductCard, {
          key: p.id, product: p,
          inCart: !!state.cart[p.id],
          onAdd: () => handleAdd(p),
          onRemove: () => handleRemove(p),
        })
      )
    ),

    h('div', { className:'section-header' }, h('h2', null, "Shop by Category")),
    h('div', { className:'categories-grid' },
      categories.map(c =>
        h('div', { key:c.label, className:'category-card',
          onClick: () => store.dispatch({ type:SET_PAGE, page: c.label.toLowerCase() }) },
          h('div', { className:'icon' }, c.icon),
          h('div', { className:'label' }, c.label)
        )
      )
    )
  );
}

function DealsPage({ addToast }) {
  const state = useStore();
  const filters = ['All', 'Produce', 'Dairy', 'Meat', 'Bakery', 'Pantry', 'Seafood'];

  const filtered = state.filter === 'All'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === state.filter);

  const handleAdd = (product) => {
    store.dispatch({ type: ADD_TO_CART, id: product.id });
    addToast(`${product.emoji} Added to cart`);
  };
  const handleRemove = (product) => {
    store.dispatch({ type: REMOVE_FROM_CART, id: product.id });
  };

  return h('div', { className:'page' },
    h('div', { className:'page-header' },
      h('h1', null, "Today's Deals"),
      h('p', null, `${PRODUCTS.length} items on discount — limited time only`)
    ),
    h('div', { className:'filter-bar' },
      filters.map(f =>
        h('button', { key:f, className:`filter-chip ${state.filter === f ? 'active' : ''}`,
          onClick: () => store.dispatch({ type:SET_FILTER, filter:f }) }, f)
      )
    ),
    h('div', { className:'discounts-flex' },
      filtered.map(p =>
        h(ProductCard, {
          key: p.id, product: p,
          inCart: !!state.cart[p.id],
          onAdd: () => handleAdd(p),
          onRemove: () => handleRemove(p),
        })
      )
    )
  );
}

function CartPage() {
  const state = useStore();
  const cartEntries = Object.entries(state.cart).map(([id, val]) => ({
    ...PRODUCTS.find(p => p.id === +id),
    qty: val.qty,
  }));

  const subtotal = cartEntries.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal > 40 ? 0 : 2.99;
  const total = subtotal + delivery;

  if (cartEntries.length === 0) {
    return h('div', { className:'page' },
      h('div', { className:'page-header' }, h('h1', null, 'My Cart')),
      h('div', { className:'empty-cart' },
        h('div', { className:'icon' }, '🛍️'),
        h('h3', null, 'Your cart is empty'),
        h('p', null, 'Browse deals and add items to get started.'),
      )
    );
  }

  return h('div', { className:'page' },
    h('div', { className:'page-header' }, h('h1', null, 'My Cart'), h('p', null, `${cartEntries.length} items`)),
    h('div', { className:'cart-layout' },
      h('div', { className:'cart-items-list' },
        cartEntries.map(item =>
          h('div', { key:item.id, className:'cart-item' },
            h('div', { className:'cart-item-emoji' }, item.emoji),
            h('div', { className:'cart-item-info' },
              h('div', { className:'cart-item-name' }, item.name),
              h('div', { className:'cart-item-price' }, `₹${item.price.toFixed(2)} each`)
            ),
            h('div', { className:'qty-controls' },
              h('button', { className:'qty-btn', onClick:() => store.dispatch({ type:UPDATE_QTY, id:item.id, qty:item.qty-1 }) }, '−'),
              h('span', { className:'qty-value' }, item.qty),
              h('button', { className:'qty-btn', onClick:() => store.dispatch({ type:UPDATE_QTY, id:item.id, qty:item.qty+1 }) }, '+')
            ),
            h('div', { className:'item-total' }, `₹${(item.price * item.qty).toFixed(2)}`)
          )
        )
      ),
      h('div', { className:'cart-summary' },
        h('h3', null, 'Order Summary'),
        h('div', { className:'summary-row' }, h('span', null, 'Subtotal'), h('span', null, `₹${subtotal.toFixed(2)}`)),
        h('div', { className:'summary-row' }, h('span', null, 'Delivery'), h('span', null, delivery === 0 ? 'Free' : `₹${delivery.toFixed(2)}`)),
        delivery > 0 && h('div', { className:'summary-row' }, h('span', { style:{color:'var(--green-600)'}}, `Add ₹${(40 - subtotal).toFixed(2)} for free delivery`), null),
        h('div', { className:'summary-row total' }, h('span', null, 'Total'), h('span', null, `₹${total.toFixed(2)}`)),
        h('button', { className:'checkout-btn' }, '✓ Proceed to Checkout')
      )
    )
  );
}

function OrdersPage() {
  const statusLabel = { delivered:'Delivered', transit:'In Transit', processing:'Processing' };
  const statusClass = { delivered:'status-delivered', transit:'status-transit', processing:'status-processing' };

  return h('div', { className:'page' },
    h('div', { className:'page-header' },
      h('h1', null, 'My Orders'),
      h('p', null, 'Your recent purchases')
    ),
    ORDERS.map(order =>
      h('div', { key:order.id, className:'order-card' },
        h('div', null,
          h('div', { style:{fontWeight:600, fontSize:15} }, order.id),
          h('div', { className:'order-id', style:{marginTop:4} }, order.date),
        ),
        h('div', { style:{marginLeft:'auto', textAlign:'right'} },
          h('div', { style:{fontWeight:700, fontSize:16, color:'var(--green-600)'} }, order.total),
          h('div', { style:{fontSize:12, color:'var(--gray-400)', marginTop:2} }, `${order.items} items`)
        ),
        h('span', { className:`order-status ${statusClass[order.status]}` }, statusLabel[order.status])
      )
    )
  );
}

function CategoryPage({ category }) {
  const state = useStore();
  const products = PRODUCTS.filter(p => p.category === category);
  const [toasts, addToast] = useToasts();

  if (products.length === 0) {
    return h('div', { className:'page' },
      h('div', { className:'page-header' }, h('h1', null, category)),
      h('p', { style:{color:'var(--gray-400)'} }, 'No products available.')
    );
  }

  return h('div', { className:'page' },
    h('div', { className:'page-header' }, h('h1', null, category)),
    h('div', { className:'discounts-flex' },
      products.map(p =>
        h(ProductCard, {
          key:p.id, product:p,
          inCart:!!state.cart[p.id],
          onAdd:() => { store.dispatch({ type:ADD_TO_CART, id:p.id }); addToast(`${p.emoji} Added`); },
          onRemove:() => store.dispatch({ type:REMOVE_FROM_CART, id:p.id }),
        })
      )
    )
  );
}

/* ────────────────────────────────────────────
   APP ROOT
──────────────────────────────────────────── */
function App() {
  const state = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toasts, addToast] = useToasts();

  const pageTitles = {
    home:'Home', deals:"Today's Deals", cart:'My Cart', orders:'My Orders',
    produce:'Produce', dairy:'Dairy & Eggs', meat:'Meat & Fish', bakery:'Bakery',
    pantry:'Pantry', seafood:'Seafood',
  };

  const categoryPages = ['produce','dairy','meat','bakery','pantry','seafood'];

  function renderPage() {
    if (state.page === 'home') return h(HomePage, { addToast });
    if (state.page === 'deals') return h(DealsPage, { addToast });
    if (state.page === 'cart') return h(CartPage);
    if (state.page === 'orders') return h(OrdersPage);
    if (categoryPages.includes(state.page)) {
      const cat = state.page.charAt(0).toUpperCase() + state.page.slice(1);
      return h(CategoryPage, { category: cat === 'Dairy' ? 'Dairy' : cat });
    }
    return h(HomePage, { addToast });
  }

  const cartCount = Object.values(state.cart).reduce((s, v) => s + v.qty, 0);

  return h('div', { style:{ display:'flex' } },
    h(Sidebar, { collapsed: !sidebarOpen }),
    h('div', { id:'app-shell', className: sidebarOpen ? '' : 'full-width' },
      h('header', { className:'topbar' },
        h('div', { className:'topbar-page-title' }, pageTitles[state.page] || ''),
        h('input', { className:'search-bar', placeholder:'Search fresh groceries…', type:'search' }),
        cartCount > 0 && h('div', {
          style:{ display:'flex', alignItems:'center', gap:6, cursor:'pointer',
            background:'var(--green-50)', border:'1px solid var(--green-100)',
            borderRadius:8, padding:'6px 12px', fontSize:13, fontWeight:600, color:'var(--green-600)' },
          onClick:() => store.dispatch({ type:SET_PAGE, page:'cart' })
        }, `🛍️ ${cartCount}`),
        h('div', { className:`hamburger ${sidebarOpen ? 'open' : ''}`, onClick:() => setSidebarOpen(v => !v) },
          h('span'), h('span'), h('span')
        )
      ),
      renderPage()
    ),
    h('div', { className:'toast-container' },
      toasts.map(t => h('div', { key:t.id, className:'toast' }, t.msg))
    )
  );
}

render(h(App), document.getElementById('root'));
