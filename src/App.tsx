import { useEffect, useMemo, useState } from 'react';
import { api, auth } from './api';
import {
  ArrowRight, ArrowUpRight, ChevronDown, Heart, Menu, Search, ShoppingBag,
  X, Diamond, ShieldCheck, Globe2, Trash2, LockKeyhole, LogOut
} from 'lucide-react';

type Look = { name: string; line: string; colour: string; image: string; alt: string };
type Order = { id: string; name: string; phone: string; city: string; address: string; notes?: string; items: { name: string; colour: string }[]; status: string; createdAt: string };

const looks: Look[] = [
  { name: 'Noir Muse', line: 'THE SCULPTED EDIT', colour: 'Midnight', image: '/resources/vyra-07-black-studio.jpg', alt: 'Adult model wearing a sculptural black VYRA fashion look in a studio editorial' },
  { name: 'Tidal Form', line: 'THE COASTAL EDIT', colour: 'Lagoon', image: '/resources/vyra-09-blue-rocky-shore.jpg', alt: 'Adult model wearing a blue VYRA fashion look on a rocky shoreline' },
  { name: 'Garden Muse', line: 'THE BOTANICAL EDIT', colour: 'Emerald', image: '/resources/vyra-10-emerald-garden.jpg', alt: 'Adult model wearing an emerald VYRA fashion look in a tropical garden' },
  { name: 'Ivory Hour', line: 'THE LIGHT STUDY', colour: 'Ivory', image: '/resources/vyra-12-white-pool.jpg', alt: 'Adult model wearing an ivory VYRA fashion look beside a pool' }
];
const gallery = [
  { image: '/resources/vyra-02-red-coast.jpg', alt: 'Red VYRA swimwear editorial on a sunlit coast', caption: 'MADE FOR YOUR KIND OF CONFIDENCE.', action: 'DISCOVER THE EDIT' },
  { image: '/resources/vyra-03-blue-beach.jpg', alt: 'Blue swimwear editorial by the sea', caption: 'YOUR STYLE HAS NO RULEBOOK.', action: 'SHOP THE MOOD' },
  { image: '/resources/vyra-04-emerald-tropical.jpg', alt: 'Emerald swimwear editorial in a tropical setting', caption: 'MAKE EVERY LOOK YOURS.', action: 'EXPLORE VYRA' }
];

