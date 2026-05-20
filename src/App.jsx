import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import transparentLogo from './MEDIA/Beagles trasnparent logo.png';
import appBackground from './MEDIA/Beagles background.png';

const getColorHex = (colorName) => {
  const colors = {
    'red': '#ff4757', 'orange': '#e67e22', 'blue': '#0984e3',
    'green': '#2ed573', 'purple': '#9b59b6', 'pink': '#ff9ff3', 'yellow': '#feca57'
  };
  return colors[colorName?.toLowerCase()] || '#555'; 
};

const GTAStar = ({ filled, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ margin: '0 1px', filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.8))' }}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={filled ? "#ffaa00" : "rgba(255,255,255,0.15)"} stroke="#000" strokeWidth="2.5" strokeLinejoin="round"/>
  </svg>
);

const StarRating = ({ thc, size = 11 }) => {
  let count = thc >= 24 ? 5 : thc >= 20 ? 4 : thc >= 15 ? 3 : thc >= 10 ? 2 : 1;
  return <div style={{ display: 'flex', alignItems: 'center' }}>{[1,2,3,4,5].map(i => <GTAStar key={i} filled={i <= count} size={size} />)}</div>;
};

const GeneticsTag = ({ type }) => {
  if (!type) return null;
  const colors = {"sativa":"#e15f41","indica":"#786fa6","hybrid":"#3dc1d3"};
  return <span style={{ background: colors[type.toLowerCase()] || "#555", color: '#fff', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{type}</span>;
};

const MediaDisplay = ({ type, url, alt }) => {
  if (type === 'video') return <video autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}><source src={url} type="video/mp4" /></video>;
  return <img src={url} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

function App() {
  const [strainsData, setStrainsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');
  const [selectedStrain, setSelectedStrain] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const sheetCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMDNd_J2nMddIt3927OuBVC2TLvbNcCQSwjQsfGEWmpJpt0rmsL-WRBbEo4w4UkPjlJInP4_zGxWLv/pub?output=csv";
    Papa.parse(sheetCsvUrl, {
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => {
        const formattedData = results.data.map(row => {
          const tiers = [];
          if (row.tier1_size && row.tier1_price) tiers.push({ size: row.tier1_size, price: row.tier1_price });
          if (row.tier2_size && row.tier2_price) tiers.push({ size: row.tier2_size, price: row.tier2_price });
          if (row.tier3_size && row.tier3_price) tiers.push({ size: row.tier3_size, price: row.tier3_price });
          return { ...row, thc: parseInt(row.thc, 10) || 0, startingPrice: parseInt(row.startingPrice, 10) || 0, tagColor: getColorHex(row.tagColor), tiers };
        });
        setStrainsData(formattedData);
        setLoading(false);
      }
    });
  }, []);

  const addToCart = (strain, tier) => { setCart([...cart, { ...strain, selectedTier: tier, cartId: Date.now() }]); setSelectedStrain(null); setActiveTab('cart'); };
  const removeFromCart = (cartId) => { setCart(cart.filter(item => item.cartId !== cartId)); };
  const calculateTotal = () => cart.reduce((sum, item) => sum + parseInt(item.selectedTier.price.replace('€', ''), 10), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const orderText = `🛒 Order: ${cart.map(i => `${i.name} (${i.selectedTier.size})`).join(', ')} | Total: €${calculateTotal()}`;
    await fetch("https://hook.eu1.make.com/uftj5ohu25p63a5a7656fnlclbetra8s", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: orderText })
    });
    setCart([]); setActiveTab('menu');
  };

  if (loading) return <div style={{background:'#0a0a0a', minHeight:'100vh', display:'flex', justifyContent:'center', alignItems:'center', color:'#ffaa00'}}><h2>Loading...</h2></div>;

  if (selectedStrain) {
    const isSoldOut = selectedStrain.status?.toLowerCase() === 'sold out';
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
        <button onClick={() => setSelectedStrain(null)} style={{ background: 'none', border: 'none', color: '#fff', padding: '20px' }}>← Back</button>
        <div style={{ padding: '20px' }}>
          <MediaDisplay type={selectedStrain.mediaType} url={selectedStrain.mediaUrl} />
          <h1>{selectedStrain.name}</h1>
          {selectedStrain.tiers.map((tier, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid #333' }}>
              <span>{tier.size} - {tier.price}</span>
              <button onClick={() => addToCart(selectedStrain, tier)}>Add</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a0a', backgroundImage: `url(${appBackground})`, minHeight: '100vh', color: '#fff', paddingBottom: '100px' }}>
      <div style={{ textAlign: 'center', padding: '20px' }}><img src={transparentLogo} alt="Logo" style={{ maxWidth: '170px' }} /></div>
      
      {activeTab === 'menu' && (
        <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {strainsData.map((strain, index) => (
            <div key={index} onClick={() => setSelectedStrain(strain)} style={{ background: '#111', padding: '10px', borderRadius: '10px' }}>
              <MediaDisplay type={strain.mediaType} url={strain.mediaUrl} />
              <h3>{strain.name}</h3>
              <StarRating thc={strain.thc} />
              <div>From €{strain.startingPrice}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'cart' && (
        <div style={{ padding: '20px' }}>
          {cart.map(item => (
             <div key={item.cartId}>{item.name} - {item.selectedTier.price} <button onClick={() => removeFromCart(item.cartId)}>X</button></div>
          ))}
          <button onClick={handleCheckout}>Checkout €{calculateTotal()}</button>
        </div>
      )}

      {activeTab === 'info' && <div style={{padding:'20px'}}>Info Page</div>}

      <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', height: '60px', background: '#111', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <button onClick={() => setActiveTab('menu')}>MENU</button>
        <button onClick={() => setActiveTab('cart')}>CART</button>
        <button onClick={() => setActiveTab('info')}>INFO</button>
      </div>
    </div>
  );
}
export default App;