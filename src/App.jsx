import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import transparentLogo from './MEDIA/Beagles trasnparent logo.png';
import appBackground from './MEDIA/Beagles background.png';

// Color Translator
const getColorHex = (colorName) => {
  const colors = {
    'red': '#ff4757', 'orange': '#e67e22', 'blue': '#0984e3',
    'green': '#2ed573', 'purple': '#9b59b6', 'pink': '#ff9ff3', 'yellow': '#feca57'
  };
  return colors[colorName?.toLowerCase()] || '#555'; 
};

// GTA San Andreas Style Star SVG
const GTAStar = ({ filled, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ margin: '0 1px', filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.8))' }}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={filled ? "#ffaa00" : "rgba(255,255,255,0.15)"} stroke="#000" strokeWidth="2.5" strokeLinejoin="round"/>
  </svg>
);

const StarRating = ({ thc, size = 14 }) => {
  let count = 1;
  if (thc >= 10 && thc < 15) count = 2;
  else if (thc >= 15 && thc < 20) count = 3;
  else if (thc >= 20 && thc < 24) count = 4;
  else if (thc >= 24) count = 5;
  return <div style={{ display: 'flex', alignItems: 'center' }}>{[1,2,3,4,5].map(i => <GTAStar key={i} filled={i <= count} size={size} />)}</div>;
};

