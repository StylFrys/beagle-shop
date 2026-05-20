import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import transparentLogo from './MEDIA/Beagles trasnparent logo.png';
import appBackground from './MEDIA/Beagles background.png';

const getColorHex = (c) => ({'red':'#ff4757','orange':'#e67e22','blue':'#0984e3','green':'#2ed573','purple':'#9b59b6','pink':'#ff9ff3','yellow':'#feca57'})[c?.toLowerCase()] || '#555';

const MediaDisplay = ({ type, url }) => {
  if (type === 'video') return <video autoPlay loop muted playsInline style={{width:'100%', height:'160px', objectFit:'cover'}}><source src={url} type="video/mp4" /></video>;
  return <img src={url} alt="product" style={{width:'100%', height:'160px', objectFit:'cover'}} />;
};

function App() {
  const [strainsData, setStrainsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');
  const [cart] = useState([]);

  useEffect(() => {
    Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vTMDNd_J2nMddIt3927OuBVC2TLvbNcCQSwjQsfGEWmpJpt0rmsL-WRBbEo4w4UkPjlJInP4_zGxWLv/pub?output=csv", {
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => {
        setStrainsData(results.data.map(row => ({
          ...row, 
          thc: parseInt(row.thc, 10), 
          startingPrice: parseInt(row.startingPrice, 10),
          tagColor: getColorHex(row.tagColor)
        })));
        setLoading(false);
      }
    });
  }, []);

  if (loading) return <div style={{background:'#0a0a0a', minHeight:'100vh', display:'flex', justifyContent:'center', alignItems:'center', color:'#ffaa00'}}><h2>Loading...</h2></div>;

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff', paddingBottom: '100px' }}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <img src={transparentLogo} alt="Logo" style={{ maxWidth: '170px' }} /> 
      </div>

      {activeTab === 'menu' && (
        <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {strainsData.map((strain, index) => {
             const isSoldOut = strain.status?.toLowerCase() === 'sold out';
             return (
             <div key={index} style={{ background: '#111', borderRadius: '14px', overflow: 'hidden', padding: '10px', position: 'relative' }}>
               <MediaDisplay type={strain.mediaType} url={strain.mediaUrl} />
               {isSoldOut && <div style={{position:'absolute', top:'10px', left:'10px', background:'#ff4757', padding:'2px 5px', borderRadius:'4px', fontSize:'10px', fontWeight:'900'}}>SOLD OUT</div>}
               <h3 style={{ fontSize: '14px', margin: '10px 0 5px 0' }}>{strain.name}</h3>
               <div style={{ fontSize: '11px', color: '#888' }}>{strain.category} • {strain.thc}% THC</div>
               <div style={{ marginTop: '10px', fontSize: '14px', fontWeight: '900', color: isSoldOut ? '#555' : '#e67e22' }}>€{strain.startingPrice}</div>
             </div>
          )})}
        </div>
      )}

      {activeTab === 'cart' && <div style={{padding:'20px', color:'#fff', textAlign:'center'}}>Cart is currently empty.</div>}
      {activeTab === 'info' && <div style={{padding:'20px', color:'#fff', textAlign:'center'}}>Beagle Boyz Info.</div>}

      <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', height: '70px', background: '#111', display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop:'1px solid #333' }}>
        <button onClick={() => setActiveTab('menu')} style={{ background:'none', border:'none', color: activeTab === 'menu' ? '#e67e22' : '#fff', fontWeight:'bold' }}>MENU</button>
        <button onClick={() => setActiveTab('cart')} style={{ background:'none', border:'none', color: activeTab === 'cart' ? '#e67e22' : '#fff', fontWeight:'bold' }}>CART</button>
        <button onClick={() => setActiveTab('info')} style={{ background:'none', border:'none', color: activeTab === 'info' ? '#e67e22' : '#fff', fontWeight:'bold' }}>INFO</button>
      </div>
    </div>
  );
}
export default App;