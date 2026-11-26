import { useEffect, useMemo, useState } from 'react';
import { api, auth } from './api';
import {
  ArrowRight, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, Heart, Menu, Search, ShoppingBag,
  X, Diamond, ShieldCheck, Globe2, Trash2, LockKeyhole, LogOut
} from 'lucide-react';

type Look = { name: string; line: string; colour: string; image: string; alt: string; gallery: string[]; description: string; details: string[] };
type CartItem = { name: string; size: string };
type Order = { id: string; name: string; phone: string; city: string; address: string; notes?: string; items: { name: string; colour: string; size: string }[]; status: string; createdAt: string };

const looks: Look[] = [
  { name: 'Noir Muse', line: 'THE SCULPTED EDIT', colour: 'Midnight', image: '/resources/vyra-07-black-studio.jpg', alt: 'Adult model wearing a sculptural black VYRA fashion look in a studio editorial', gallery: ['/resources/vyra-07-black-studio.jpg','/resources/vyra-13-black-resort.jpg','/resources/vyra-01-black-beach.jpg'], description: 'A confident, sculptural black look with a clean editorial point of view.', details: ['Sculptural black styling','Midnight colour story','Size and availability confirmed on request'] },
  { name: 'Tidal Form', line: 'THE COASTAL EDIT', colour: 'Lagoon', image: '/resources/vyra-09-blue-rocky-shore.jpg', alt: 'Adult model wearing a blue VYRA fashion look on a rocky shoreline', gallery: ['/resources/vyra-09-blue-rocky-shore.jpg','/resources/vyra-15-blue-kneeling.jpg','/resources/vyra-03-blue-beach.jpg'], description: 'A vivid coastal statement inspired by clear water and open horizons.', details: ['Lagoon blue colour story','Coastal-inspired styling','Size and availability confirmed on request'] },
  { name: 'Garden Muse', line: 'THE BOTANICAL EDIT', colour: 'Emerald', image: '/resources/vyra-10-emerald-garden.jpg', alt: 'Adult model wearing an emerald VYRA fashion look in a tropical garden', gallery: ['/resources/vyra-10-emerald-garden.jpg','/resources/vyra-16-emerald-portrait.jpg','/resources/vyra-04-emerald-tropical.jpg'], description: 'A rich emerald look that brings a fresh, botanical mood to the VYRA edit.', details: ['Emerald colour story','Botanical-inspired styling','Size and availability confirmed on request'] },
  { name: 'Ivory Hour', line: 'THE LIGHT STUDY', colour: 'Ivory', image: '/resources/vyra-12-white-pool.jpg', alt: 'Adult model wearing an ivory VYRA fashion look beside a pool', gallery: ['/resources/vyra-12-white-pool.jpg','/resources/vyra-06-white-poolside.jpg'], description: 'An understated ivory look with a light, polished resort mood.', details: ['Soft ivory colour story','Light, refined styling','Size and availability confirmed on request'] },
  { name: 'Noir Royale', line: 'THE GOLDEN HOUR SWIM EDIT', colour: 'Black & Gold', image: '/resources/noir-royale-product.webp', alt: 'Noir Royale black bikini with polished gold ring hardware, shown from front, back and detail angles beside a pool at golden hour', gallery: ['/resources/noir-royale-product.webp'], description: 'A black VYRA swim design finished with polished gold ring hardware. The supplied product image presents front, back and detail views together.', details: ['Black with gold-tone ring hardware','Front, back and detail views in the product image','Size and availability confirmed on request'] },
  { name: 'Champagne Royale', line: 'THE SIGNATURE EMBELLISHED EDIT', colour: 'Champagne Gold', image: '/resources/vyra-champagne-royale.svg', alt: 'Champagne Royale, a VYRA occasion look with intricate champagne-toned embellishment', gallery: ['/resources/vyra-champagne-royale.svg','/resources/vyra-lookbook-2026.png'], description: 'A statement occasion concept with intricate champagne-toned embellishment.', details: ['Champagne gold palette','Embellished occasion styling','Size and availability confirmed on request'] },
  { name: 'Ruby Reverie', line: 'THE RED COAST EDIT', colour: 'Ruby Red', image: '/resources/vyra-02-red-coast.jpg', alt: 'Adult model wearing a red VYRA fashion look on a sunlit coast', gallery: ['/resources/vyra-02-red-coast.jpg','/resources/vyra-08-red-back-view.jpg','/resources/vyra-14-red-curvy-resort.jpg'], description: 'A bold red edit with striking resort energy and a confident silhouette.', details: ['Ruby red colour story','Three campaign angles','Size and availability confirmed on request'] },
  { name: 'Amethyst Afterglow', line: 'THE AFTER HOURS EDIT', colour: 'Amethyst', image: '/resources/vyra-05-purple-resort.jpg', alt: 'Adult model wearing a purple VYRA resort fashion look', gallery: ['/resources/vyra-05-purple-resort.jpg','/resources/vyra-11-purple-sunlit.jpg'], description: 'A rich purple resort look made for golden light and after-hours confidence.', details: ['Amethyst purple colour story','Two campaign angles','Size and availability confirmed on request'] },
  { name: 'Sapphire Muse', line: 'THE BLUE HOUR EDIT', colour: 'Sapphire', image: '/resources/vyra-03-blue-beach.jpg', alt: 'Adult model wearing a sapphire blue VYRA fashion look beside the sea', gallery: ['/resources/vyra-03-blue-beach.jpg','/resources/vyra-15-blue-kneeling.jpg','/resources/vyra-09-blue-rocky-shore.jpg'], description: 'A saturated sapphire statement inspired by the blue hour beside the sea.', details: ['Sapphire blue colour story','Three campaign angles','Size and availability confirmed on request'] }
];
const heroSlides = [
  { image: '/resources/vyra-01-black-beach.jpg', alt: 'Black VYRA fashion look on a beach', label: 'THE NOIR EDIT', caption: 'CONFIDENCE IN EVERY DETAIL.' },
  { image: '/resources/vyra-02-red-coast.jpg', alt: 'Red VYRA fashion look on a sunlit coast', label: 'THE COLOR STORY', caption: 'THREE MOODS. ONE SIGNATURE.' },
  { image: '/resources/vyra-03-blue-beach.jpg', alt: 'Sapphire blue VYRA fashion editorial beside the sea', label: 'THE TIDAL EDIT', caption: 'MAKE WAVES WITHOUT SAYING A WORD.' },
  { image: '/resources/vyra-04-emerald-tropical.jpg', alt: 'Emerald VYRA fashion look in a tropical setting', label: 'THE BOTANICAL EDIT', caption: 'A BRIGHTER KIND OF BOLD.' },
  { image: '/resources/vyra-05-purple-resort.jpg', alt: 'Purple VYRA resort fashion look', label: 'THE ROYAL EDIT', caption: 'DRESS FOR THE MOMENT.' },
  { image: '/resources/vyra-06-white-poolside.jpg', alt: 'Ivory VYRA fashion look beside a pool', label: 'THE CHAMPAGNE EDIT', caption: 'DETAILS THAT CATCH THE LIGHT.' },
  { image: '/resources/vyra-07-black-studio.jpg', alt: 'Black VYRA fashion look in a studio editorial', label: 'THE NOIR DETAIL', caption: 'QUIETLY UNFORGETTABLE.' },
  { image: '/resources/vyra-08-red-back-view.jpg', alt: 'Red VYRA resort fashion editorial from the back', label: 'THE RED CARPET EDIT', caption: 'EVERY ANGLE, YOURS.' },
  { image: '/resources/vyra-09-blue-rocky-shore.jpg', alt: 'Blue VYRA fashion look on a rocky shoreline', label: 'THE COASTAL EDIT', caption: 'WHERE FREEDOM MEETS THE COAST.' },
  { image: '/resources/vyra-10-emerald-garden.jpg', alt: 'Emerald VYRA fashion look in a tropical garden', label: 'THE EMERALD EDIT', caption: 'A NATURAL KIND OF STATEMENT.' },
  { image: '/resources/vyra-11-purple-sunlit.jpg', alt: 'Purple VYRA editorial in warm sunlight', label: 'THE AFTER HOURS EDIT', caption: 'AN ENTRANCE THAT LINGERS.' },
  { image: '/resources/vyra-12-white-pool.jpg', alt: 'Ivory VYRA look by the pool', label: 'THE GOLDEN EDIT', caption: 'GLOW IN EVERY ROOM.' },
  { image: '/resources/vyra-13-black-resort.jpg', alt: 'Black VYRA resort fashion look', label: 'THE EMBELLISHED EDIT', caption: 'MADE TO BE NOTICED.' },
  { image: '/resources/vyra-14-red-curvy-resort.jpg', alt: 'Red VYRA resort fashion look', label: 'THE PLUM EDIT', caption: 'A LITTLE MORE DRAMA.' },
  { image: '/resources/vyra-15-blue-kneeling.jpg', alt: 'Blue VYRA fashion editorial by the water', label: 'THE BLUE HOUR EDIT', caption: 'OWN EVERY MOMENT.' },
  { image: '/resources/vyra-16-emerald-portrait.jpg', alt: 'Emerald VYRA editorial portrait', label: 'THE SIGNATURE EDIT', caption: 'AN ICON IN THE MAKING.' }
];
const gallery = [
  { image: '/resources/vyra-02-red-coast.jpg', alt: 'Red VYRA fashion editorial on a sunlit coast', caption: 'MADE FOR YOUR KIND OF CONFIDENCE.', action: 'DISCOVER THE EDIT' },
  { image: '/resources/vyra-03-blue-beach.jpg', alt: 'Blue fashion editorial by the sea', caption: 'YOUR STYLE HAS NO RULEBOOK.', action: 'SHOP THE MOOD' },
  { image: '/resources/vyra-04-emerald-tropical.jpg', alt: 'Emerald fashion editorial in a tropical setting', caption: 'MAKE EVERY LOOK YOURS.', action: 'EXPLORE VYRA' }
];