const GeneticsTag = ({ type }) => {
  if (!type || type.toLowerCase() === 'none' || type.trim() === '') return null;
  let bgColor = "#555";
  if (type.toLowerCase() === 'sativa') bgColor = "#e15f41";
  if (type.toLowerCase() === 'indica') bgColor = "#786fa6";
  if (type.toLowerCase() === 'hybrid') bgColor = "#3dc1d3";
  return (
    <span style={{ background: bgColor, color: '#fff', fontSize: '9px', fontWeight: '900', padding: '0 6px', borderRadius: '4px', textTransform: 'uppercase', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
      {type}
    </span>
  );
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
          return {
            id: row.id, name: row.name, category: row.category, genetics: row.genetics, description: row.description,
            thc: parseInt(row.thc, 10) || 0, startingPrice: parseInt(row.startingPrice, 10) || 0,
            tagColor: getColorHex(row.tagColor), mediaType: row.mediaType, mediaUrl: row.mediaUrl,
            status: row.status || 'Available', tiers: tiers
          };
        });
        setStrainsData(formattedData);
        setLoading(false);
      }
    });
  }, []);

  const addToCart = (strain, tier) => { setCart([...cart, { ...strain, selectedTier: tier, cartId: Date.now() }]); setSelectedStrain(null); setActiveTab('cart'); };
  const removeFromCart = (cartId) => { setCart(cart.filter(item => item.cartId !== cartId)); };
  const calculateTotal = () => cart.reduce((sum, item) => sum + parseInt(item.selectedTier.price.replace('€', '')), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    const buyerName = user?.first_name || "Unknown Web User";
    const buyerUsername = user?.username ? `@${user.username}` : "No Public Username";
    const buyerId = user?.id || null;
    let orderText = "🛒 *NEW ORDER - BEAGLE BOYZ*\n\n";
    cart.forEach(item => { orderText += `▪️ ${item.name} (${item.selectedTier.size}) : ${item.selectedTier.price}\n`; });
    orderText += `\n💰 *Total: €${calculateTotal()}*\n\n👤 *Customer Profile:*\n▪️ Name: ${buyerName}\n▪️ Handle: ${buyerUsername}\n`;
    if (buyerId) orderText += `▪️ Direct Action: [Open Chat](tg://user?id=${buyerId})\n`;

    try {
      await fetch("https://hook.eu1.make.com/uftj5ohu25p63a5a7656fnlclbetra8s", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: orderText })
      });
      alert("Order sent and the countdown to highness has begun! 🚀");
      setCart([]); setActiveTab('menu');
    } catch { alert("Error transmitting order."); }
  };

  const appStyle = { background: '#0a0a0a', backgroundImage: `url(${appBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', paddingBottom: '100px' };

  if (loading) return <div style={{ ...appStyle, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><h2 style={{ color: '#ffaa00' }}>Loading Menu...</h2></div>;

  if (selectedStrain) {
    const isSoldOut = selectedStrain.status?.toLowerCase() === 'sold out';
    return (
      <div style={appStyle}>
        <div style={{ position: 'relative', zIndex: 100, display: 'flex', alignItems: 'center', padding: '15px 20px 5px 20px' }}>
          <button onClick={() => setSelectedStrain(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>←</button>
          <img src={transparentLogo} alt="Logo" style={{ maxWidth: '120px', height: 'auto', marginLeft: '10px' }} /> 
        </div>
        <div style={{ position: 'relative', width: '100%', height: '350px', background: '#111' }}>
          <MediaDisplay type={selectedStrain.mediaType} url={selectedStrain.mediaUrl} />
          <span style={{ position: 'absolute', top: '15px', right: '15px', background: selectedStrain.tagColor, color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{selectedStrain.category}</span>
        </div>
        <div style={{ padding: '20px' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '900' }}>{selectedStrain.name}</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GeneticsTag type={selectedStrain.genetics} />
              <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '0 6px', borderRadius: '4px', height: '20px', display: 'flex', alignItems: 'center' }}>{selectedStrain.thc}% THC</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.4)', padding: '6px 12px', borderRadius: '8px', width: 'fit-content' }}>
              <span style={{ fontSize: '10px', color: '#aaa', fontWeight: '900', textTransform: 'uppercase' }}>Strength</span>
              <StarRating thc={selectedStrain.thc} size={14} />
            </div>
          </div>
          <p style={{ color: '#ccc', fontSize: '15px', margin: '0 0 30px 0' }}>{selectedStrain.description}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selectedStrain.tiers.map((tier, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 15, 15, 0.9)', border: '1px solid #333', padding: '15px 20px', borderRadius: '12px', opacity: isSoldOut ? 0.5 : 1 }}>
                <div><span style={{ fontWeight: '700', fontSize: '18px', color: '#fff' }}>{tier.size}</span><span style={{ color: isSoldOut ? '#888' : '#e67e22', fontWeight: '800', fontSize: '16px', marginLeft: '10px' }}>{tier.price}</span></div>
                <button onClick={() => { if (!isSoldOut) addToCart(selectedStrain, tier) }} disabled={isSoldOut} style={{ background: isSoldOut ? '#333' : '#ffaa00', color: isSoldOut ? '#666' : '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '900', cursor: isSoldOut ? 'not-allowed' : 'pointer' }}>{isSoldOut ? 'SOLD OUT' : 'ADD'}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={appStyle}>
      <div style={{ position: 'relative', zIndex: 50, textAlign: 'center', padding: '10px 20px 0px 20px' }}>
        <img src={transparentLogo} alt="Logo" style={{ maxWidth: '170px', height: 'auto' }} /> 
      </div>
      {activeTab === 'menu' && (
        <div style={{ padding: '5px 20px 20px 20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          {strainsData.map((strain) => {
            const isSoldOut = strain.status?.toLowerCase() === 'sold out';
            return (
              <div key={strain.id} onClick={() => setSelectedStrain(strain)} style={{ background: 'rgba(18, 18, 18, 0.9)', borderRadius: '14px', overflow: 'hidden', border: '1px solid #222', cursor: 'pointer', position: 'relative' }}>
                <div style={{ position: 'relative', width: '100%', height: '160px' }}>
                  <MediaDisplay type={strain.mediaType} url={strain.mediaUrl} />
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: strain.tagColor, color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>{strain.category}</span>
                  {isSoldOut && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ background: '#ff4757', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontWeight: '900', transform: 'rotate(-10deg)' }}>SOLD OUT</div></div>}
                </div>
                <div style={{ padding: '12px', opacity: isSoldOut ? 0.6 : 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '900' }}>{strain.name}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <GeneticsTag type={strain.genetics} />
                      <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '0 6px', borderRadius: '4px', height: '20px', display: 'flex', alignItems: 'center' }}>{strain.thc}% THC</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.4)', padding: '4px 6px', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '7px', color: '#aaa', fontWeight: '900', textTransform: 'uppercase' }}>Dope's</span><span style={{ fontSize: '7px', color: '#aaa', fontWeight: '900', textTransform: 'uppercase' }}>Strength</span></div>
                      <StarRating thc={strain.thc} size={11} />
                    </div>
                  </div>
                  <div style={{ background: 'rgba(0, 0, 0, 0.5)', borderRadius: '8px', padding: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: '#888', fontWeight: '600' }}>From</span><span style={{ fontSize: '14px', fontWeight: '900', color: isSoldOut ? '#888' : '#e67e22' }}>€{strain.startingPrice}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {activeTab === 'cart' && ( /* Add your cart logic here */ )}
      {activeTab === 'info' && ( /* Add your info logic here */ )}
      <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', height: '70px', background: 'rgba(10,10,10,0.95)', borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 1000 }}>
        <button onClick={() => setActiveTab('menu')} style={{ background: 'none', border: 'none', color: activeTab === 'menu' ? '#e67e22' : '#555' }}>MENU</button>
        <button onClick={() => setActiveTab('cart')} style={{ background: 'none', border: 'none', color: activeTab === 'cart' ? '#e67e22' : '#555' }}>CART</button>
        <button onClick={() => setActiveTab('info')} style={{ background: 'none', border: 'none', color: activeTab === 'info' ? '#e67e22' : '#555' }}>INFO</button>
      </div>
    </div>
  );
}
export default App;