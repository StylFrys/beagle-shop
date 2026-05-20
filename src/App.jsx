import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import transparentLogo from './MEDIA/Beagles trasnparent logo.png';
import appBackground from './MEDIA/Beagles background.png';

const getColorHex = (c) => ({'red':'#ff4757','orange':'#e67e22','blue':'#0984e3','green':'#2ed573','purple':'#9b59b6','pink':'#ff9ff3','yellow':'#feca57'})[c?.toLowerCase()] || '#555';

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

const MediaDisplay = ({ type, url }) => {
  if (type === 'video') return <video autoPlay loop muted playsInline style={{width:'100%', height:'160px', objectFit:'cover'}}><source src={url} type="video/mp4" /></video>;
  return <img src={url} alt="product" style={{width:'100%', height:'160px', objectFit:'cover'}} />;
};

function App() {
  const [strainsData, setStrainsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vTMDNd_J2nMddIt3927OuBVC2TLvbNcCQSwjQsfGEWmpJpt0rmsL-WRBbEo4w4UkPjlJInP4_zGxWLv/pub?output=csv", {
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => {
        setStrainsData(results.data.map(row => ({
          ...row, 
          thc: parseInt(row.thc, 10) || 0,
          startingPrice: parseInt(row.startingPrice, 10) || 0,
          tagColor: getColorHex(row.tagColor)
        })));
        setLoading(false);
      }
    });
  }, []);

  return (
    <div style={{ background: '#0a0a0a', backgroundImage: `url(${appBackground})`, backgroundAttachment: 'fixed', minHeight: '100vh', color: '#fff', paddingBottom: '100px' }}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <img src={transparentLogo} alt="Logo" style={{ maxWidth: '170px' }} /> 
      </div>

      {activeTab === 'menu' && (
        <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {strainsData.map((strain, index) => {
            const isSoldOut = strain.status?.toLowerCase() === 'sold out';
            return (
             <div key={index} style={{ background: 'rgba(18, 18, 18, 0.9)', backdropFilter: 'blur(5px)', borderRadius: '14px', overflow: 'hidden', padding: '10px', border: '1px solid #222' }}>
               <div style={{ position: 'relative' }}>
                 <MediaDisplay type={strain.mediaType} url={strain.mediaUrl} />
                 <span style={{ position: 'absolute', top: '5px', right: '5px', background: strain.tagColor, fontSize: '9px', padding: '2px 6px', borderRadius: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>{strain.category}</span>
                 {isSoldOut && <div style={{position:'absolute', top:'0', left:'0', width:'100%', height:'160px', background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', color:'#ff4757'}}>SOLD OUT</div>}
               </div>
               
               <h3 style={{ fontSize: '13px', margin: '10px 0 5px 0', fontWeight: '900' }}>{strain.name}</h3>
               
               <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
                 <GeneticsTag type={strain.genetics} />
                 <span style={{ fontSize: '9px', background: '#333', padding: '2px 6px', borderRadius: '4px' }}>{strain.thc}% THC</span>
               </div>
               
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '4px', marginBottom: '10px' }}>
                 <span style={{ fontSize: '7px', color: '#888', textTransform: 'uppercase' }}>Dope's Strength</span>
                 <StarRating thc={strain.thc} />
               </div>

               <div style={{ fontSize: '14px', fontWeight: '900', color: isSoldOut ? '#555' : '#e67e22' }}>From €{strain.startingPrice}</div>
             </div>
          )})}
        </div>
      )}

      {activeTab === 'cart' && <div style={{padding:'20px', color:'#fff', textAlign:'center'}}><h2>Cart</h2><p>Your cart is empty.</p></div>}
      {activeTab === 'info' && <div style={{padding:'20px', color:'#fff', textAlign:'center'}}><h2>Info Page</h2></div>}

      <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', height: '60px', background: 'rgba(10,10,10,0.95)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop:'1px solid #333' }}>
        <button onClick={() => setActiveTab('menu')} style={{ background:'none', border:'none', color: activeTab === 'menu' ? '#e67e22' : '#fff', fontSize:'12px', fontWeight:'bold' }}>MENU</button>
        <button onClick={() => setActiveTab('cart')} style={{ background:'none', border:'none', color: activeTab === 'cart' ? '#e67e22' : '#fff', fontSize:'12px', fontWeight:'bold' }}>CART</button>
        <button onClick={() => setActiveTab('info')} style={{ background:'none', border:'none', color: activeTab === 'info' ? '#e67e22' : '#fff', fontSize:'12px', fontWeight:'bold' }}>INFO</button>
      </div>
    </div>
  );
}
export default App;