function BrandMark() {
  return <a className="brand" href="#top" aria-label="VYRA home"><span className="brand-v">V</span><span className="brand-word">VYRA</span></a>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHero, setActiveHero] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHero(current => (current + 1) % heroSlides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, []);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState<number[]>([]);
  const [bag, setBag] = useState<CartItem[]>(() => {
    try {
      const stored = window.localStorage.getItem('vyra-bag');
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.map((item: any) => typeof item === 'string' ? { name: item, size: 'M' } : item).filter((item: any) => item && typeof item.name === 'string' && typeof item.size === 'string' && looks.some(look => look.name === item.name)) : [];
    } catch { return []; }
  });
  const [selectedSize, setSelectedSize] = useState('M');
  const [requestId, setRequestId] = useState(() => {
    try { return window.localStorage.getItem('vyra-request-id') || crypto.randomUUID(); }
    catch { return crypto.randomUUID(); }
  });
  const [notice, setNotice] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedLook, setSelectedLook] = useState<Look | null>(null);
  const [activeProductImage, setActiveProductImage] = useState('');
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
    const syncHash = () => {
      const hash = window.location.hash;
      setAdminOpen(hash === '#admin');
      if (hash.startsWith('#product/')) {
        const slug = decodeURIComponent(hash.slice(9));
        const product = looks.find(item => item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);
        setSelectedLook(product || null);
        if (product) setActiveProductImage(product.gallery[0] || product.image);
      } else setSelectedLook(null);
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
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
  const cartLooks = bag.map(entry => ({ ...looks.find(item => item.name === entry.name)!, size: entry.size })).filter((item): item is Look & { size: string } => Boolean(item.name));

  const openProduct = (item: Look) => {
    setSelectedLook(item);
    setActiveProductImage(item.gallery[0] || item.image);
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    window.location.hash = 'product/' + encodeURIComponent(slug);
  };
  const closeProduct = () => {
    setSelectedLook(null);
    if (window.location.hash.startsWith('#product/')) window.history.replaceState(null, '', window.location.pathname + window.location.search);
  };
  const requestProduct = (item: Look) => {
    addToBag(item.name, selectedSize);
    closeProduct();
    setCheckoutOpen(true);
  };

  const addToBag = (name: string, size = 'M') => {
    setBag(current => [...current, { name, size }]);
    notify(name + ' · size ' + size + ' added to your bag.');
  };
  const removeFromBag = (index: number) => setBag(current => current.filter((_, i) => i !== index));

  const submitOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!cartLooks.length) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/api/orders', {
        requestId, ...form,
        items: cartLooks.map(item => ({ name: item.name, colour: item.colour, size: item.size }))
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
        <section className="hero hero-slider" aria-label="VYRA campaign">
          <div className="hero-track" style={{ '--hero-offset': activeHero } as React.CSSProperties}>
            {[...heroSlides, ...heroSlides].map((slide, index) => <figure
              key={slide.image + index}
              className={index % heroSlides.length === activeHero ? 'hero-frame active' : 'hero-frame'}
            >
              <img
                src={slide.image}
                alt={index < heroSlides.length ? slide.alt : ''}
                width={248}
                height={380}
                loading={index < 6 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
              />
            </figure>)}
          </div>
          <div className="hero-shade"/>
          <div className="hero-copy"><div className="hero-monogram">V</div><h1>VYRA</h1><p>FEEL CONFIDENT. FEEL YOU.</p><span className="fine-rule"/><span className="hero-slide-label">{heroSlides[activeHero].label}</span><button className="outline-button" onClick={() => scrollTo('collection')}>EXPLORE THE COLLECTION <ArrowRight size={15}/></button></div>
          <button className="hero-arrow hero-arrow-left" aria-label="Previous campaign image" onClick={() => setActiveHero(current => (current - 1 + heroSlides.length) % heroSlides.length)}><ChevronLeft/></button>
          <button className="hero-arrow hero-arrow-right" aria-label="Next campaign image" onClick={() => setActiveHero(current => (current + 1) % heroSlides.length)}><ChevronRight/></button>
          <div className="hero-index">{String(activeHero + 1).padStart(2,'0')} <span>—</span> {String(heroSlides.length).padStart(2,'0')}</div>
          <div className="hero-caption">{heroSlides[activeHero].caption} <span>·</span> VYRA CAMPAIGN</div>
          <div className="hero-dots" role="group" aria-label="Choose campaign image">{heroSlides.map((slide,index) => <button key={slide.label} className={index === activeHero ? 'active' : ''} aria-label={'Show campaign image ' + (index + 1)} aria-pressed={index === activeHero} onClick={() => setActiveHero(index)}/>)}</div>
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
            <p className="occasion-description">At VYRA, we believe every woman deserves the freedom to express herself through fashion. We create distinctive designs that celebrate individuality, confidence and personal style — balancing bold expression, thoughtful coverage and comfort.</p>
            <div className="occasion-details"><span>THE VYRA DESIGN LANGUAGE</span><span>EXPRESSION · COVERAGE · COMFORT</span></div>
            <a className="occasion-link" href="#contact">DISCOVER THE VYRA MISSION <ArrowRight size={14}/></a>
          </div>
          <figure className="occasion-image">
            <img src="/resources/vyra-champagne-royale.svg" alt="VYRA Champagne Royale occasionwear concept, featuring intricate champagne-toned beadwork" />
            <figcaption>VYRA · THE SIGNATURE POINT OF VIEW</figcaption>
          </figure>
        </section>

        <section className="collection-section" id="collection">
          <div className="section-heading"><div><p className="eyebrow">VYRA · THE SIGNATURE EDIT</p><h2>THE COLLECTION</h2></div><p>Distinctive pieces. Thoughtful coverage.<br/>Find the design that feels like you.</p></div>
          <div className="collection-tools"><span>{visibleLooks.length} EDITORIAL LOOKS</span><div className="collection-actions"><button onClick={() => setSearchOpen(v => !v)}><Search size={14}/> SEARCH LOOKS</button><span>AVAILABILITY ON REQUEST</span></div></div>
          <div className="product-grid">
            {visibleLooks.map(item => {
              const index = looks.indexOf(item);
              return <article className="product-card" key={item.name}>
                <div className="product-photo" style={item.name === 'Noir Royale' ? { height: 'auto', aspectRatio: '1 / 1' } : undefined}><img src={item.image} alt={item.alt} style={item.name === 'Noir Royale' ? { objectFit: 'contain', objectPosition: 'center', transform: 'none' } : {objectPosition:'50% 12%'}}/>
                  <button className={saved.includes(index) ? 'heart saved' : 'heart'} onClick={() => setSaved(current => current.includes(index) ? current.filter(n => n !== index) : [...current,index])} aria-label={saved.includes(index) ? 'Remove saved look' : 'Save look'}><Heart size={18} fill={saved.includes(index) ? 'currentColor' : 'none'}/></button>
                  <button className="quick-view" onClick={() => openProduct(item)}>VIEW PRODUCT <ArrowUpRight size={14}/></button>
                </div>
                <button className="product-meta product-meta-button" onClick={() => openProduct(item)}><span><h3>{item.name}</h3><p>{item.line}</p></span><span>{item.colour}</span></button>
                <button className="add-preview" onClick={() => openProduct(item)}>VIEW DETAILS <ArrowRight size={13}/></button>
              </article>;
            })}
          </div>
          {visibleLooks.length === 0 && <div className="empty">No looks found. Try another search.</div>}
        </section>

        <section className="manifesto" id="about">
          <img src="/resources/vyra-11-purple-sunlit.jpg" alt="Adult model in a purple VYRA fashion editorial" style={{objectPosition:'50% center'}}/>
          <div className="manifesto-shade"/><div className="manifesto-copy"><p className="eyebrow">THE VYRA POINT OF VIEW</p><h2>FEEL<br/>UNAPOLOGETIC.</h2><p>YOUR BODY. YOUR STYLE.<br/>YOUR FREEDOM.</p><button onClick={() => scrollTo('collection')}>DISCOVER VYRA <ArrowRight size={14}/></button></div>
        </section>

        <section className="values"><div><Diamond/><span>DESIGNED FOR SELF-EXPRESSION</span></div><div><ShieldCheck/><span>CONFIDENCE, YOUR WAY</span></div><div><Globe2/><span>FREEDOM OF PERSONAL STYLE</span></div><div><Heart/><span>MADE TO FEEL LIKE YOU</span></div></section>
      </main>

      <footer className="footer" id="contact"><BrandMark/><p>FEEL CONFIDENT. FEEL YOU.</p><span className="footer-contact">DESIGNED FOR YOUR OWN KIND OF EXPRESSION</span><span>© VYRA · THE FREEDOM EDITION</span><button className="owner-link" onClick={openAdmin}><LockKeyhole size={12}/> OWNER</button></footer>


      {selectedLook && <div className="product-detail-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) closeProduct(); }}>
        <section className="product-detail" role="dialog" aria-modal="true" aria-labelledby="product-title">
          <div className="product-detail-top"><a href="#collection" onClick={e => { e.preventDefault(); closeProduct(); scrollTo('collection'); }}>VYRA / THE COLLECTION</a><button onClick={closeProduct} aria-label="Close product page"><X/></button></div>
          <div className="product-detail-layout">
            <div className="product-gallery">
              <div className="product-main-image"><img src={activeProductImage || selectedLook.image} alt={selectedLook.alt} /></div>
              <div className="product-thumbnails" role="group" aria-label="Product images">
                {selectedLook.gallery.map((src,index) => <button key={src} className={activeProductImage === src ? 'active' : ''} onClick={() => setActiveProductImage(src)} aria-label={'Show product image ' + (index + 1)}><img src={src} alt="" /></button>)}
              </div>
            </div>
            <div className="product-detail-copy">
              <p className="eyebrow">VYRA · THE SIGNATURE EDIT</p>
              <h2 id="product-title">{selectedLook.name}</h2>
              <p className="product-detail-line">{selectedLook.line}</p>
              <p className="product-detail-description">{selectedLook.description}</p>
              <div className="product-detail-colour"><span>COLOUR</span><strong>{selectedLook.colour}</strong></div>
              <label className="product-size-picker">SELECT SIZE<select value={selectedSize} onChange={e => setSelectedSize(e.target.value)}>{['XS','S','M','L','XL','XXL'].map(size => <option key={size} value={size}>{size}</option>)}</select></label>
              <div className="product-detail-notes"><span>DESIGN NOTES</span><ul>{selectedLook.details.map(detail => <li key={detail}>{detail}</li>)}</ul></div>
              <p className="product-price-note">Price, available sizes and delivery details are confirmed by our team when you request availability.</p>
              <button className="solid-button product-request-button" onClick={() => requestProduct(selectedLook)}>ORDER NOW <ArrowRight size={15}/></button>
              <p className="product-detail-footnote">No payment is taken on this request. Our team will contact you to confirm the details.</p>
            </div>
          </div>
          <div className="product-detail-bottom"><span>THE VYRA DESIGN LANGUAGE</span><span>EXPRESSION · COVERAGE · COMFORT</span></div>
        </section>
      </div>}

      {checkoutOpen && <div className="modal-backdrop" role="presentation" onMouseDown={e => {if (e.target === e.currentTarget) setCheckoutOpen(false);}}>
        <section className="store-modal" role="dialog" aria-modal="true" aria-labelledby="bag-title">
          <div className="modal-head"><div><p className="eyebrow">YOUR VYRA EDIT</p><h2 id="bag-title">YOUR BAG <span>({cartLooks.length})</span></h2></div><button onClick={() => setCheckoutOpen(false)} aria-label="Close bag"><X/></button></div>
          {cartLooks.length === 0 ? <div className="bag-empty"><ShoppingBag size={28}/><p>Your bag is waiting for a little freedom.</p><button className="solid-button" onClick={() => {setCheckoutOpen(false);scrollTo('collection');}}>EXPLORE THE COLLECTION</button></div> :
            <><div className="bag-items">{cartLooks.map((item,index) => <div className="bag-item" key={item.name + index}><img src={item.image} alt={item.alt}/><div><h3>{item.name}</h3><p>{item.colour} · Size {item.size} · Availability on request</p><button onClick={() => removeFromBag(index)}><Trash2 size={13}/> REMOVE</button></div></div>)}</div>
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
