import { useState, useRef, useCallback, useEffect } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

/* ═══════════════════════════════════════════════════
   ESTILOS GLOBALES
═══════════════════════════════════════════════════ */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@600;700;800&display=swap');
    :root{
      --bg:#F0F2F8;--s:#fff;--s2:#F5F7FB;--b:#E4E8F2;
      --a:#1B4FD8;--a2:#06B6D4;--ag:#10B981;--ar:#EF4444;--ay:#F59E0B;
      --t1:#0A0F1E;--t2:#3D4A6B;--t3:#8B9ABB;
      --sh:0 1px 3px rgba(10,15,30,.07),0 1px 2px rgba(10,15,30,.05);
      --sh2:0 8px 32px rgba(27,79,216,.14);--r:16px;
    }
    [data-hc]{--bg:#000;--s:#0d0d0d;--s2:#161616;--b:#fff;--a:#FFD700;--a2:#FFD700;--ag:#00ff99;--ar:#ff4444;--t1:#fff;--t2:#FFD700;--t3:#aaa;}
    [data-lt]{--fbase:17px;--fsm:15px;--fxs:14px;--flg:20px;--fxl:26px;}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html,body{background:var(--bg);font-family:'Inter',system-ui,sans-serif;font-size:14px;color:var(--t1);-webkit-font-smoothing:antialiased;overscroll-behavior:none;}
    ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:var(--a);border-radius:4px}
    input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:var(--b);outline:none}
    input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:var(--a);cursor:pointer;box-shadow:0 2px 8px rgba(27,79,216,.35)}

    @keyframes FU{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes SI{from{opacity:0;transform:translateY(48px)}to{opacity:1;transform:translateY(0)}}
    @keyframes PL{0%,100%{opacity:1}50%{opacity:.35}}
    @keyframes SPbg{from{opacity:0}to{opacity:1}}
    @keyframes SPc{0%{opacity:0;transform:translateY(56px) scale(.9)}100%{opacity:1;transform:none}}
    @keyframes SPy{0%{opacity:0;transform:scale(.7)}100%{opacity:.09;transform:scale(1)}}
    @keyframes SPl{from{width:0}to{width:100%}}
    @keyframes SPf{0%,80%{opacity:1}100%{opacity:0;transform:scale(1.05)}}
    @keyframes SC{from{transform:translateY(-100%)}to{transform:translateY(100vh)}}
    @keyframes GP{0%,100%{text-shadow:0 0 40px rgba(6,182,212,.7)}50%{text-shadow:0 0 80px rgba(6,182,212,1)}}
    @keyframes TI{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}
    @keyframes BL{0%,100%{box-shadow:0 0 0 0 rgba(27,79,216,.4)}70%{box-shadow:0 0 0 8px rgba(27,79,216,0)}}

    .fu{animation:FU .28s ease both}.si{animation:SI .36s cubic-bezier(.34,1.1,.64,1) both}.pl{animation:PL 1.3s ease infinite}
    .hr:hover{background:var(--s2)!important;border-color:var(--a)!important;cursor:pointer}
    .hb:hover{opacity:.82}.ht:hover{background:var(--s2)!important}
    .tag{animation:TI .14s ease both;display:inline-flex;align-items:center;background:var(--s);border:1.5px solid var(--b);border-radius:9px;padding:6px 11px;font-size:12.5px;font-weight:500;color:var(--t2);transition:all .14s;cursor:pointer;white-space:nowrap}
    .tag:hover,.tag.on{background:var(--a);color:#fff;border-color:var(--a);box-shadow:var(--sh2)}
    .leaflet-container{border-radius:var(--r)!important}
    .leaflet-control-attribution{font-size:8px!important}
    .leaflet-popup-content-wrapper{border-radius:12px!important;font-family:'Inter',sans-serif!important}
  `}</style>
);

/* ═══════════════════════════════════════════════════
   BARRIOS DEL PARTIDO DE ZÁRATE
═══════════════════════════════════════════════════ */
const mkB = n => ({
  id: n.toLowerCase()
    .replace(/á/g,"a").replace(/é/g,"e").replace(/í/g,"i")
    .replace(/ó/g,"o").replace(/ú/g,"u").replace(/ü/g,"u").replace(/ñ/g,"n")
    .replace(/[^a-z0-9]/g,"_")
    +"_"+Math.abs(n.split("").reduce((a,c)=>a+c.charCodeAt(0),0)%9999),
  nombre: n,   // ya sin número
  hogares: 200
});

/* Lista maestra — sin prefijo numérico, sin duplicados
   Fuente: Registro Municipal de Barrios del Partido de Zárate */
const BARRIOS_LIST = [
  "12 DE OCTUBRE","ATUCHA I","EL AMPARO I","EL CHAJA","AGUA Y ENERGÍA",
  "ALDEA SUIZA","EL FORTIN","FERRY",
  "ALTE. BROWN","FULCO","GAUCHITO GIL",
  "ALTO DEL CASCO","IRENE","IRIGOYEN",
  "ARTESANIA","LAS ACHIRAS","LA ESPERANZA",
  "ATEPAM","LAS MAGNOLIAS","LA ILUSIÓN",
  "BARRIO H","MATADERO","LA PONDEROSA",
  "BAYER","RINCON DEL ENCUENTRO","LA UNIÓN",
  "BOSCH","SAN JORGE","LAS VIOLETAS",
  "BURGAR","SIEMPRE VERDE","LOS EUCALIPTOS",
  "CALLEGARI","SOLIDARIDAD",
  "19 CASILLAS","ATUCHA II","EL AMAPARO II","LA QUEBRADA","ANTA",
  "CAPDEPON","UNION","LOS OLIVOS",
  "CENTRO","VILLA DEL PILAR","LOS POMELOS",
  "COVEPAM I","VIPERMUN","LOS ROSALES",
  "COVEPAM II","LOS SAUCES",
  "COVEPAM III","METEOR",
  "COVEPAM IV","NUEVA ESPERANZA",
  "COVEPAM V","PECORENA",
  "COVEPAM VI","REYSOL",
  "COVEPAM VII","SEIS DE AGOSTO",
  "COVEPAM VIII","VILLA NEGRI",
  "25 DE MAYO","LOS NARANJOS","ASCÁRATE","ESCALADA",
  "DON MARCOS","VILLA NUEVA",
  "EL CASCO","EL JACARANDA","EL MANGRULLO",
  "EL RUBI","EL OMBU","ESPAÑA",
  "ESTANCIA SMITHFIELD","FERROVIARIOS","FIGUEIREDO",
  "6 DE AGOSTO","CERVECERO","LA LEYLA","SAN JOSE",
  "FINCAS DE LA FLORIDA","FONAVI","JUANA MARIA",
  "LA CAMPIÑA II","LA CAMPIÑA","LA CAMPIÑA III",
  "LA CANDELARIA","LA CARONA I","LA CARONA II","LA EMILIA",
  "A. ARGENTINA","CHACRAS DE BS AS.","ORTIZ",
  "LA FLORIDA","LA ESMERALDA",
  "LAS 4 ESQUINAS","LAS MERCEDES","LAS MORAS","LAS PALMAS","LAS PICADAS",
  "LOS BAGUALES","LOS CEIBOS","CHACRAS DE OLIVIA","CEMENTERIO",
  "LOS CAMPOS DE FRESNOS","LOS FRESNOS",
  "LOS MIRTILLOS","LOS MIRTILLOS II",
  "LOS ROBLES","LUZ Y FUERZA",
  "MALVICINO-SAN LUIS","MARIA AUXILIADORA",
  "AIRE PAMPA","CITRUS",
  "MARIANO MORENO","MITRE","OBRERO",
  "ORSI-LAS CAUSARINAS","PITRAU","PREFECTURA","PRO TIERRA",
  "AIRES DE LA FLORIDA","COOPERATIVA GÜMES","EL MILAGRO",
  "PROCASA I","PROCASA IV","PROVINCIA Y MUNICIPIO",
  "PUERTO DEL SOL","PUERTO PANAL","RINCON DE LA FLORIDA","SAAVEDRA",
  "SAN ESTEBAN","SAN JACINTO",
  "ALBERTO","EL ADUAR","EL PROGRESO",
  "SAN JAVIER","SAN MIGUEL","SANTA LUCIA",
  "SOLARES DEL CARMEN","STELLA MARIS",
  "UNION Y FE","UNION Y FUERZA","VICTORIA",
  "VILLA ANGUS","VILLA CARMENCITA","VILLA EUGENIA","VILLA FLORIDA",
  "VILLA FOX","VILLA MASSONI","VILLA SMITHFIELD","VIZA",
  "ZÁRATE","ZÁRATE GOLF PARK","ZÁRATE CHICO",
  "BOMBEROS","EL CABURE","ESTACION ESCALADA","LA EMILIA II",
  "LOS CAMPOS DE FRESNOS II","LOS PINOS",
  "NUEVE DE JULIO","OCHO DE SEPTIEMBRE","SAN ISIDRO","SAN SEBASTIÁN",
].map(mkB);

/* ═══════════════════════════════════════════════════
   DIMENSIONES IPB (ONU-HÁBITAT)
═══════════════════════════════════════════════════ */
const DIMS = [
  { id:"infra",  label:"Infraestructura",  icon:"⚡", short:"INFRA",
    inds:["Acceso al agua","Red vial","Calidad eléctrica","Saneamiento"] },
  { id:"equidad",label:"Equidad Social",   icon:"⚖",  short:"EQUIDAD",
    inds:["Proximidad a salud","Cohesión educativa"] },
  { id:"ambient",label:"Sostenibilidad",   icon:"🌿", short:"AMBIENT",
    inds:["Energías limpias","Calidad del aire","Recolección RSU","Gestión RSU"] },
  { id:"vida",   label:"Calidad de Vida",  icon:"◉",  short:"VIDA",
    inds:["Infra social","Capital social","Alumbrado","Tránsito","Espacios verdes","Identidad barrial","Seguridad"] },
  { id:"product",label:"Productividad",   icon:"📡", short:"PRODUCT",
    inds:["Comercio local","Conectividad"] },
  { id:"gobern", label:"Gobernanza",       icon:"🏛", short:"GOBERN",
    inds:["Percepción de gestión pública"] },
];

const ICP0 = { infra:68, equidad:72, ambient:55, vida:63, product:70, gobern:58 };
const ZC   = [-34.0971, -59.0261]; // Zárate coords
const HOST = "ipb.zarate@gmail.com"; // ← reemplazá con tu mail

/* ═══════════════════════════════════════════════════
   UTILIDADES
═══════════════════════════════════════════════════ */
const nM  = N => { const z=1.96,p=.5,e=.1,n0=(z*z*p*(1-p))/(e*e); return N>0?Math.ceil(n0/(1+(n0-1)/N)):Math.ceil(n0); };
const n15 = v => Math.round(((v-1)/4)*100);
const dSc = vals => { const a=Object.values(vals).filter(v=>v>0); return a.length?n15(a.reduce((x,y)=>x+y)/a.length):0; };
const IPB = sc => { const v=Object.values(sc); return v.length?Math.round(v.reduce((a,b)=>a+b)/v.length):0; };
const uid = () => Math.random().toString(36).slice(2,9);
const eV  = () => DIMS.reduce((a,d)=>({...a,[d.id]:d.inds.reduce((b,i)=>({...b,[i]:0}),{})}),{});

const RNG = v => {
  if(!v)   return {l:"Sin datos", c:"var(--t3)", bg:"var(--s2)", bar:"var(--b)"};
  if(v<=20)return {l:"Crítica",   c:"#EF4444",  bg:"#FEF2F2",   bar:"#EF4444"};
  if(v<=40)return {l:"Débil",     c:"#F97316",  bg:"#FFF7ED",   bar:"#F97316"};
  if(v<=60)return {l:"Moderada",  c:"#F59E0B",  bg:"#FFFBEB",   bar:"#F59E0B"};
  if(v<=80)return {l:"Sólida",    c:"#10B981",  bg:"#F0FDF4",   bar:"#10B981"};
  return          {l:"Plena",     c:"#1B4FD8",  bg:"#EEF2FF",   bar:"#1B4FD8"};
};

const SEM = (a,n) => {
  if(!a) return {t:"Sin datos",      c:"var(--t3)", bg:"var(--s2)", p:0};
  const p=Math.min(1,a/n);
  if(p>=1)  return {t:"Representativa ✓",c:"var(--ag)",bg:"#F0FDF4",p};
  if(p>=.5) return {t:"En tendencia →",  c:"var(--ay)",bg:"#FFFBEB",p};
  return          {t:"Insuficiente",     c:"var(--ar)",bg:"#FEF2F2",p};
};

const LBL = ["—","Emergencia","Insuficiente","Regular","Bueno","Óptimo"];
const CLR = ["#94A3B8","#EF4444","#F97316","#F59E0B","#10B981","#1B4FD8"];

/* ═══════════════════════════════════════════════════
   SPLASH SCREEN
═══════════════════════════════════════════════════ */
function Splash({ onDone }) {
  const [ph, setPh] = useState(0);
  const [pr, setPr] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPr(p => { if(p>=100){clearInterval(t);return 100;} return p+2.2; }), 75);
    const x = setTimeout(() => { setPh(1); setTimeout(onDone,650); }, 3600);
    return () => { clearInterval(t); clearTimeout(x); };
  }, []);
  return (
    <div onClick={() => { setPh(1); setTimeout(onDone,650); }}
      style={{position:"fixed",inset:0,zIndex:9999,cursor:"pointer",overflow:"hidden",
        background:"linear-gradient(155deg,#03071E 0%,#0A1628 35%,#0D2545 65%,#0A3060 100%)",
        animation:ph===1?"SPf .65s ease forwards":"SPbg .5s ease"}}
      aria-label="Zárate Emergente 2040 - Tocá para continuar">

      {/* Grid de puntos */}
      <div style={{position:"absolute",inset:0,opacity:.05,
        backgroundImage:"radial-gradient(circle,#60A5FA 1px,transparent 1px)",
        backgroundSize:"30px 30px",pointerEvents:"none"}}/>
      {/* Scanline */}
      <div style={{position:"absolute",left:0,right:0,height:2,
        background:"linear-gradient(90deg,transparent,rgba(6,182,212,.8),transparent)",
        animation:"SC 2.8s linear infinite",pointerEvents:"none"}}/>
      {/* Glow central */}
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        width:400,height:400,borderRadius:"50%",pointerEvents:"none",
        background:"radial-gradient(circle,rgba(6,182,212,.15) 0%,transparent 70%)"}}/>

      {/* Contenido */}
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",textAlign:"center",padding:32}}>

        {/* Badge */}
        <div style={{animation:"SPc .8s .2s ease both",display:"inline-flex",
          alignItems:"center",gap:8,background:"rgba(255,255,255,.06)",
          borderRadius:24,padding:"6px 16px",marginBottom:36,
          border:"1px solid rgba(6,182,212,.3)"}}>
          <span style={{fontSize:14}}>🌐</span>
          <span style={{color:"rgba(6,182,212,.9)",fontSize:10,fontWeight:700,letterSpacing:2,fontFamily:"'Inter',sans-serif",textTransform:"uppercase"}}>
            ONU-Hábitat · Partido de Zárate
          </span>
        </div>

        {/* 2040 fondo */}
        <div style={{position:"absolute",fontSize:"min(160px,40vw)",fontWeight:900,
          fontFamily:"'Syne',sans-serif",color:"white",animation:"SPy 1s .1s ease both",
          lineHeight:1,userSelect:"none",pointerEvents:"none",letterSpacing:"-.03em"}}>
          2040
        </div>

        {/* ZÁRATE */}
        <div style={{fontSize:"min(56px,12vw)",fontWeight:800,fontFamily:"'Syne',sans-serif",
          color:"white",letterSpacing:".08em",lineHeight:1,
          animation:"SPc .9s .35s ease both, GP 3s 1.8s ease infinite",
          position:"relative",zIndex:2}}>
          ZÁRATE
        </div>

        {/* EMERGENTE */}
        <div style={{fontSize:"min(26px,6.5vw)",fontWeight:300,letterSpacing:".4em",
          textTransform:"uppercase",color:"rgba(6,182,212,.95)",marginTop:8,
          animation:"SPc .9s .55s ease both",position:"relative",zIndex:2,
          fontFamily:"'Inter',sans-serif"}}>
          EMERGENTE
        </div>

        {/* Línea */}
        <div style={{height:2,margin:"28px auto",width:"70%",maxWidth:260,
          background:"linear-gradient(90deg,transparent,#06B6D4,transparent)",
          animation:"SPl 1.2s .85s ease both",position:"relative",zIndex:2}}/>

        {/* Sub */}
        <div style={{color:"rgba(255,255,255,.4)",fontSize:11,letterSpacing:1.6,
          textTransform:"uppercase",fontFamily:"'Inter',sans-serif",
          animation:"SPc .8s 1s ease both",position:"relative",zIndex:2}}>
          Plan Estratégico Territorial · Índice de Prosperidad Barrial
        </div>
      </div>

      {/* Progreso */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:"rgba(255,255,255,.08)"}}>
        <div style={{height:"100%",width:`${pr}%`,transition:"width .075s linear",
          background:"linear-gradient(90deg,#1B4FD8,#06B6D4,#38BDF8)",
          boxShadow:"0 0 12px rgba(6,182,212,.8)"}}/>
      </div>
      <div style={{position:"absolute",bottom:24,left:"50%",transform:"translateX(-50%)",
        color:"rgba(255,255,255,.28)",fontSize:11,letterSpacing:1.8,
        fontFamily:"'Inter',sans-serif",textTransform:"uppercase",
        animation:"PL 2s 1.5s ease infinite"}}>
        Tocá para continuar
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   GAUGE
═══════════════════════════════════════════════════ */
function Gauge({ ipb }) {
  const r=RNG(ipb), ang=(ipb/100)*180-90, R=52, cx=70, cy=70;
  const x=cx+R*Math.cos(ang*Math.PI/180), y=cy+R*Math.sin(ang*Math.PI/180);
  const segs=[{a:0,b:20,c:"#FECACA"},{a:20,b:40,c:"#FED7AA"},{a:40,b:60,c:"#FEF08A"},{a:60,b:80,c:"#BBF7D0"},{a:80,b:100,c:"#BFDBFE"}];
  const fills=[{a:0,b:20,c:"#EF4444"},{a:20,b:40,c:"#F97316"},{a:40,b:60,c:"#F59E0B"},{a:60,b:80,c:"#10B981"},{a:80,b:100,c:"#1B4FD8"}];
  const arc=(a,b)=>{const t1=(a/100*180-90)*Math.PI/180,t2=(b/100*180-90)*Math.PI/180; return `M ${cx+R*Math.cos(t1)} ${cy+R*Math.sin(t1)} A ${R} ${R} 0 0 1 ${cx+R*Math.cos(t2)} ${cy+R*Math.sin(t2)}`;};
  return (
    <svg viewBox="0 0 140 82" style={{width:"100%",maxWidth:200}} role="img" aria-label={`IPB ${ipb}: ${r.l}`}>
      {segs.map((s,i)=><path key={i} d={arc(s.a,s.b)} fill="none" stroke={s.c} strokeWidth={13}/>)}
      {fills.map((s,i)=>{
        if(ipb>s.a&&ipb<=s.b) return <path key={`f${i}`} d={arc(s.a,ipb)} fill="none" stroke={s.c} strokeWidth={13}/>;
        if(ipb>s.b) return <path key={`f${i}`} d={arc(s.a,s.b)} fill="none" stroke={s.c} strokeWidth={13}/>;
        return null;
      })}
      <line x1={cx} y1={cy} x2={x} y2={y} stroke="var(--t1)" strokeWidth={2.5} strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r={4.5} fill="var(--t1)"/>
      <text x={cx} y={cy-14} textAnchor="middle" fill="var(--t1)" fontSize={22} fontWeight="800" fontFamily="'Syne',sans-serif">{ipb}</text>
      <text x={cx} y={cy-3} textAnchor="middle" fill={r.c} fontSize={7.5} fontFamily="'Inter',sans-serif" fontWeight="600">{r.l}</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   INDICADOR (1-5)
═══════════════════════════════════════════════════ */
function Ind({ nombre, valor, onChange }) {
  return (
    <div style={{marginBottom:18}} role="group" aria-label={`${nombre}: ${valor>0?LBL[valor]:"sin dato"}`}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
        <span style={{color:"var(--t2)",fontSize:12.5,fontWeight:500,flex:1,paddingRight:8,lineHeight:1.3}}>{nombre}</span>
        {valor>0&&<span style={{color:CLR[valor],fontSize:11,fontWeight:700,
          background:RNG(n15(valor)).bg,padding:"2px 9px",borderRadius:20,
          border:`1px solid ${CLR[valor]}33`,whiteSpace:"nowrap"}}>{LBL[valor]}</span>}
      </div>
      <div style={{display:"flex",gap:5}} role="radiogroup">
        {[1,2,3,4,5].map(v=>(
          <button key={v} onClick={()=>onChange(valor===v?0:v)}
            role="radio" aria-checked={valor===v} aria-label={`${nombre}: ${LBL[v]}`}
            style={{flex:1,height:34,border:`2px solid ${valor===v?CLR[v]:"var(--b)"}`,
              borderRadius:10,cursor:"pointer",fontSize:13,fontWeight:700,
              background:valor===v?`${CLR[v]}18`:"var(--s)",
              color:valor===v?CLR[v]:"var(--t3)",transition:"all .14s",
              boxShadow:valor===v?`0 2px 8px ${CLR[v]}33`:"none"}}>
            {v}
          </button>
        ))}
      </div>
      {valor>0&&(
        <div style={{height:3,borderRadius:2,background:"var(--b)",overflow:"hidden",marginTop:7}}>
          <div style={{height:"100%",width:`${(valor/5)*100}%`,background:CLR[valor],borderRadius:2,transition:"width .3s"}}/>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAPA LEAFLET (OpenStreetMap — sin API key)
═══════════════════════════════════════════════════ */
function MapaLeaflet({ barrios, activeId, onAssign, speak }) {
  const cont = useRef(null);
  const mapR = useRef(null);
  const pinR = useRef(null);
  const mrkR = useRef({});
  const [ready,   setReady]   = useState(false);
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [pinInfo, setPinInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gcoding, setGcoding] = useState(false);

  /* Cargar Leaflet desde CDN */
  useEffect(() => {
    if(window.L){ setReady(true); return; }
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    js.onload = () => setReady(true);
    js.onerror = () => alert("Error cargando el mapa. Verificar conexión a internet.");
    document.head.appendChild(js);
  }, []);

  /* Inicializar mapa */
  useEffect(() => {
    if(!ready||!cont.current||mapR.current) return;
    const L = window.L;
    const map = L.map(cont.current, {zoomControl:true, attributionControl:true}).setView(ZC, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:"© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>",
      maxZoom:19,
    }).addTo(map);

    /* Click en mapa → geocodificación inversa */
    map.on("click", async e => {
      const { lat, lng } = e.latlng;
      setGcoding(true);
      if(speak) speak("Identificando dirección.");
      try {
        const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es&addressdetails=1`);
        const data = await res.json();
        const a    = data.address||{};
        const dir  = [a.road, a.house_number, a.suburb||a.neighbourhood||a.city_district||a.village].filter(Boolean).join(" ");
        const info = { lat, lng, address: dir||data.display_name, full: data.display_name };
        setPinInfo(info);
        if(speak) speak(`Dirección: ${dir||"punto seleccionado"}`);

        if(pinR.current) pinR.current.remove();
        const icon = L.divIcon({
          html:`<div style="width:18px;height:18px;border-radius:50%;background:#1B4FD8;border:3px solid white;box-shadow:0 2px 10px rgba(27,79,216,.6)"></div>`,
          className:"", iconAnchor:[9,9]
        });
        pinR.current = L.marker([lat,lng],{icon}).addTo(map)
          .bindPopup(`<strong style="font-family:Inter,sans-serif;font-size:13px">${dir||"Punto seleccionado"}</strong><br><span style="color:#6B7280;font-size:11px">${lat.toFixed(5)}, ${lng.toFixed(5)}</span>`)
          .openPopup();
      } catch { setPinInfo({lat,lng,address:`${lat.toFixed(5)}, ${lng.toFixed(5)}`,full:""}); }
      setGcoding(false);
    });

    mapR.current = map;
    return () => { map.remove(); mapR.current = null; };
  }, [ready]);

  /* Marcadores de barrios mapeados */
  useEffect(() => {
    if(!mapR.current||!window.L) return;
    const L = window.L, map = mapR.current;
    Object.values(mrkR.current).forEach(m=>m.remove());
    mrkR.current = {};
    barrios.filter(b=>b.lat).forEach(b => {
      const isActive = b.id === activeId;
      const icon = L.divIcon({
        html:`<div style="background:${isActive?"#F59E0B":"#1B4FD8"};color:white;font-size:10px;font-weight:700;font-family:Inter,sans-serif;padding:4px 8px;border-radius:10px;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,.25);border:2px solid white">${b.nombre.split("-").slice(-1)[0].trim()}</div>`,
        className:"", iconAnchor:[0,0]
      });
      const m = L.marker([b.lat,b.lng],{icon}).addTo(map)
        .bindPopup(`<strong style="font-family:Inter">${b.nombre}</strong><br><span style="color:#6B7280;font-size:11px">${b.address||""}</span>`);
      mrkR.current[b.id] = m;
    });
  }, [barrios, activeId, ready]);

  /* Buscar dirección */
  const buscar = async () => {
    if(!query.trim()) return;
    setLoading(true); setResults([]);
    if(speak) speak(`Buscando ${query}`);
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query+", Zárate, Buenos Aires, Argentina")}&format=json&limit=5&accept-language=es`);
      const d = await r.json();
      setResults(d);
      if(!d.length && speak) speak("Sin resultados.");
    } catch { if(speak) speak("Error de conexión."); }
    setLoading(false);
  };

  const irA = item => {
    if(!mapR.current||!window.L) return;
    const L = window.L, map = mapR.current;
    const lat = parseFloat(item.lat), lng = parseFloat(item.lon);
    map.setView([lat,lng], 16);
    setResults([]); setQuery(item.display_name.split(",")[0]);
    if(pinR.current) pinR.current.remove();
    const icon = L.divIcon({
      html:`<div style="width:18px;height:18px;border-radius:50%;background:#1B4FD8;border:3px solid white;box-shadow:0 2px 10px rgba(27,79,216,.6)"></div>`,
      className:"", iconAnchor:[9,9]
    });
    pinR.current = L.marker([lat,lng],{icon}).addTo(map)
      .bindPopup(`<strong style="font-family:Inter;font-size:13px">${item.display_name.split(",").slice(0,2).join(", ")}</strong>`).openPopup();
    setPinInfo({lat,lng,address:item.display_name.split(",").slice(0,2).join(", "),full:item.display_name});
    if(speak) speak(`Ubicando ${item.display_name.split(",")[0]}`);
  };

  const activeBarrio = barrios.find(b=>b.id===activeId);

  return (
    <div className="fu" style={{paddingBottom:4}}>
      {/* Hero del mapa */}
      <div style={{background:"linear-gradient(135deg,#0A1628,#1B4FD8)",borderRadius:16,
        padding:"18px 18px 14px",marginBottom:12,
        boxShadow:"0 8px 32px rgba(27,79,216,.25)"}}>
        <div style={{color:"rgba(255,255,255,.5)",fontSize:10,letterSpacing:2,
          textTransform:"uppercase",fontWeight:600,marginBottom:2}}>Zárate Emergente · Mapa IPB</div>
        <div style={{color:"white",fontSize:17,fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:"-.01em",marginBottom:12}}>
          Georreferenciación de Barrios
        </div>
        {/* Buscador */}
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1,position:"relative"}}>
            <input value={query} onChange={e=>setQuery(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&buscar()}
              placeholder="Buscar dirección en Zárate..."
              style={{width:"100%",padding:"10px 14px",border:"none",borderRadius:10,
                fontSize:13,fontFamily:"'Inter',sans-serif",background:"rgba(255,255,255,.12)",
                color:"white",outline:"none",backdropFilter:"blur(8px)"}}
              onFocus={e=>e.target.style.background="rgba(255,255,255,.18)"}
              onBlur={e=>e.target.style.background="rgba(255,255,255,.12)"}/>
            {/* placeholder blanco */}
            <style>{`.mapi::placeholder{color:rgba(255,255,255,.5)}`}</style>
          </div>
          <button className="hb" onClick={buscar} disabled={loading}
            style={{background:"rgba(255,255,255,.15)",color:"white",border:"none",
              borderRadius:10,padding:"10px 16px",fontSize:13,fontWeight:700,cursor:"pointer",
              fontFamily:"'Inter',sans-serif",backdropFilter:"blur(8px)"}}>
            {loading?"…":"Buscar"}
          </button>
        </div>
        {/* Resultados */}
        {results.length>0&&(
          <div style={{marginTop:8,background:"rgba(255,255,255,.95)",borderRadius:10,overflow:"hidden"}}>
            {results.map((r,i)=>(
              <div key={i} className="hr" onClick={()=>irA(r)}
                style={{padding:"9px 12px",borderBottom:i<results.length-1?"1px solid #F1F5F9":"none",
                  background:"white",transition:"all .12s",cursor:"pointer"}}>
                <div style={{color:"#0A0F1E",fontSize:13,fontWeight:600}}>{r.display_name.split(",")[0]}</div>
                <div style={{color:"#8B9ABB",fontSize:11}}>{r.display_name.split(",").slice(1,3).join(", ")}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mapa */}
      <div style={{borderRadius:16,overflow:"hidden",border:"1px solid var(--b)",
        boxShadow:"var(--sh2)",marginBottom:12,position:"relative"}}>
        {!ready?(
          <div style={{height:280,display:"flex",alignItems:"center",justifyContent:"center",
            flexDirection:"column",gap:10,background:"var(--s2)"}}>
            <span className="pl" style={{fontSize:36}}>🗺</span>
            <span style={{color:"var(--t3)",fontSize:13}}>Cargando mapa…</span>
          </div>
        ):<div ref={cont} style={{height:280,width:"100%"}}/>}
        {gcoding&&(
          <div style={{position:"absolute",top:10,left:"50%",transform:"translateX(-50%)",
            background:"var(--a)",color:"white",fontSize:11,fontWeight:700,
            padding:"6px 14px",borderRadius:20,whiteSpace:"nowrap",
            boxShadow:"var(--sh2)",fontFamily:"'Inter',sans-serif"}}>
            Identificando ubicación…
          </div>
        )}
      </div>

      {/* Instrucción */}
      <div style={{background:"var(--s)",borderRadius:12,padding:"10px 14px",
        marginBottom:12,border:"1px solid var(--b)",display:"flex",gap:10,alignItems:"center"}}>
        <span style={{fontSize:20,flexShrink:0}}>👆</span>
        <div style={{color:"var(--t2)",fontSize:12,lineHeight:1.5}}>
          Tocá en el mapa para identificar una dirección. Podés asignarla al barrio activo.
        </div>
      </div>

      {/* Pin resultado */}
      {pinInfo&&(
        <div style={{background:"var(--s)",borderRadius:14,padding:"14px 16px",
          border:"2px solid var(--a)22",boxShadow:"var(--sh2)",marginBottom:12}}>
          <div style={{display:"flex",gap:3,alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:16}}>📍</span>
            <span style={{color:"var(--a)",fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Ubicación Seleccionada</span>
          </div>
          <div style={{color:"var(--t1)",fontSize:14,fontWeight:600,marginBottom:2}}>{pinInfo.address}</div>
          <div style={{color:"var(--t3)",fontSize:11,marginBottom:12}}>
            {pinInfo.lat.toFixed(6)}, {pinInfo.lng.toFixed(6)}
          </div>
          {activeId?(
            <button className="hb" onClick={()=>onAssign(pinInfo)}
              style={{background:"var(--a)",color:"white",border:"none",borderRadius:10,
                padding:"10px",width:"100%",fontSize:13,fontWeight:700,cursor:"pointer",
                fontFamily:"'Inter',sans-serif",boxShadow:"var(--sh2)"}}>
              📌 Asignar a {activeBarrio?.nombre||"barrio activo"}
            </button>
          ):(
            <div style={{color:"var(--t3)",fontSize:12,textAlign:"center",
              background:"var(--s2)",borderRadius:8,padding:8}}>
              Seleccioná un barrio primero para asignar esta ubicación
            </div>
          )}
        </div>
      )}

      {/* Barrios mapeados */}
      {barrios.filter(b=>b.lat).length>0&&(
        <div style={{background:"var(--s)",borderRadius:14,padding:"14px 16px",border:"1px solid var(--b)"}}>
          <div style={{color:"var(--t3)",fontSize:10,fontWeight:700,letterSpacing:1,
            textTransform:"uppercase",marginBottom:10}}>📍 Barrios Mapeados</div>
          {barrios.filter(b=>b.lat).map(b=>(
            <div key={b.id} style={{display:"flex",alignItems:"center",gap:10,
              padding:"8px 0",borderBottom:"1px solid var(--b)"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"var(--a)",flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{color:"var(--t1)",fontSize:12,fontWeight:600}}>{b.nombre}</div>
                <div style={{color:"var(--t3)",fontSize:11}}>{b.address||`${b.lat?.toFixed(4)}, ${b.lng?.toFixed(4)}`}</div>
              </div>
              <button className="hb" onClick={()=>mapR.current?.setView([b.lat,b.lng],16)}
                style={{background:"var(--s2)",color:"var(--a)",border:"1px solid var(--a)22",
                  borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
                Ver
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MODAL IMPORTAR DATOS
═══════════════════════════════════════════════════ */
function ModalImport({ barrioNombre, barrioId, onImport, onClose }) {
  const [driveUrl, setDriveUrl] = useState("");
  const [cargando, setCargando] = useState(false);
  const xlsxRef = useRef();
  const csvRef  = useRef();

  const procesar = (filas, fuente) => {
    if(!barrioId){ alert("Seleccioná un barrio primero."); return 0; }
    const headers = (filas[0]||[]).map(h=>String(h||"").trim().toLowerCase());
    const acc = eV(); let count = 0;
    filas.slice(1).forEach(fila => {
      const row = {}; headers.forEach((h,i)=>{ row[h]=fila[i]; });
      DIMS.forEach(dim => { dim.inds.forEach(ind => {
        const key = headers.find(k=>k.includes(ind.slice(0,5).toLowerCase()));
        if(key!==undefined){ const v=parseInt(row[key]); if(v>=1&&v<=5){ acc[dim.id][ind]=((acc[dim.id][ind]||0)*count+v)/(count+1); } }
      }); }); count++;
    });
    DIMS.forEach(d=>{ d.inds.forEach(i=>{ if(acc[d.id][i]>0) acc[d.id][i]=Math.round(acc[d.id][i]*10)/10; }); });
    onImport(acc, count, fuente);
    return count;
  };

  const handleXLSX = e => {
    const file = e.target.files[0]; if(!file) return;
    const load = cb => { if(window.XLSX){cb();return;} const s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"; s.onload=cb; document.head.appendChild(s); };
    load(() => {
      const reader = new FileReader();
      reader.onload = ev => {
        const wb = window.XLSX.read(ev.target.result,{type:"array"});
        const ws = wb.Sheets[wb.SheetNames[0]];
        const filas = window.XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
        const n = procesar(filas,"Excel");
        if(n){ alert(`✓ ${n} fichas importadas desde Excel`); onClose(); }
        else  alert("No se encontraron datos válidos. Verificar formato.");
      };
      reader.readAsArrayBuffer(file);
    });
    e.target.value="";
  };

  const handleCSV = e => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const filas = ev.target.result.split("\n").filter(Boolean).map(l=>l.split(",").map(c=>c.trim()));
      const n = procesar(filas,"CSV");
      if(n){ alert(`✓ ${n} fichas importadas desde CSV`); onClose(); }
      else  alert("No se encontraron datos. Verificar formato.");
    };
    reader.readAsText(file);
    e.target.value="";
  };


  const handlePDF = async e => {
    const file = e.target.files[0];
    if(!file) return;
    if(!barrioId){ alert("Seleccioná un barrio primero."); return; }
    setCargando(true);
    try {
      const base64 = await new Promise((res,rej)=>{
        const r = new FileReader();
        r.onload = ()=>res(r.result.split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const GEMINI_KEY="gen-lang-client-0458421430";
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          contents:[{parts:[
            {inline_data:{mime_type:"application/pdf",data:base64}},
            {text:"Analizá esta ficha barrial IPB. Devolvé SOLO JSON: {scores:{infra:N,equidad:N,ambient:N,vida:N,product:N,gobern:N}} donde N es 1-5. Sin dato usar 0."}
          ]}]
        })
      });
      const data = await resp.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text||"{}";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      const text = jsonMatch ? jsonMatch[0] : "{}";
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      const nuevos = {};
      Object.entries(parsed.scores||{}).forEach(([k,v])=>{ if(v>0) nuevos[k]=v; });
      if(!Object.keys(nuevos).length){ alert("No se pudieron extraer datos del PDF."); return; }
      // Convertir scores de IA al formato de fichas
      const fichaIA = {};
      Object.entries(nuevos).forEach(([dim, val]) => { fichaIA[dim] = val; });
      onImport(fichaIA, 1, "PDF-IA");
      alert("✓ Datos extraídos por IA: "+Object.keys(nuevos).length+" dimensiones cargadas");
      onClose();
    } catch(err){ alert("Error: "+err.message); }
    finally{ setCargando(false); }
  };

  const handleDrive = async () => {
    if(!driveUrl.trim()){ alert("Pegá el enlace de Google Drive."); return; }
    const match = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)||driveUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if(!match){ alert("Enlace inválido. Debe ser un link de Google Drive."); return; }
    setCargando(true);
    const fileId = match[1];
    const url    = `https://drive.google.com/uc?export=download&id=${fileId}`;
    try {
      const res = await fetch(url);
      if(!res.ok) throw new Error(`HTTP ${res.status}. Verificar que el archivo sea público.`);
      const ct = res.headers.get("content-type")||"";
      if(ct.includes("text")||driveUrl.includes(".csv")){
        const text = await res.text();
        const filas = text.split("\n").filter(Boolean).map(l=>l.split(",").map(c=>c.trim()));
        const n = procesar(filas,"Drive");
        if(n){ alert(`✓ ${n} fichas importadas desde Google Drive`); onClose(); }
      } else {
        const buf = await res.arrayBuffer();
        const load = cb => { if(window.XLSX){cb();return;} const s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"; s.onload=cb; document.head.appendChild(s); };
        load(() => {
          const wb = window.XLSX.read(buf,{type:"array"});
          const ws = wb.Sheets[wb.SheetNames[0]];
          const filas = window.XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
          const n = procesar(filas,"Drive Excel");
          if(n){ alert(`✓ ${n} fichas importadas desde Drive`); onClose(); }
        });
      }
    } catch(err) {
      alert(`Error: ${err.message}\n\nAsegurate de que el archivo esté compartido como "Cualquier persona con el enlace".`);
    }
    setCargando(false);
  };

  const B = ({children, onClick, disabled, color="#1B4FD8"}) => (
    <button className="hb" onClick={onClick} disabled={disabled}
      style={{background:disabled?"var(--b)":color,color:disabled?"var(--t3)":"white",
        border:"none",borderRadius:11,padding:"12px",fontSize:13,fontWeight:700,
        width:"100%",cursor:disabled?"not-allowed":"pointer",
        fontFamily:"'Inter',sans-serif",transition:"all .15s",
        boxShadow:disabled?"none":`0 4px 12px ${color}44`,marginBottom:8}}>
      {children}
    </button>
  );

  return (
    <div role="dialog" aria-modal="true"
      style={{position:"fixed",inset:0,background:"rgba(10,15,30,.6)",zIndex:200,
        display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div className="si" style={{background:"var(--s)",borderRadius:"24px 24px 0 0",
        padding:"0 20px 32px",width:"100%",maxWidth:480,
        boxShadow:"0 -16px 48px rgba(10,15,30,.25)",maxHeight:"88vh",overflowY:"auto"}}>

        {/* Handle */}
        <div style={{width:40,height:4,background:"var(--b)",borderRadius:2,margin:"16px auto 20px"}}/>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontSize:20,fontWeight:800,fontFamily:"'Syne',sans-serif",color:"var(--t1)",letterSpacing:"-.01em"}}>
              Importar Fichas IPB
            </div>
            {barrioNombre&&(
              <div style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:6,
                background:"var(--s2)",borderRadius:8,padding:"4px 10px"}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:"var(--a)",animation:"BL 1.5s ease infinite"}}/>
                <span style={{color:"var(--t2)",fontSize:12,fontWeight:600}}>{barrioNombre}</span>
              </div>
            )}
          </div>
          <button className="hb" onClick={onClose}
            style={{background:"var(--s2)",border:"none",borderRadius:10,
              width:36,height:36,cursor:"pointer",fontSize:20,color:"var(--t2)",
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            ×
          </button>
        </div>

                  {/* PDF con IA */}
          <div style={{background:"var(--s)",borderRadius:12,padding:"14px 16px",marginBottom:12,border:"1px solid var(--b)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{fontSize:22}}>🤖</span>
              <div>
                <div style={{color:"var(--t1)",fontSize:14,fontWeight:700}}>PDF con IA</div>
                <div style={{color:"var(--t3)",fontSize:11}}>La IA extrae los indicadores automáticamente</div>
              </div>
            </div>
            <label style={{display:"block",background:"#7C3AED",color:"white",borderRadius:8,padding:"10px 0",textAlign:"center",fontSize:13,fontWeight:700,cursor:barrioId?"pointer":"not-allowed",opacity:barrioId?1:0.5}}>
              📄 Subir ficha PDF
              <input type="file" accept=".pdf" onChange={handlePDF} style={{display:"none"}} disabled={!barrioId||cargando}/>
            </label>
            {!barrioId&&<div style={{color:"#F97316",fontSize:11,marginTop:6,textAlign:"center"}}>Seleccioná un barrio primero</div>}
          </div>

          {/* Opción 1: Google Drive */}
        <div style={{background:"var(--s2)",borderRadius:14,padding:16,marginBottom:12,border:"1px solid var(--b)"}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:24}}>🔗</div>
            <div>
              <div style={{color:"var(--t1)",fontSize:14,fontWeight:700}}>Google Drive</div>
              <div style={{color:"var(--t3)",fontSize:11}}>Excel o CSV compartido públicamente</div>
            </div>
          </div>
          <input value={driveUrl} onChange={e=>setDriveUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/..."
            style={{width:"100%",padding:"10px 13px",border:"1.5px solid var(--b)",
              borderRadius:10,fontSize:12,fontFamily:"'Inter',sans-serif",
              background:"var(--s)",color:"var(--t1)",outline:"none",marginBottom:8}}
            onFocus={e=>e.target.style.borderColor="var(--a)"}
            onBlur={e=>e.target.style.borderColor="var(--b)"}/>
          <B onClick={handleDrive} disabled={!driveUrl.trim()||cargando||!barrioId} color="#059669">
            {cargando?"⏳ Descargando…":"⬇ Importar desde Drive"}
          </B>
          <div style={{background:"#EEF2FF",borderRadius:8,padding:"8px 11px",fontSize:11,color:"#1B4FD8",lineHeight:1.5}}>
            <strong>Cómo compartir:</strong> Drive → Compartir → "Cualquier persona con el enlace puede ver" → Copiar enlace → Pegar acá.
          </div>
        </div>

        {/* Opción 2: Excel */}
        <div style={{background:"var(--s2)",borderRadius:14,padding:16,marginBottom:12,border:"1px solid var(--b)"}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:24}}>📗</div>
            <div>
              <div style={{color:"var(--t1)",fontSize:14,fontWeight:700}}>Excel (.xlsx / .xls)</div>
              <div style={{color:"var(--t3)",fontSize:11}}>Archivo desde tu dispositivo</div>
            </div>
          </div>
          <B onClick={()=>xlsxRef.current?.click()} disabled={!barrioId} color="#059669">
            📗 Subir archivo Excel
          </B>
          <input ref={xlsxRef} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={handleXLSX}/>
        </div>

        {/* Opción 3: CSV */}
        <div style={{background:"var(--s2)",borderRadius:14,padding:16,marginBottom:16,border:"1px solid var(--b)"}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:24}}>📄</div>
            <div>
              <div style={{color:"var(--t1)",fontSize:14,fontWeight:700}}>CSV (.csv)</div>
              <div style={{color:"var(--t3)",fontSize:11}}>Exportación de formularios</div>
            </div>
          </div>
          <B onClick={()=>csvRef.current?.click()} disabled={!barrioId} color="#059669">
            📄 Subir archivo CSV
          </B>
          <input ref={csvRef} type="file" accept=".csv,text/csv" style={{display:"none"}} onChange={handleCSV}/>
        </div>

        {/* Formato esperado */}
        <div style={{background:"#FFFBEB",borderRadius:10,padding:"10px 13px",border:"1px solid #FDE68A"}}>
          <div style={{color:"#92400E",fontSize:11,fontWeight:700,marginBottom:5}}>📋 Formato de columnas esperado</div>
          <div style={{fontFamily:"monospace",fontSize:10,color:"#78350F",lineHeight:1.8,overflowX:"auto",whiteSpace:"pre"}}>
{`agua | vial | electrica | saneamiento
salud | educativa | limpias | aire
rsu | gestion | social | capital
alumbr | transito | verdes | identidad
seguridad | comercio | conectividad | accion`}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MODAL AGREGAR BARRIO
═══════════════════════════════════════════════════ */
function ModalBarrio({ prefill="", onSave, onClose }) {
  const [nombre,   setNombre]   = useState(prefill);
  const [hogares,  setHogares]  = useState("200");
  const ok = nombre.trim() && parseInt(hogares) > 0;
  const inp = {
    width:"100%",padding:"13px 14px",border:"1.5px solid var(--b)",borderRadius:11,
    fontSize:14,fontFamily:"'Inter',sans-serif",background:"var(--s2)",
    color:"var(--t1)",outline:"none",transition:"border .15s",
  };
  return (
    <div role="dialog" aria-modal="true"
      style={{position:"fixed",inset:0,background:"rgba(10,15,30,.6)",zIndex:200,
        display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div className="si" style={{background:"var(--s)",borderRadius:"24px 24px 0 0",
        padding:"0 20px 40px",width:"100%",maxWidth:480,
        boxShadow:"0 -16px 48px rgba(10,15,30,.25)"}}>
        <div style={{width:40,height:4,background:"var(--b)",borderRadius:2,margin:"16px auto 20px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div>
            <div style={{fontSize:20,fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:"-.01em"}}>Nuevo Barrio</div>
            <div style={{color:"var(--t3)",fontSize:12,marginTop:2}}>Zárate Emergente · IPB</div>
          </div>
          <button className="hb" onClick={onClose}
            style={{background:"var(--s2)",border:"none",borderRadius:10,width:36,height:36,
              cursor:"pointer",fontSize:20,color:"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            ×
          </button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{color:"var(--t3)",fontSize:11,fontWeight:700,letterSpacing:.8,
              textTransform:"uppercase",display:"block",marginBottom:6}}>Nombre del Barrio *</label>
            <input value={nombre} onChange={e=>setNombre(e.target.value)}
              placeholder="Ej: Villa del Parque" style={inp} autoFocus
              onFocus={e=>e.target.style.borderColor="var(--a)"}
              onBlur={e=>e.target.style.borderColor="var(--b)"}/>
          </div>
          <div>
            <label style={{color:"var(--t3)",fontSize:11,fontWeight:700,letterSpacing:.8,
              textTransform:"uppercase",display:"block",marginBottom:6}}>Hogares estimados</label>
            <input type="number" value={hogares} onChange={e=>setHogares(e.target.value)}
              placeholder="200" style={inp}
              onFocus={e=>e.target.style.borderColor="var(--a)"}
              onBlur={e=>e.target.style.borderColor="var(--b)"}/>
          </div>
        </div>
        <button className="hb" onClick={()=>ok&&onSave({id:uid(),nombre:nombre.trim(),hogares:parseInt(hogares)})}
          disabled={!ok}
          style={{marginTop:22,background:ok?"var(--a)":"var(--b)",color:ok?"white":"var(--t3)",
            border:"none",borderRadius:12,padding:"15px",fontSize:15,fontWeight:700,
            width:"100%",cursor:ok?"pointer":"not-allowed",fontFamily:"'Inter',sans-serif",
            boxShadow:ok?"var(--sh2)":"none",transition:"all .2s"}}>
          Agregar barrio
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PANEL ACCESIBILIDAD
═══════════════════════════════════════════════════ */
function PanelA11y({ hc, setHc, lt, setLt, speak, stopSpeak, vox, setVox, listen, startVoice, onClose }) {
  const toggle = (val, setVal, label) => { const nv=!val; setVal(nv); speak(`${label} ${nv?"activado":"desactivado"}`); };
  const opts = [
    {icon:"🎨",label:"Alto Contraste",sub:"Fondo oscuro y colores WCAG AAA",val:hc,fn:()=>toggle(hc,setHc,"Alto contraste")},
    {icon:"🔤",label:"Texto Grande",sub:"Aumenta tamaño de texto en toda la app",val:lt,fn:()=>toggle(lt,setLt,"Texto grande")},
    {icon:"🔊",label:"Lector de Pantalla",sub:"Anuncia cambios y contenido en voz alta",val:vox,fn:()=>{ toggle(vox,setVox,"Lector"); if(!vox) speak("Lector activado."); else stopSpeak(); }},
  ];
  return (
    <div role="dialog" aria-modal="true"
      style={{position:"fixed",inset:0,background:"rgba(10,15,30,.6)",zIndex:300,
        display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div className="si" style={{background:"var(--s)",borderRadius:"24px 24px 0 0",
        padding:"0 20px 36px",width:"100%",maxWidth:480,boxShadow:"0 -16px 48px rgba(10,15,30,.25)"}}>
        <div style={{width:40,height:4,background:"var(--b)",borderRadius:2,margin:"16px auto 20px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{fontSize:19,fontWeight:800,fontFamily:"'Syne',sans-serif"}}>Accesibilidad</div>
            <div style={{color:"var(--t3)",fontSize:12}}>Adaptá la experiencia a tus necesidades</div>
          </div>
          <button className="hb" onClick={onClose}
            style={{background:"var(--s2)",border:"none",borderRadius:10,width:36,height:36,
              cursor:"pointer",fontSize:20,color:"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {opts.map((o,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",
            background:"var(--s2)",borderRadius:12,marginBottom:10,
            border:`1.5px solid ${o.val?"var(--a)":"var(--b)"}`}}>
            <span style={{fontSize:24,flexShrink:0}}>{o.icon}</span>
            <div style={{flex:1}}>
              <div style={{color:"var(--t1)",fontSize:14,fontWeight:600}}>{o.label}</div>
              <div style={{color:"var(--t3)",fontSize:11}}>{o.sub}</div>
            </div>
            <button onClick={o.fn} aria-pressed={o.val}
              style={{width:52,height:28,borderRadius:14,border:"none",cursor:"pointer",
                background:o.val?"var(--a)":"var(--b)",position:"relative",transition:"all .2s",flexShrink:0}}>
              <div style={{width:22,height:22,borderRadius:11,background:"white",position:"absolute",
                top:3,left:o.val?27:3,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
            </button>
          </div>
        ))}
        {/* Voz */}
        <div style={{background:"var(--s2)",borderRadius:12,padding:14,border:`1.5px solid ${listen?"var(--a)":"var(--b)"}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"var(--t1)"}}>🎤 Comandos de Voz</div>
              <div style={{fontSize:11,color:"var(--t3)"}}>Navegá la app con tu voz</div>
            </div>
            <button className="hb" onClick={startVoice}
              style={{background:listen?"var(--ar)":"var(--a)",color:"white",border:"none",
                borderRadius:10,padding:"8px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
              {listen?<span className="pl">🎤 Escuchando…</span>:"🎤 Hablar"}
            </button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
            {["Inicio","Barrios","Datos","Análisis","Mapa","Informe","Agregar barrio","Ayuda"].map(c=>(
              <div key={c} style={{background:"var(--s)",borderRadius:7,padding:"4px 8px",
                fontSize:11,color:"var(--t2)",border:"1px solid var(--b)",textAlign:"center"}}>
                "{c}"
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   APP PRINCIPAL
═══════════════════════════════════════════════════ */
export default function App() {
  /* ── Estado splash + tema ── */
  const [splash, setSplash] = useState(true);
  const [hc, setHc] = useState(false);
  const [lt, setLt] = useState(false);
  const [vox, setVox] = useState(false);
  const [listen, setListen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-hc", hc?"1":"");
    document.documentElement.setAttribute("data-lt", lt?"1":"");
  }, [hc, lt]);

  /* ── TTS ── */
  const speak = useCallback((text, int=true) => {
    if(!window.speechSynthesis||!vox) return;
    if(int) window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang="es-AR"; u.rate=0.95;
    window.speechSynthesis.speak(u);
  }, [vox]);
  const stopSpeak = () => window.speechSynthesis?.cancel();

  /* ── Estado app ── */
  const [tab,       setTab]       = useState("inicio");
  const [barrios,   setBarrios]   = useState(BARRIOS_LIST);
  const [barrioId,  setBarrioId]  = useState(null);
  const [dimId,     setDimId]     = useState("infra");
  const [datos,     setDatos]     = useState(() => BARRIOS_LIST.reduce((a,b)=>({...a,[b.id]:eV()}),{}));
  const [muestra,   setMuestra]   = useState(() => BARRIOS_LIST.reduce((a,b)=>({...a,[b.id]:0}),{}));
  const [icp,       setIcp]       = useState(ICP0);
  const [searchQ,   setSearchQ]   = useState("");
  const [showImport,setShowImport]= useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showA11y,  setShowA11y]  = useState(false);

  /* ── Comandos de voz ── */
  const startVoice = useCallback(() => {
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ speak("Tu navegador no soporta comandos de voz.",false); return; }
    const r = new SR(); r.lang="es-AR"; r.continuous=false; r.interimResults=false;
    r.onstart=()=>setListen(true); r.onend=()=>setListen(false); r.onerror=()=>setListen(false);
    r.onresult=e=>{
      const cmd=e.results[0][0].transcript.toLowerCase().trim();
      if(cmd.includes("inicio")||cmd.includes("home")) setTab("inicio");
      else if(cmd.includes("barrio")&&cmd.includes("agregar")) setShowModal(true);
      else if(cmd.includes("barrio")) setTab("barrios");
      else if(cmd.includes("datos")) setTab("datos");
      else if(cmd.includes("análisis")||cmd.includes("analisis")) setTab("analisis");
      else if(cmd.includes("mapa")) setTab("mapa");
      else if(cmd.includes("informe")) setTab("informe");
      else if(cmd.includes("ayuda")) speak("Comandos: Inicio, Barrios, Datos, Análisis, Mapa, Informe, Agregar barrio.");
    };
    r.start();
  }, [speak]);

  useEffect(() => { if(vox) speak(`Pantalla ${tab}.`); }, [tab]);

  /* ── Barrio activo ── */
  const barrio    = barrios.find(b=>b.id===barrioId);
  const bData     = barrioId&&datos[barrioId]?datos[barrioId]:null;
  const dimScores = bData ? DIMS.reduce((a,d)=>({...a,[d.id]:dSc(bData[d.id])}),{}) : DIMS.reduce((a,d)=>({...a,[d.id]:0}),{});
  const ipbFinal  = IPB(dimScores);
  const rangoF    = RNG(ipbFinal);
  const mNec      = barrio?nM(barrio.hogares):0;
  const mAct      = barrioId?(muestra[barrioId]||0):0;
  const sem       = SEM(mAct,mNec);
  const icpProm   = Math.round(Object.values(icp).reduce((a,b)=>a+b)/6);

  /* ── MZE ── */
  const totalInds = DIMS.flatMap(d=>d.inds).length;
  const cargados  = bData?DIMS.flatMap(d=>Object.values(bData[d.id])).filter(v=>v>0).length:0;
  const mze1=bData&&cargados===totalInds, mze2=sem.p>=1, mze3=Math.abs(ipbFinal-icpProm)<30;
  const mzeOk=[mze1,mze2,mze3].filter(Boolean).length;

  /* ── Resumen ciudad ── */
  const resumen = barrios.map(b=>{
    const d=datos[b.id]||eV();
    const sc=DIMS.reduce((a,dim)=>({...a,[dim.id]:dSc(d[dim.id])}),{});
    const ipb=IPB(sc), mn=nM(b.hogares), ma=muestra[b.id]||0;
    return {...b,ipb,rng:RNG(ipb),sem:SEM(ma,mn)};
  });

  /* ── Acciones ── */
  const selBarrio = useCallback((id) => { setBarrioId(id); setTab("datos"); speak(barrios.find(b=>b.id===id)?.nombre||""); },[barrios,speak]);
  const setVal    = useCallback((bId,dId,ind,v)=>setDatos(p=>({...p,[bId]:{...p[bId],[dId]:{...p[bId][dId],[ind]:v}}})),[]);
  const assignLoc = info => setBarrios(p=>p.map(b=>b.id===barrioId?{...b,lat:info.lat,lng:info.lng,address:info.address}:b));
  const onImport  = (acc, count, fuente) => {
    setDatos(p=>({...p,[barrioId]:acc}));
    setMuestra(p=>({...p,[barrioId]:(p[barrioId]||0)+count}));
    speak(`${count} fichas importadas.`);
  };
  const addBarrio = b => {
    const nb = {...b,hogares:b.hogares||200};
    setBarrios(p=>[nb,...p]);
    setDatos(p=>({...p,[b.id]:eV()}));
    setMuestra(p=>({...p,[b.id]:0}));
    setShowModal(false);
    selBarrio(b.id);
    speak(`Barrio ${b.nombre} agregado.`);
  };
  const exportar = () => {
    if(!barrioId) return;
    const d={
      programa:"Zárate Emergente 2040",barrio:barrio.nombre,
      coordenadas:barrio.lat?{lat:barrio.lat,lng:barrio.lng,address:barrio.address}:null,
      fecha:new Date().toISOString(),hogares:barrio.hogares,
      muestra:{actual:mAct,necesaria:mNec,representativa:mze2},
      ipbFinal,rango:rangoF.l,dimensiones:dimScores,icp,
      brechas:DIMS.reduce((a,x)=>({...a,[x.id]:icp[x.id]-dimScores[x.id]}),{}),
      validacionMZE:{escala:mze1,umbral:mze2,triangulacion:mze3,score:`${mzeOk}/3`},
      host:HOST,
    };
    const blob=new Blob([JSON.stringify(d,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob), a=document.createElement("a");
    a.href=url; a.download=`IPB_${barrio.nombre.replace(/[^a-zA-Z0-9]/g,"_")}.json`;
    a.click(); URL.revokeObjectURL(url);
    speak("Informe generado.");
  };

  /* ── Estilos ── */
  const card = {background:"var(--s)",borderRadius:16,padding:16,border:"1px solid var(--b)",boxShadow:"var(--sh)",marginBottom:12};
  const secT = {color:"var(--a)",fontSize:10.5,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:12};
  const chip = (c,bg)=>({background:bg||"#EEF2FF",color:c||"var(--a)",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600,display:"inline-block"});
  const BP   = ({children,onClick,disabled,style={}}) => (
    <button className="hb" onClick={onClick} disabled={disabled}
      style={{background:disabled?"var(--b)":"var(--a)",color:disabled?"var(--t3)":"white",border:"none",
        borderRadius:12,padding:"13px",fontSize:14,fontWeight:700,cursor:disabled?"not-allowed":"pointer",
        fontFamily:"'Inter',sans-serif",width:"100%",boxShadow:disabled?"none":"var(--sh2)",transition:"all .2s",...style}}>
      {children}
    </button>
  );
  const EP = (icon,title,sub,btnTxt,fn) => (
    <div style={{...card,textAlign:"center",padding:"44px 20px"}}>
      <div style={{fontSize:48,marginBottom:12}}>{icon}</div>
      <div style={{color:"var(--t1)",fontWeight:800,fontSize:17,fontFamily:"'Syne',sans-serif",marginBottom:6}}>{title}</div>
      <div style={{color:"var(--t3)",fontSize:13,marginBottom:24,lineHeight:1.6}}>{sub}</div>
      <BP onClick={fn}>{btnTxt}</BP>
    </div>
  );

  const nav = [
    {id:"inicio",  icon:"⌂",  label:"Inicio"},
    {id:"barrios", icon:"🏘",  label:"Barrios"},
    {id:"datos",   icon:"📊",  label:"Datos"},
    {id:"mapa",    icon:"🗺",  label:"Mapa"},
    {id:"informe", icon:"📋",  label:"Informe"},
  ];

  /* ═══ RENDER ═══ */
  return (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",background:"var(--bg)",minHeight:"100vh",
      display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto",position:"relative"}}
      role="application" aria-label="Zárate Emergente 2040">
      <G/>

      {splash && <Splash onDone={()=>setSplash(false)}/>}

      {/* ════ HEADER ════ */}
      <header style={{
        background:"linear-gradient(135deg,#040D21 0%,#0C1F4A 50%,#0D2E6B 100%)",
        padding:"13px 18px 11px",position:"sticky",top:0,zIndex:100,
        boxShadow:"0 1px 0 rgba(255,255,255,.06),0 4px 24px rgba(4,13,33,.4)",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <div style={{width:36,height:36,borderRadius:10,flexShrink:0,
            background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🌐</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:"rgba(255,255,255,.45)",fontSize:9,letterSpacing:2,
              fontWeight:700,textTransform:"uppercase"}}>ONU-Hábitat · Zárate</div>
            <div style={{color:"white",fontSize:14,fontWeight:800,letterSpacing:"-.01em",
              fontFamily:"'Syne',sans-serif",lineHeight:1.15,
              whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              Zárate Emergente 2040
            </div>
          </div>
          <div style={{display:"flex",gap:7,flexShrink:0,alignItems:"center"}}>
            {barrioId&&(
              <div style={{background:"rgba(27,79,216,.35)",borderRadius:9,padding:"3px 10px",
                border:"1px solid rgba(27,79,216,.5)",maxWidth:100,overflow:"hidden"}}>
                <div style={{color:"rgba(255,255,255,.45)",fontSize:8,letterSpacing:1,textTransform:"uppercase"}}>Activo</div>
                <div style={{color:"white",fontSize:11,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {barrio?.nombre.replace(/^\d+-/,"")}</div>
              </div>
            )}
            <button className="hb" onClick={()=>setShowA11y(true)} aria-label="Accesibilidad"
              style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)",
                borderRadius:9,width:34,height:34,cursor:"pointer",fontSize:16,color:"white",
                display:"flex",alignItems:"center",justifyContent:"center"}}>
              ♿
            </button>
          </div>
        </div>
      </header>

      {/* ════ CONTENIDO ════ */}
      <main style={{flex:1,overflowY:"auto",padding:"16px 16px 80px"}} aria-live="polite">

        {/* ── INICIO ── */}
        {tab==="inicio"&&(
          <div className="fu">
            {/* Hero card */}
            <div style={{
              background:"linear-gradient(135deg,#040D21,#0C1F4A,#0D2E6B)",
              borderRadius:20,padding:"24px 20px 20px",marginBottom:14,
              boxShadow:"0 12px 40px rgba(27,79,216,.3)",position:"relative",overflow:"hidden",
            }}>
              <div style={{position:"absolute",top:-30,right:-30,width:160,height:160,borderRadius:"50%",
                background:"radial-gradient(circle,rgba(6,182,212,.2),transparent 70%)"}}/>
              <div style={{position:"absolute",bottom:-20,left:-20,width:120,height:120,borderRadius:"50%",
                background:"radial-gradient(circle,rgba(27,79,216,.3),transparent 70%)"}}/>
              <div style={{color:"rgba(6,182,212,.9)",fontSize:10,fontWeight:700,letterSpacing:2,
                textTransform:"uppercase",marginBottom:6,position:"relative"}}>Zárate Emergente</div>
              <div style={{color:"white",fontSize:26,fontWeight:800,fontFamily:"'Syne',sans-serif",
                letterSpacing:"-.02em",lineHeight:1.15,marginBottom:4,position:"relative"}}>
                Índice de<br/>Prosperidad Barrial
              </div>
              <div style={{color:"rgba(255,255,255,.45)",fontSize:12,marginBottom:20,position:"relative"}}>
                Plan Estratégico Territorial 2040 · ONU-Hábitat
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,position:"relative"}}>
                {[
                  {l:"Barrios",v:barrios.length,c:"#60A5FA"},
                  {l:"Relevados",v:resumen.filter(b=>b.ipb>0).length,c:"#34D399"},
                  {l:"Críticos",v:resumen.filter(b=>b.ipb>0&&b.ipb<=20).length,c:"#F87171"},
                ].map((k,i)=>(
                  <div key={i} style={{background:"rgba(255,255,255,.07)",borderRadius:12,
                    padding:"12px 10px",textAlign:"center",border:"1px solid rgba(255,255,255,.08)"}}>
                    <div style={{color:k.c,fontSize:26,fontWeight:800,fontFamily:"'Syne',sans-serif"}}>{k.v}</div>
                    <div style={{color:"rgba(255,255,255,.45)",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:.8}}>{k.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones rápidas */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[
                {icon:"🏘",label:"Ver Barrios",sub:"Buscar y seleccionar",fn:()=>setTab("barrios"),color:"#EEF2FF",accent:"#1B4FD8"},
                {icon:"📊",label:"Cargar Datos",sub:"Indicadores IPB",fn:()=>setTab("datos"),color:"#F0FDF4",accent:"#10B981"},
                {icon:"🗺",label:"Mapa",sub:"Georreferenciación",fn:()=>setTab("mapa"),color:"#FFF7ED",accent:"#F97316"},
                {icon:"📋",label:"Informe",sub:"Exportar a AutoCrat",fn:()=>setTab("informe"),color:"#FEF2F2",accent:"#EF4444"},
              ].map((a,i)=>(
                <div key={i} className="hr" onClick={a.fn}
                  style={{background:a.color,borderRadius:16,padding:"16px 14px",
                    border:`1.5px solid ${a.accent}22`,transition:"all .15s",cursor:"pointer",
                    boxShadow:"var(--sh)"}}>
                  <div style={{fontSize:26,marginBottom:8}}>{a.icon}</div>
                  <div style={{color:a.accent,fontSize:14,fontWeight:700}}>{a.label}</div>
                  <div style={{color:"var(--t3)",fontSize:11,marginTop:2}}>{a.sub}</div>
                </div>
              ))}
            </div>

            {/* Últimos relevados */}
            {resumen.filter(b=>b.ipb>0).length>0&&(
              <div style={card}>
                <div style={{...secT,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>Últimos relevados</span>
                  <button className="hb" onClick={()=>setTab("barrios")}
                    style={{color:"var(--a)",background:"none",border:"none",cursor:"pointer",
                      fontSize:12,fontWeight:700,fontFamily:"'Inter',sans-serif"}}>Ver todos →</button>
                </div>
                {resumen.filter(b=>b.ipb>0).sort((a,b)=>b.ipb-a.ipb).slice(0,5).map(b=>(
                  <div key={b.id} className="hr" onClick={()=>selBarrio(b.id)}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",
                      border:"1px solid var(--b)",borderRadius:12,marginBottom:6,
                      background:"var(--s)",transition:"all .12s",cursor:"pointer"}}>
                    <div style={{width:38,height:38,borderRadius:10,background:b.rng.bg,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      color:b.rng.c,fontSize:14,fontWeight:800,fontFamily:"'Syne',sans-serif",flexShrink:0}}>
                      {b.ipb}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:"var(--t1)",fontSize:13,fontWeight:600,
                        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{b.nombre}</div>
                      <div style={{height:3,borderRadius:2,background:"var(--b)",marginTop:4}}>
                        <div style={{height:"100%",width:`${b.ipb}%`,background:b.rng.bar,borderRadius:2,transition:"width .4s"}}/>
                      </div>
                    </div>
                    <span style={chip(b.rng.c,b.rng.bg)}>{b.rng.l}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BARRIOS ── */}
        {tab==="barrios"&&(()=>{
          const filtrados = barrios.filter(b=>!searchQ||b.nombre.toLowerCase().includes(searchQ.toLowerCase()));
          const noEnc = searchQ.trim().length>2 && filtrados.length===0;
          const pocos = searchQ.trim().length>1 && filtrados.length>0 && filtrados.length<=5;
          return (
            <div className="fu">
              {/* Header */}
              <div style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                <div>
                  <div style={{fontSize:9,letterSpacing:2,color:"var(--a)",fontWeight:700,
                    textTransform:"uppercase",marginBottom:3}}>Zárate Emergente · IPB</div>
                  <div style={{fontSize:22,fontWeight:800,fontFamily:"'Syne',sans-serif",
                    color:"var(--t1)",letterSpacing:"-.02em"}}>Barrios</div>
                  <div style={{color:"var(--t3)",fontSize:12,marginTop:2}}>{barrios.length} barrios registrados</div>
                </div>
                <button className="hb" onClick={()=>setShowModal(true)}
                  style={{background:"var(--a)",color:"white",border:"none",borderRadius:11,
                    padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer",
                    fontFamily:"'Inter',sans-serif",boxShadow:"var(--sh2)",flexShrink:0}}>
                  + Agregar
                </button>
              </div>

              {/* Buscador */}
              <div style={{position:"relative",marginBottom:12}}>
                <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",
                  color:"var(--t3)",fontSize:16,pointerEvents:"none"}}>🔍</span>
                <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                  onKeyDown={e=>e.key==="Escape"&&setSearchQ("")}
                  placeholder="Buscar barrio..."
                  style={{width:"100%",padding:"12px 42px",border:"1.5px solid var(--b)",
                    borderRadius:12,fontSize:14,fontFamily:"'Inter',sans-serif",
                    background:"var(--s)",color:"var(--t1)",outline:"none",
                    boxShadow:"var(--sh)",transition:"border .15s"}}
                  onFocus={e=>e.target.style.borderColor="var(--a)"}
                  onBlur={e=>e.target.style.borderColor="var(--b)"}/>
                {searchQ&&<button onClick={()=>setSearchQ("")}
                  style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                    border:"none",background:"var(--s2)",borderRadius:6,width:26,height:26,
                    cursor:"pointer",color:"var(--t3)",fontSize:16,display:"flex",
                    alignItems:"center",justifyContent:"center"}}>×</button>}
              </div>

              {/* Lista o tags */}
              {!searchQ?(
                <div style={{background:"var(--s)",borderRadius:16,border:"1px solid var(--b)",
                  boxShadow:"var(--sh)",overflow:"hidden"}}>
                  {barrios.map((b,i)=>{
                    const rb=resumen.find(x=>x.id===b.id)||{ipb:0,rng:RNG(0)};
                    return (
                      <div key={b.id} className="hr" onClick={()=>selBarrio(b.id)}
                        style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",
                          borderBottom:i<barrios.length-1?"1px solid var(--b)":"none",
                          background:barrioId===b.id?"var(--s2)":"var(--s)",transition:"all .12s"}}>
                        <div style={{width:38,height:38,borderRadius:10,background:rb.rng.bg,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          color:rb.rng.c,fontSize:13,fontWeight:800,fontFamily:"'Syne',sans-serif",flexShrink:0}}>
                          {rb.ipb||"·"}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{color:"var(--t1)",fontSize:13,fontWeight:600,
                            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{b.nombre}</div>
                          <div style={{color:"var(--t3)",fontSize:11}}>{rb.ipb>0?`IPB ${rb.ipb} · ${rb.rng.l}`:"Sin datos"}{b.lat?" · 📍":""}</div>
                        </div>
                        {barrioId===b.id&&<div style={{width:8,height:8,borderRadius:"50%",background:"var(--a)",flexShrink:0,animation:"BL 1.5s ease infinite"}}/>}
                      </div>
                    );
                  })}
                </div>
              ):(
                <div>
                  {filtrados.length>0&&(
                    <>
                      <div style={{color:"var(--t3)",fontSize:11,fontWeight:600,letterSpacing:.8,
                        textTransform:"uppercase",marginBottom:10}}>
                        {filtrados.length} resultado{filtrados.length!==1?"s":""}
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                        {filtrados.map(b=>(
                          <button key={b.id} className={`tag${barrioId===b.id?" on":""}`}
                            onClick={()=>selBarrio(b.id)}>
                            {b.nombre.replace(/^\d+-/,"")}{barrioId===b.id?" ●":""}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {(noEnc||pocos)&&(
                    <div style={{background:"var(--s)",borderRadius:16,padding:"22px 18px",
                      textAlign:"center",border:"1.5px dashed var(--b)"}}>
                      {noEnc&&<><div style={{fontSize:36,marginBottom:8}}>🏘</div>
                        <div style={{color:"var(--t1)",fontWeight:700,fontSize:15,marginBottom:4}}>
                          "{searchQ}" no está en la lista
                        </div>
                        <div style={{color:"var(--t3)",fontSize:12,marginBottom:16,lineHeight:1.5}}>
                          Podés agregarlo para comenzar el relevamiento
                        </div></>}
                      {pocos&&!noEnc&&<div style={{color:"var(--t3)",fontSize:12,marginBottom:14}}>
                        ¿No encontrás el barrio exacto?
                      </div>}
                      <button className="hb" onClick={()=>setShowModal(true)}
                        style={{background:"var(--a)",color:"white",border:"none",borderRadius:11,
                          padding:"11px 20px",fontSize:13,fontWeight:700,cursor:"pointer",
                          fontFamily:"'Inter',sans-serif",boxShadow:"var(--sh2)"}}>
                        + Agregar "{searchQ||"nuevo barrio"}"
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div style={{marginTop:14,textAlign:"center"}}>
                <button className="hb" onClick={()=>setShowModal(true)}
                  style={{background:"none",color:"var(--a)",border:"1.5px solid var(--a)22",
                    borderRadius:11,padding:"10px 20px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
                  + Agregar barrio no listado
                </button>
              </div>
            </div>
          );
        })()}

        {/* ── DATOS ── */}
        {tab==="datos"&&(
          <div className="fu">
            {!barrioId ? EP("📊","Seleccioná un barrio","Tocá un barrio desde la pestaña Barrios para empezar a cargar los indicadores IPB.","Ir a Barrios →",()=>setTab("barrios")):(
              <>
                {/* Card barrio activo */}
                <div style={{background:`linear-gradient(120deg,var(--s),${sem.bg})`,borderRadius:16,
                  padding:"16px",marginBottom:12,border:`2px solid ${sem.c}22`,boxShadow:"var(--sh)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div style={{flex:1,minWidth:0,paddingRight:10}}>
                      <div style={{color:"var(--t3)",fontSize:10,letterSpacing:1.5,textTransform:"uppercase",fontWeight:700,marginBottom:2}}>Zárate Emergente · IPB</div>
                      <div style={{color:"var(--t1)",fontWeight:800,fontSize:17,fontFamily:"'Syne',sans-serif",
                        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{barrio.nombre}</div>
                      <div style={{color:"var(--t3)",fontSize:12}}>{barrio.hogares.toLocaleString()} hogares</div>
                    </div>
                    <span style={{...chip(sem.c,sem.bg+"44"),border:`1px solid ${sem.c}33`,flexShrink:0,whiteSpace:"nowrap"}}>{sem.t}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{flex:1,background:"rgba(0,0,0,.06)",borderRadius:4,height:8,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${sem.p*100}%`,background:sem.c,borderRadius:4,transition:"width .4s"}}/>
                    </div>
                    <span style={{color:sem.c,fontSize:13,fontWeight:700,flexShrink:0}}>{mAct}/{mNec}</span>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <div style={{flex:1}}>
                      <div style={{color:"var(--t3)",fontSize:10,marginBottom:3}}>Fichas cargadas</div>
                      <input type="number" value={mAct}
                        onChange={e=>setMuestra(p=>({...p,[barrioId]:parseInt(e.target.value)||0}))}
                        style={{width:"100%",padding:"9px 12px",border:"1.5px solid var(--b)",borderRadius:10,
                          fontSize:16,fontWeight:800,color:"var(--a)",textAlign:"center",
                          fontFamily:"'Syne',sans-serif",background:"var(--s)",outline:"none"}}/>
                    </div>
                    <button className="hb" onClick={()=>setShowImport(true)}
                      style={{background:"#059669",color:"white",border:"none",borderRadius:11,
                        padding:"0 16px",fontSize:13,fontWeight:700,cursor:"pointer",
                        fontFamily:"'Inter',sans-serif",boxShadow:"0 4px 12px rgba(5,150,105,.3)",flexShrink:0,
                        display:"flex",alignItems:"center",gap:6}}>
                      <span>📥</span><span>Importar</span>
                    </button>
                  </div>
                </div>

                {/* Selector de dimensiones */}
                <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:12,scrollbarWidth:"none"}}>
                  {DIMS.map(d=>{
                    const sc=dimScores[d.id], r=RNG(sc);
                    return (
                      <button key={d.id} className="hdim" onClick={()=>setDimId(d.id)}
                        style={{flexShrink:0,padding:"9px 12px",minWidth:68,
                          border:`2px solid ${dimId===d.id?"var(--a)":"var(--b)"}`,
                          borderRadius:12,background:dimId===d.id?"var(--a)":"var(--s)",
                          cursor:"pointer",textAlign:"center",fontFamily:"'Inter',sans-serif",transition:"all .15s"}}>
                        <div style={{fontSize:18}}>{d.icon}</div>
                        <div style={{color:dimId===d.id?"white":"var(--t3)",fontSize:10,fontWeight:700,marginTop:2}}>{d.short}</div>
                        <div style={{color:dimId===d.id?"rgba(255,255,255,.8)":r.c,fontSize:15,fontWeight:800,fontFamily:"'Syne',sans-serif"}}>{sc||"—"}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Indicadores */}
                {(()=>{
                  const dim=DIMS.find(d=>d.id===dimId), sc=dimScores[dimId], r=RNG(sc);
                  return (
                    <div style={card}>
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,
                        paddingBottom:14,borderBottom:"1px solid var(--b)"}}>
                        <div style={{width:48,height:48,borderRadius:14,background:r.bg,
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{dim.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{color:"var(--t1)",fontWeight:800,fontSize:16,fontFamily:"'Syne',sans-serif"}}>{dim.label}</div>
                          <div style={{color:"var(--t3)",fontSize:12}}>{dim.inds.length} indicadores</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{color:r.c,fontSize:28,fontWeight:800,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{sc}</div>
                          <span style={chip(r.c,r.bg)}>{r.l}</span>
                        </div>
                      </div>
                      <div style={{background:"var(--s2)",borderRadius:10,padding:"9px 12px",marginBottom:16,
                        fontSize:12,color:"var(--t2)",lineHeight:1.6}}>
                        Seleccioná el nivel: <strong style={{color:"#EF4444"}}>1</strong> Emergencia · <strong style={{color:"#F97316"}}>2</strong> Insuficiente · <strong style={{color:"#F59E0B"}}>3</strong> Regular · <strong style={{color:"#10B981"}}>4</strong> Bueno · <strong style={{color:"#1B4FD8"}}>5</strong> Óptimo
                      </div>
                      {dim.inds.map(ind=>(
                        <Ind key={ind} nombre={ind} valor={bData?.[dimId]?.[ind]||0}
                          onChange={v=>{setVal(barrioId,dimId,ind,v);if(vox)speak(`${ind}: ${v>0?LBL[v]:"sin dato"}`);}}/>
                      ))}
                      {/* Brecha vs ICP */}
                      <div style={{marginTop:4,padding:"12px 14px",background:"var(--s2)",borderRadius:12}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                          <span style={{color:"var(--t2)",fontSize:12,fontWeight:600}}>Subíndice {dim.short}</span>
                          <span style={{color:"var(--t3)",fontSize:12}}>ICP Ciudad: {icp[dim.id]}</span>
                        </div>
                        <div style={{position:"relative",height:10,background:"var(--b)",borderRadius:5}}>
                          <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${sc}%`,background:r.bar,borderRadius:5,transition:"width .4s"}}/>
                          <div style={{position:"absolute",left:`${icp[dim.id]}%`,top:-5,width:2,height:20,background:"var(--t1)",borderRadius:1,transform:"translateX(-50%)"}}/>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                          <span style={{color:r.c,fontWeight:800,fontSize:14,fontFamily:"'Syne',sans-serif"}}>{sc}/100</span>
                          <span style={{color:sc<icp[dim.id]?"var(--ar)":"var(--ag)",fontWeight:700,fontSize:12}}>
                            Brecha: {Math.abs(sc-icp[dim.id])} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {/* ── MAPA ── */}
        {tab==="mapa"&&(
          <MapaLeaflet barrios={barrios} activeId={barrioId} onAssign={assignLoc} speak={vox?speak:null}/>
        )}

        {/* ── INFORME ── */}
        {tab==="informe"&&(
          <div className="fu">
            {!barrioId ? EP("📋","Seleccioná un barrio","Elegí un barrio para generar el informe IPB.","Ir a Barrios →",()=>setTab("barrios")):(
              <>
                {/* IPB Final */}
                <div style={{...card,background:"linear-gradient(135deg,#040D21,#0C1F4A)",border:"none"}}>
                  <div style={{color:"rgba(6,182,212,.8)",fontSize:10,fontWeight:700,letterSpacing:2,
                    textTransform:"uppercase",marginBottom:8}}>Zárate Emergente · Informe Final</div>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    <div style={{width:"45%",flexShrink:0}}>
                      <Gauge ipb={ipbFinal}/>
                    </div>
                    <div>
                      <div style={{color:"rgba(255,255,255,.5)",fontSize:10,fontWeight:700,
                        letterSpacing:1,textTransform:"uppercase"}}>IPB Final</div>
                      <div style={{color:"white",fontWeight:800,fontSize:18,fontFamily:"'Syne',sans-serif",
                        marginTop:2,marginBottom:4,lineHeight:1.2}}>{barrio.nombre}</div>
                      <span style={{...chip(rangoF.c,rangoF.bg)}}>{rangoF.l}</span>
                      <div style={{color:"rgba(255,255,255,.4)",fontSize:11,marginTop:8}}>
                        ICP Ciudad: <strong style={{color:"rgba(255,255,255,.7)"}}>{icpProm}</strong><br/>
                        Brecha: <span style={{color:ipbFinal<icpProm?"#F87171":"#34D399",fontWeight:700}}>
                          {Math.abs(ipbFinal-icpProm)} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Radar */}
                {ipbFinal>0&&(
                  <div style={card}>
                    <div style={secT}>Rueda de Prosperidad · ONU-Hábitat</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={DIMS.map(d=>({subject:d.short,IPB:dimScores[d.id],ICP:icp[d.id],fullMark:100}))}>
                        <PolarGrid stroke="var(--b)"/>
                        <PolarAngleAxis dataKey="subject" tick={{fill:"var(--t3)",fontSize:10,fontFamily:"Inter"}}/>
                        <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false}/>
                        <Radar name="IPB Barrio" dataKey="IPB" stroke="#1B4FD8" fill="#1B4FD8" fillOpacity={0.2} dot={false}/>
                        <Radar name="ICP Ciudad" dataKey="ICP" stroke="var(--t3)" fill="none" strokeDasharray="4 3" dot={false}/>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Brechas */}
                {ipbFinal>0&&(
                  <div style={card}>
                    <div style={secT}>Brecha → Intervención</div>
                    {DIMS.map(d=>({...d,sc:dimScores[d.id],br:icp[d.id]-dimScores[d.id]}))
                      .sort((a,b)=>b.br-a.br).map(d=>{
                        const r=RNG(d.sc);
                        return (
                          <div key={d.id} style={{display:"flex",alignItems:"center",gap:10,
                            padding:"9px 0",borderBottom:"1px solid var(--b)"}}>
                            <span style={{fontSize:18,flexShrink:0}}>{d.icon}</span>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{color:"var(--t1)",fontSize:12,fontWeight:600}}>{d.label}</div>
                              <div style={{height:4,borderRadius:2,background:"var(--b)",marginTop:4}}>
                                <div style={{height:"100%",width:`${d.sc}%`,background:r.bar,borderRadius:2,transition:"width .4s"}}/>
                              </div>
                            </div>
                            <div style={{textAlign:"right",flexShrink:0}}>
                              <div style={{color:r.c,fontWeight:800,fontSize:16,fontFamily:"'Syne',sans-serif"}}>{d.sc}</div>
                              <div style={{color:d.br>20?"var(--ar)":d.br>0?"var(--ay)":"var(--ag)",fontSize:11,fontWeight:700}}>
                                {d.br>0?`▼${d.br}`:`▲${Math.abs(d.br)}`}
                              </div>
                            </div>
                            {d.sc<=20&&<span style={chip("var(--ar)","#FEF2F2")}>⚠</span>}
                          </div>
                        );
                    })}
                  </div>
                )}

                {/* MZE */}
                <div style={{...card,border:`2px solid ${mzeOk===3?"var(--ag)":mzeOk===2?"var(--ay)":"var(--ar)"}22`,
                  background:mzeOk===3?"#F0FDF4":mzeOk===2?"#FFFBEB":"#FEF2F2"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={secT}>Validación MZE</div>
                    <span style={chip(mzeOk===3?"var(--ag)":mzeOk===2?"var(--ay)":"var(--ar)",
                      mzeOk===3?"#D1FAE5":mzeOk===2?"#FEF3C7":"#FEE2E2")}>{mzeOk}/3</span>
                  </div>
                  {[
                    {l:"Coherencia escala 1–5",s:`${cargados}/${totalInds} indicadores cargados`,ok:mze1},
                    {l:"Umbral representatividad",s:`${mAct}/${mNec} fichas (IC 95% · ≤10%)`,ok:mze2},
                    {l:"Triangulación IPB / ICP",s:`Brecha: ${Math.abs(ipbFinal-icpProm)} pts (límite: 30)`,ok:mze3},
                  ].map((c,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 12px",
                      background:"var(--s)",borderRadius:11,marginBottom:8,border:"1px solid var(--b)"}}>
                      <div style={{width:26,height:26,borderRadius:8,flexShrink:0,
                        background:c.ok?"#D1FAE5":"#FEE2E2",display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:14}}>{c.ok?"✓":"✗"}</div>
                      <div>
                        <div style={{color:"var(--t1)",fontSize:12,fontWeight:700}}>{c.l}</div>
                        <div style={{color:"var(--t3)",fontSize:11}}>{c.s}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ICP ajustable */}
                <div style={card}>
                  <div style={secT}>ICP Ciudad (ajustable)</div>
                  {DIMS.map(d=>(
                    <div key={d.id} style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{color:"var(--t2)",fontSize:12,fontWeight:500}}>{d.icon} {d.label}</span>
                        <span style={{color:"var(--a)",fontWeight:700,fontSize:13,fontFamily:"'Syne',sans-serif"}}>{icp[d.id]}</span>
                      </div>
                      <input type="range" min={0} max={100} value={icp[d.id]}
                        onChange={e=>setIcp(p=>({...p,[d.id]:parseInt(e.target.value)}))}/>
                    </div>
                  ))}
                </div>

                {/* Exportar */}
                <div style={card}>
                  <div style={{color:"var(--t3)",fontSize:10,fontWeight:700,letterSpacing:1.5,
                    textTransform:"uppercase",marginBottom:4}}>Host: {HOST}</div>
                  <div style={{color:"var(--t2)",fontSize:12,lineHeight:1.6,marginBottom:14}}>
                    El JSON exportado incluye todos los metadatos del barrio, coordenadas GPS y resultados IPB, listo para AutoCrat.
                  </div>
                  <div style={{background:"var(--s2)",borderRadius:10,padding:"10px 14px",
                    marginBottom:14,fontFamily:"monospace",fontSize:11,color:"var(--t2)",letterSpacing:.3}}>
                    IPB · {barrio.nombre} · {new Date().toLocaleDateString("es-AR")}
                  </div>
                  <BP onClick={exportar} disabled={mzeOk<3}
                    style={{background:mzeOk===3?"var(--a)":"var(--b)",color:mzeOk===3?"white":"var(--t3)",cursor:mzeOk===3?"pointer":"not-allowed"}}>
                    {mzeOk===3?`⬇ Generar Informe · ${barrio.nombre.replace(/^\d+-/,"")}`:`⚠ MZE incompleto (${3-mzeOk} criterio${3-mzeOk>1?"s":""} pendiente${3-mzeOk>1?"s":""})`}
                  </BP>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* ════ MODALES ════ */}
      {showImport&&<ModalImport barrioNombre={barrio?.nombre} barrioId={barrioId} onImport={onImport} onClose={()=>setShowImport(false)}/>}
      {showModal&&<ModalBarrio prefill={searchQ} onSave={addBarrio} onClose={()=>setShowModal(false)}/>}
      {showA11y&&<PanelA11y hc={hc} setHc={setHc} lt={lt} setLt={setLt} speak={speak} stopSpeak={stopSpeak} vox={vox} setVox={setVox} listen={listen} startVoice={startVoice} onClose={()=>setShowA11y(false)}/>}

      {/* ════ BOTTOM NAV ════ */}
      <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:480,zIndex:100,
        background:"rgba(255,255,255,.88)",backdropFilter:"blur(20px)",
        borderTop:"1px solid var(--b)",display:"flex",
        boxShadow:"0 -8px 32px rgba(10,15,30,.1)"}}>
        {nav.map(n=>(
          <button key={n.id} className="ht" onClick={()=>setTab(n.id)}
            aria-selected={tab===n.id} aria-label={n.label}
            style={{flex:1,padding:"10px 4px 9px",border:"none",background:"transparent",
              cursor:"pointer",display:"flex",flexDirection:"column",
              alignItems:"center",gap:2,transition:"all .15s",position:"relative"}}>
            {tab===n.id&&<div style={{position:"absolute",top:0,left:"18%",right:"18%",
              height:2.5,background:"var(--a)",borderRadius:"0 0 4px 4px"}}/>}
            <span style={{fontSize:18,opacity:tab===n.id?1:.55,
              filter:tab===n.id?"none":"grayscale(20%)"}}>{n.icon}</span>
            <span style={{fontSize:10,fontFamily:"'Inter',sans-serif",
              fontWeight:tab===n.id?700:500,
              color:tab===n.id?"var(--a)":"var(--t3)",letterSpacing:.1}}>
              {n.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