function BrandMark() {
  return <a className="brand" href="#top" aria-label="VYRA home"><span className="brand-v">V</span><span className="brand-word">VYRA</span></a>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState<number[]>([]);
  const [bag, setBag] = useState<string[]>(() => {
    try {
      const stored = window.localStorage.getItem('vyra-bag');
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.filter((name): name is string => typeof name === 'string' && looks.some(look => look.name === name)) : [];
    } catch { return []; }
  });
  const [requestId, setRequestId] = useState(() => {
    try { return window.localStorage.getItem('vyra-request-id') || crypto.randomUUID(); }
    catch { return crypto.randomUUID(); }
  });
  const [notice, setNotice] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adminOpen, setAdminOpen] = useState(window.location.hash === '#admin');
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '', notes: '' });

  useEffect(() => {
    const restore = async () => {
      try { setUser(await auth.getUser()); } catch { setUser(null); }
    };
    void restore();
    const onHash = () => setAdminOpen(window.location.hash === '#admin');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('vyra-bag', JSON.stringify(bag));
      window.localStorage.setItem('vyra-request-id', requestId);
    } catch { /* Storage may be unavailable; the in-memory bag still works. */ }
  }, [bag, requestId]);

  useEffect(() => {
    if (!adminOpen || !user) return;
    let active = true;
    setAdminLoading(true);
    api.get('/api/admin/orders').then(({ data }) => {
      if (active) setOrders(data.orders || []);
    }).catch(() => {
      if (active) setNotice('Owner access is required to view orders.');
    }).finally(() => { if (active) setAdminLoading(false); });
    return () => { active = false; };
  }, [adminOpen, user]);

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  };
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };
  const visibleLooks = useMemo(() => looks.filter(item =>
    (item.name + ' ' + item.line + ' ' + item.colour).toLowerCase().includes(search.toLowerCase())
  ), [search]);
  const cartLooks = bag.map(name => looks.find(item => item.name === name)).filter((item): item is Look => Boolean(item));

  const addToBag = (name: string) => {
    setBag(current => [...current, name]);
    notify(name + ' added to your bag.');
  };
  const removeFromBag = (index: number) => setBag(current => current.filter((_, i) => i !== index));

  const submitOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!cartLooks.length) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/api/orders', {
        requestId, ...form,
        items: cartLooks.map(item => ({ name: item.name, colour: item.colour }))
      });
      setBag([]);
      setRequestId(crypto.randomUUID());
      setForm({ name: '', phone: '', city: '', address: '', notes: '' });
      setCheckoutOpen(false);
      notify('Your VYRA request ' + data.orderId.slice(0, 8).toUpperCase() + ' has been received. We will contact you to confirm availability.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not send your request. Please try again.');
    } finally { setSubmitting(false); }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.put('/api/admin/orders/' + encodeURIComponent(orderId), { status });
      setOrders(current => current.map(order => order.id === orderId ? { ...order, status } : order));
      notify('Order status updated.');
    } catch { notify('Could not update this order.'); }
  };

  const openAdmin = () => { window.location.hash = 'admin'; setAdminOpen(true); };
  const signIn = async () => {
    try { await auth.signInWithRedirect(); }
    catch (error) { notify(error instanceof Error ? error.message : 'Sign-in could not start. Please retry.'); }
  };

  return (
    <div className="site" id="top">
      <header className="header">
        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
        <BrandMark />
        <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
          <a href="#collection" onClick={() => setMenuOpen(false)}>SHOP <ChevronDown size={12}/></a>
          <a href="#campaign" onClick={() => setMenuOpen(false)}>CAMPAIGN</a>
          <a href="#occasion-lookbook" onClick={() => setMenuOpen(false)}>LOOKBOOK</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>ABOUT</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>CONTACT</a>
        </nav>
        <div className="header-tools">
          <button className="bag-tool" aria-label={'Open shopping bag, ' + bag.length + ' items'} onClick={() => setCheckoutOpen(true)}><ShoppingBag />{bag.length > 0 && <i>{bag.length}</i>}</button>
        </div>
      </header>

      {searchOpen && <div className="searchbar"><Search size={17}/><input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search the VYRA edit..."/><button onClick={() => {setSearch('');setSearchOpen(false);}}><X size={17}/></button></div>}

      <main>
        <section className="hero" aria-label="VYRA campaign">
          <img className="hero-image" src="/resources/vyra-01-black-beach.jpg" alt="Adult model in a black VYRA swimwear look on the beach" style={{objectPosition:'50% 42%'}}/>
          <div className="hero-shade"/>
          <div className="hero-copy"><div className="hero-monogram">V</div><h1>VYRA</h1><p>FEEL CONFIDENT. FEEL YOU.</p><span className="fine-rule"/><button className="outline-button" onClick={() => scrollTo('collection')}>EXPLORE THE COLLECTION <ArrowRight size={15}/></button></div>
          <div className="hero-index">01 <span>—</span> 04</div><div className="hero-caption">THE FREEDOM EDITION <span>·</span> VYRA CAMPAIGN</div>
        </section>

        <section className="editorial-grid" id="campaign">
          {gallery.map((item, index) => <article className={'editorial-card editorial-' + (index + 1)} key={item.caption}>
            <img src={item.image} alt={item.alt} style={{objectPosition:'50% 12%'}}/>
            <div className="editorial-overlay"><p>{item.caption}</p><button onClick={() => scrollTo('collection')}>{item.action} <ArrowRight size={13}/></button></div>
          </article>)}
        </section>

        <section className="occasion-lookbook" id="occasion-lookbook" aria-labelledby="occasion-title">
          <div className="occasion-copy">
            <p className="eyebrow">VYRA · THE DESIGN JOURNAL</p>
            <h2 id="occasion-title">THE ART OF<br/>BEING YOU</h2>
            <p className="occasion-description">A considered approach to expressive fashion: distinctive silhouettes, thoughtful coverage and details that make a look unmistakably yours.</p>
            <div className="occasion-details"><span>THE OCCASION EDIT</span><span>CHAMPAGNE · HAND-BEADED</span></div>
            <a className="occasion-link" href="#contact">ENQUIRE ABOUT THIS LOOK <ArrowRight size={14}/></a>
          </div>
          <figure className="occasion-image">
            <img src="/resources/vyra-champagne-royale.svg" alt="VYRA Champagne Royale occasionwear concept, featuring intricate champagne-toned beadwork" />
            <figcaption>CHAMPAGNE ROYALE · EDITORIAL CONCEPT</figcaption>
          </figure>
        </section>

        <section className="collection-section" id="collection">
          <div className="section-heading"><div><p className="eyebrow">VYRA · THE SIGNATURE EDIT</p><h2>THE COLLECTION</h2></div><p>Distinctive pieces. Thoughtful coverage.<br/>Find the design that feels like you.</p></div>
          <div className="collection-tools"><span>{visibleLooks.length} EDITORIAL LOOKS</span><div className="collection-actions"><button onClick={() => setSearchOpen(v => !v)}><Search size={14}/> SEARCH LOOKS</button><span>AVAILABILITY ON REQUEST</span></div></div>
          <div className="product-grid">
            {visibleLooks.map(item => {
              const index = looks.indexOf(item);
              return <article className="product-card" key={item.name}>
                <div className="product-photo"><img src={item.image} alt={item.alt} style={{objectPosition:'50% 12%'}}/>
                  <button className={saved.includes(index) ? 'heart saved' : 'heart'} onClick={() => setSaved(current => current.includes(index) ? current.filter(n => n !== index) : [...current,index])} aria-label={saved.includes(index) ? 'Remove saved look' : 'Save look'}><Heart size={18} fill={saved.includes(index) ? 'currentColor' : 'none'}/></button>
                  <button className="quick-view" onClick={() => addToBag(item.name)}>ADD THIS LOOK <ArrowUpRight size={14}/></button>
                </div>
                <div className="product-meta"><div><h3>{item.name}</h3><p>{item.line}</p></div><span>{item.colour}</span></div>
                <button className="add-preview" onClick={() => addToBag(item.name)}>REQUEST AVAILABILITY <ArrowRight size={13}/></button>
              </article>;
            })}
          </div>
          {visibleLooks.length === 0 && <div className="empty">No looks found. Try another search.</div>}
        </section>

        <section className="manifesto" id="about">
          <img src="/resources/vyra-11-purple-sunlit.jpg" alt="Adult model in a purple VYRA swimwear editorial" style={{objectPosition:'50% center'}}/>
          <div className="manifesto-shade"/><div className="manifesto-copy"><p className="eyebrow">THE VYRA POINT OF VIEW</p><h2>FEEL<br/>UNAPOLOGETIC.</h2><p>YOUR BODY. YOUR STYLE.<br/>YOUR FREEDOM.</p><button onClick={() => scrollTo('collection')}>DISCOVER VYRA <ArrowRight size={14}/></button></div>
        </section>

        <section className="values"><div><Diamond/><span>DESIGNED FOR SELF-EXPRESSION</span></div><div><ShieldCheck/><span>CONFIDENCE, YOUR WAY</span></div><div><Globe2/><span>FREEDOM OF PERSONAL STYLE</span></div><div><Heart/><span>MADE TO FEEL LIKE YOU</span></div></section>
      </main>

      <footer className="footer" id="contact"><BrandMark/><p>FEEL CONFIDENT. FEEL YOU.</p><span className="footer-contact">DESIGNED FOR YOUR OWN KIND OF EXPRESSION</span><span>© VYRA · THE FREEDOM EDITION</span><button className="owner-link" onClick={openAdmin}><LockKeyhole size={12}/> OWNER</button></footer>

      {checkoutOpen && <div className="modal-backdrop" role="presentation" onMouseDown={e => {if (e.target === e.currentTarget) setCheckoutOpen(false);}}>
        <section className="store-modal" role="dialog" aria-modal="true" aria-labelledby="bag-title">
          <div className="modal-head"><div><p className="eyebrow">YOUR VYRA EDIT</p><h2 id="bag-title">YOUR BAG <span>({cartLooks.length})</span></h2></div><button onClick={() => setCheckoutOpen(false)} aria-label="Close bag"><X/></button></div>
          {cartLooks.length === 0 ? <div className="bag-empty"><ShoppingBag size={28}/><p>Your bag is waiting for a little freedom.</p><button className="solid-button" onClick={() => {setCheckoutOpen(false);scrollTo('collection');}}>EXPLORE THE COLLECTION</button></div> :
            <><div className="bag-items">{cartLooks.map((item,index) => <div className="bag-item" key={item.name + index}><img src={item.image} alt={item.alt}/><div><h3>{item.name}</h3><p>{item.colour} · Availability on request</p><button onClick={() => removeFromBag(index)}><Trash2 size={13}/> REMOVE</button></div></div>)}</div>
            <p className="order-note">This is an availability request, not a paid order. Our team will confirm product details, pricing and delivery before you commit.</p>
            <form className="checkout-form" onSubmit={submitOrder}><h3>WHERE CAN WE REACH YOU?</h3>
              <label>Full name<input required minLength={2} maxLength={80} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} autoComplete="name"/></label>
              <label>Phone / WhatsApp<input required minLength={7} maxLength={24} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} autoComplete="tel"/></label>
              <label>City<input required maxLength={80} value={form.city} onChange={e=>setForm({...form,city:e.target.value})} autoComplete="address-level2"/></label>
              <label>Delivery address<textarea required maxLength={500} value={form.address} onChange={e=>setForm({...form,address:e.target.value})} autoComplete="street-address"/></label>
              <label>Notes (optional)<textarea maxLength={500} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
              <button className="solid-button submit-order" disabled={submitting}>{submitting ? 'SENDING REQUEST…' : 'SEND AVAILABILITY REQUEST'} <ArrowRight size={15}/></button>
            </form></>}
        </section>
      </div>}

      {adminOpen && <div className="modal-backdrop" role="presentation"><section className="store-modal admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-title">
        <div className="modal-head"><div><p className="eyebrow">PRIVATE STORE MANAGEMENT</p><h2 id="admin-title">VYRA ORDERS</h2></div><button onClick={() => {window.location.hash='';setAdminOpen(false);}} aria-label="Close owner panel"><X/></button></div>
        {!user ? <div className="bag-empty"><LockKeyhole size={28}/><p>Sign in with the VYRA AppDeploy owner account to manage customer requests.</p><button className="solid-button" onClick={signIn}>OWNER SIGN IN</button></div> :
          <><div className="admin-user"><span>{user.email || user.name || 'Signed in'}</span><button onClick={async()=>{await auth.signOut();setUser(null);setOrders([]);}}>SIGN OUT <LogOut size={13}/></button></div>
          {adminLoading ? <p className="admin-empty">Loading requests…</p> : orders.length === 0 ? <p className="admin-empty">No customer requests yet.</p> :
            <div className="admin-orders">{orders.map(order=><article className="admin-order" key={order.id}><div className="admin-order-top"><div><strong>{order.name}</strong><small>{new Date(order.createdAt).toLocaleString()}</small></div><select value={order.status} onChange={e=>updateOrderStatus(order.id,e.target.value)}><option value="new">New</option><option value="contacted">Contacted</option><option value="confirmed">Confirmed</option><option value="closed">Closed</option></select></div><p>{order.phone} · {order.city}</p><p>{order.address}</p><p>{order.items.map(item=>item.name + ' (' + item.colour + ')').join(', ')}</p>{order.notes && <small>Note: {order.notes}</small>}</article>)}</div>}
          </>}
      </section></div>}
      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  );
}
export default App;
