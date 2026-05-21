import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import transparentLogo from './MEDIA/Beagles trasnparent logo.png';
import appBackground from './MEDIA/Beagles background.png';
import candyShopAudio from './MEDIA/candy_shop.mp3';

// GTA San Andreas Style Star SVG (Scaled down to 13px to fit mobile grid)
const GTAStar = ({ filled }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" style={{ margin: '0 1px', filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.8))' }}>
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={filled ? "#ffaa00" : "rgba(255,255,255,0.15)"}
      stroke="#000"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

// Potency Logic Component 
const StarRating = ({ thc }) => {
  let count = 1;
  if (thc >= 10 && thc < 15) count = 2;
  else if (thc >= 15 && thc < 20) count = 3;
  else if (thc >= 20 && thc < 24) count = 4;
  else if (thc >= 24) count = 5;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {[1,2,3,4,5].map(i => <GTAStar key={i} filled={i <= count} />)}
    </div>
  );
};

// Genetics Tag Component
const GeneticsTag = ({ type }) => {
  let bgColor = "#555";
  if (type.toLowerCase() === 'sativa') bgColor = "#e15f41";
  if (type.toLowerCase() === 'indica') bgColor = "#786fa6";
  if (type.toLowerCase() === 'hybrid') bgColor = "#3dc1d3";

  return (
    <span style={{ background: bgColor, color: '#fff', fontSize: '9px', fontWeight: '900', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {type}
    </span>
  );
};

// Reusable Media Component
const MediaDisplay = ({ type, url, alt }) => {
  if (type === 'video') {
    return (
      <video autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}>
        <source src={url} type="video/mp4" />
      </video>
    );
  }
  return <img src={url} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

function App() {
  const [activeTab, setActiveTab] = useState('menu');
  const [selectedStrain, setSelectedStrain] = useState(null);
  const [cart, setCart] = useState([]);
  const [strainsData, setStrainsData] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const logoRef = useRef(null);
  const rightNoteRef = useRef(null);
  const leftNoteRef = useRef(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }

    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMDNd_J2nMddIt3927OuBVC2TLvbNcCQSwjQsfGEWmpJpt0rmsL-WRBbEo4w4UkPjlJInP4_zGxWLv/pub?output=csv";

    Papa.parse(csvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data.map((row, index) => {
          const tiers = [];
          let t = 1;
          while (row[`tier${t}_size`] && row[`tier${t}_price`]) {
            const size = row[`tier${t}_size`].trim();
            const price = row[`tier${t}_price`].trim();
            if (size && price) {
              tiers.push({ size, price });
            }
            t++;
          }

          return {
            id: row.id || index + 1,
            name: row.name || "Unnamed Strain",
            category: row.category || "General",
            genetics: row.genetics || "Hybrid",
            description: row.description || "",
            thc: parseInt(row.thc) || 0,
            startingPrice: row.startingPrice || "0",
            tagColor: row.tagColor || "#555",
            mediaType: row.mediaType || "image",
            mediaUrl: row.mediaUrl || "",
            tiers: tiers
          };
        }).filter(item => item.tiers.length > 0);

        setStrainsData(parsedData);
      },
      error: (error) => {
        console.error("Error fetching or parsing CSV:", error);
      }
    });
  }, []);

  const visualize = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    let bassSum = 0;
    for (let i = 0; i < 5; i++) {
      bassSum += dataArray[i];
    }
    const bassAvg = bassSum / 5;
    const scale = 1 + (bassAvg / 255) * 0.15;

    if (logoRef.current) {
      logoRef.current.style.transform = `scale(${scale})`;
      logoRef.current.style.transition = 'transform 0.05s ease-out';
    }
    if (rightNoteRef.current) {
      rightNoteRef.current.style.transform = `scale(${scale})`;
      rightNoteRef.current.style.transition = 'transform 0.05s ease-out';
    }
    if (leftNoteRef.current) {
      leftNoteRef.current.style.transform = `scaleX(-${scale}) scaleY(${scale})`;
      leftNoteRef.current.style.transition = 'transform 0.05s ease-out';
    }

    animationRef.current = requestAnimationFrame(visualize);
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      cancelAnimationFrame(animationRef.current);
      if (logoRef.current) logoRef.current.style.transform = 'scale(1)';
      if (rightNoteRef.current) rightNoteRef.current.style.transform = 'scale(1)';
      if (leftNoteRef.current) leftNoteRef.current.style.transform = 'scaleX(-1) scaleY(1)';
      setIsPlaying(false);
    } else {
      audio.currentTime = 0;

      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaElementSource(audio);
        const analyser = audioCtx.createAnalyser();
        
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      audio.play().catch(e => console.error("Audio playback failed:", e));
      setIsPlaying(true);
      visualize();
    }
  };

  const addToCart = (strain, tier) => {
    setCart([...cart, { ...strain, selectedTier: tier, cartId: Date.now() }]);
    setSelectedStrain(null); 
    setActiveTab('cart');    
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + parseInt(item.selectedTier.price.replace('€', '')), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;

    const buyerName = user?.first_name || "Unknown Web User";
    const buyerUsername = user?.username ? `@${user.username}` : "No Public Username";
    const buyerId = user?.id || null;
    
    let orderText = "🛒 *NEW ORDER - BEAGLE BOYZ*\n\n";
    cart.forEach(item => {
      orderText += `▪️ ${item.name} (${item.selectedTier.size}) : ${item.selectedTier.price}\n`;
    });
    orderText += `\n💰 *Total: €${calculateTotal()}*\n\n`;
    
    orderText += `👤 *Customer Profile:*\n`;
    orderText += `▪️ Name: ${buyerName}\n`;
    orderText += `▪️ Handle: ${buyerUsername}\n`;
    if (buyerId) {
      orderText += `▪️ Direct Action: [Open Chat](tg://user?id=${buyerId})\n`;
    }

    const webhookUrl = "https://hook.eu1.make.com/uftj5ohu25p63a5a7656fnlclbetra8s";

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: orderText })
      });
      
      alert("Order sent and the countdown to highness has begun! 🚀");
      setCart([]);
      setActiveTab('menu');
    } catch (error) {
      alert("Error transmitting order. Please verify your connection.");
    }
  };

  const appStyle = {
    background: '#0a0a0a', 
    backgroundImage: `url(${appBackground})`, 
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    minHeight: '100vh', 
    color: '#fff', 
    fontFamily: 'sans-serif', 
    paddingBottom: '100px'
  };

  if (selectedStrain) {
    return (
      <div style={appStyle}>
        <div style={{ position: 'relative', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px 20px 5px 20px' }}>
          <button onClick={() => setSelectedStrain(null)} style={{ position: 'absolute', left: '20px', background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', padding: 0 }}>
            ←
          </button>
          
          <div ref={leftNoteRef} onClick={toggleAudio} style={{ cursor: 'pointer', fontSize: '28px', marginRight: '15px', filter: 'drop-shadow(2px 2px 0px #ff4757)', userSelect: 'none', transform: 'scaleX(-1)' }}>
            {isPlaying ? '🔊' : '🎵'}
          </div>
          <img ref={logoRef} src={transparentLogo} alt="Logo" style={{ maxWidth: '120px', height: 'auto' }} /> 
          <div ref={rightNoteRef} onClick={toggleAudio} style={{ cursor: 'pointer', fontSize: '28px', marginLeft: '15px', filter: 'drop-shadow(2px 2px 0px #ff4757)', userSelect: 'none' }}>
            {isPlaying ? '🔊' : '🎵'}
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', height: '350px', background: '#111' }}>
          <MediaDisplay type={selectedStrain.mediaType} url={selectedStrain.mediaUrl} alt={selectedStrain.name} />
          <span style={{ position: 'absolute', top: '15px', right: '15px', background: selectedStrain.tagColor, color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', boxShadow: '0 4px 6px rgba(0,0,0,0.5)' }}>
            {selectedStrain.category}
          </span>
        </div>

        <div style={{ padding: '20px' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '900' }}>{selectedStrain.name}</h1>
          
          <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px', width: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GeneticsTag type={selectedStrain.genetics} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ccc', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '6px' }}>{selectedStrain.thc}% THC</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.4)', padding: '6px 10px', borderRadius: '6px' }}>
              <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: '800' }}>Strength</span>
              <StarRating thc={selectedStrain.thc} />
            </div>
          </div>

          <p style={{ color: '#ccc', fontSize: '15px', lineHeight: '1.6', margin: '0 0 30px 0' }}>{selectedStrain.description}</p>
          
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888', margin: '0 0 15px 0', fontWeight: '800' }}>Select Volume</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selectedStrain.tiers.map((tier, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 15, 15, 0.9)', border: '1px solid #333', padding: '15px 20px', borderRadius: '12px' }}>
                <div>
                  <span style={{ fontWeight: '700', fontSize: '18px', color: '#fff', display: 'block' }}>{tier.size}</span>
                  <span style={{ color: '#e67e22', fontWeight: '800', fontSize: '16px' }}>{tier.price}</span>
                </div>
                <button 
                  onClick={() => addToCart(selectedStrain, tier)}
                  style={{ background: '#ffaa00', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '900', fontSize: '14px', cursor: 'pointer' }}
                >
                  ADD
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <audio ref={audioRef} src={candyShopAudio} loop />
      </div>
    );
  }

  return (
    <div style={appStyle}>
      <div style={{ position: 'relative', zIndex: 50, padding: '15px 20px 0px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div ref={leftNoteRef} onClick={toggleAudio} style={{ cursor: 'pointer', fontSize: '32px', marginRight: '15px', filter: 'drop-shadow(2px 2px 0px #ff4757)', userSelect: 'none', transform: 'scaleX(-1)' }}>
          {isPlaying ? '🔊' : '🎵'}
        </div>
        <img ref={logoRef} src={transparentLogo} alt="Beagle Boyz Logo" style={{ maxWidth: '170px', height: 'auto' }} /> 
        <div ref={rightNoteRef} onClick={toggleAudio} style={{ cursor: 'pointer', fontSize: '32px', marginLeft: '15px', filter: 'drop-shadow(2px 2px 0px #ff4757)', userSelect: 'none' }}>
          {isPlaying ? '🔊' : '🎵'}
        </div>
      </div>

      {activeTab === 'menu' && (
        <div style={{ padding: '10px 20px 20px 20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          {strainsData.map((strain) => (
            <div key={strain.id} onClick={() => setSelectedStrain(strain)} style={{ background: 'rgba(18, 18, 18, 0.9)', backdropFilter: 'blur(5px)', borderRadius: '14px', overflow: 'hidden', border: '1px solid #222', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', width: '100%', height: '160px', background: '#000' }}>
                <MediaDisplay type={strain.mediaType} url={strain.mediaUrl} alt={strain.name} />
                <span style={{ position: 'absolute', top: '10px', right: '10px', background: strain.tagColor, color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {strain.category}
                </span>
              </div>
              
              <div style={{ padding: '12px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '900', color: '#fff', lineHeight: '1.2' }}>{strain.name}</h3>
                
                <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <GeneticsTag type={strain.genetics} />
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#ccc', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '6px' }}>{strain.thc}% THC</span>
                  </div>
                  {/* UPDATED: Scaled down text and tighter padding for the Strength row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.4)', padding: '4px 6px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', fontWeight: '800' }}>Strength</span>
                    <StarRating thc={strain.thc} />
                  </div>
                </div>

                <div style={{ background: 'rgba(0, 0, 0, 0.5)', borderRadius: '8px', padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#888', fontWeight: '600' }}>From</span>
                  <span style={{ fontSize: '14px', fontWeight: '900', color: '#e67e22' }}>€{strain.startingPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'cart' && (
        <div style={{ padding: '10px 20px' }}>
          <h2 style={{ fontSize: '20px', margin: '0 0 15px 0', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Order Overview</h2>
          
          {cart.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>Your cart is empty.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cart.map(item => (
                <div key={item.cartId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(20, 20, 20, 0.9)', padding: '15px', borderRadius: '12px', border: '1px solid #333' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '16px' }}>{item.name}</div>
                    <div style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}>{item.selectedTier.size} • <span style={{ color: '#e67e22', fontWeight: 'bold' }}>{item.selectedTier.price}</span></div>
                  </div>
                  <button onClick={() => removeFromCart(item.cartId)} style={{ background: '#333', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontWeight: 'bold' }}>✕</button>
                </div>
              ))}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '22px', fontWeight: '900' }}>
                <span>Total:</span>
                <span style={{ color: '#e67e22' }}>€{calculateTotal()}</span>
              </div>

              <button onClick={handleCheckout} style={{ background: '#ffaa00', color: '#000', border: 'none', padding: '18px', borderRadius: '12px', fontWeight: '900', fontSize: '16px', marginTop: '20px', cursor: 'pointer', textTransform: 'uppercase' }}>
                SEND ORDER
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'info' && (
        <div style={{ padding: '10px 20px' }}>
          <h2 style={{ fontSize: '20px', margin: '0 0 15px 0', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Info & Process</h2>
          
          <div style={{ background: 'rgba(20, 20, 20, 0.85)', backdropFilter: 'blur(10px)', borderRadius: '14px', border: '1px solid #333', padding: '20px' }}>
            <h3 style={{ color: '#e67e22', margin: '0 0 20px 0', fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Steps to Get High</h3>
            
            <ol style={{ paddingLeft: '20px', margin: 0, color: '#ddd', lineHeight: '1.8', fontSize: '15px' }}>
              <li style={{ marginBottom: '15px' }}>
                <span style={{ fontWeight: '700', color: '#fff' }}>Check out our premium selections</span> and find the best fit for you!
              </li>
              <li style={{ marginBottom: '15px' }}>
                <span style={{ fontWeight: '700', color: '#fff' }}>Fill your cart</span> with our goodies and send the order!
              </li>
              <li style={{ marginBottom: '15px' }}>
                <span style={{ fontWeight: '700', color: '#fff' }}>Expect a message from us</span> within the next few minutes to arrange delivery.
              </li>
              <li>
                <span style={{ fontWeight: '700', color: '#fff' }}>Light it up</span> and enjoy! 💨
              </li>
            </ol>
          </div>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', height: '70px', background: 'rgba(10,10,10,0.95)', borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 1000 }}>
        <button onClick={() => setActiveTab('menu')} style={{ background: 'none', border: 'none', color: activeTab === 'menu' ? '#e67e22' : '#555', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '4px' }}>
          <span style={{ fontSize: '22px' }}>⚏</span>
          <span style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '1px' }}>MENU</span>
        </button>

        <button onClick={() => setActiveTab('cart')} style={{ background: 'none', border: 'none', color: activeTab === 'cart' ? '#e67e22' : '#555', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '4px', position: 'relative' }}>
          <span style={{ fontSize: '22px' }}>🛒</span>
          {cart.length > 0 && (
            <span style={{ position: 'absolute', top: '-5px', right: '-12px', background: '#e67e22', color: '#000', fontSize: '11px', padding: '2px 6px', borderRadius: '10px', fontWeight: '900' }}>
              {cart.length}
            </span>
          )}
          <span style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '1px' }}>CART</span>
        </button>

        <button onClick={() => setActiveTab('info')} style={{ background: 'none', border: 'none', color: activeTab === 'info' ? '#e67e22' : '#555', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '4px' }}>
          <span style={{ fontSize: '22px' }}>ℹ</span>
          <span style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '1px' }}>INFO</span>
        </button>
      </div>
      
      <audio ref={audioRef} src={candyShopAudio} loop />
    </div>
  );
}

export default App;