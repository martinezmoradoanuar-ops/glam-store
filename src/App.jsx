import { useState, useEffect } from 'react'

const TODOS_PRODUCTOS = [
  { id: 1, nombre: "Base Luminosa", precio: 250, imagen: "/base-luminosa.jpg", tipo: "Bases", masVendido: true, rating: 5, resenas: 120 },
  { id: 2, nombre: "Base Mate 24h", precio: 280, imagen: "/base-mate24h.jpg", tipo: "Bases", rating: 4.8, resenas: 89 },
  { id: 3, nombre: "Labial Mate Rosa", precio: 120, imagen: "/labial-mate-rosa.jpg", tipo: "Labiales", rating: 4.9, resenas: 210 },
  { id: 4, nombre: "Labial Rojo Intenso", precio: 135, imagen: "/labial-rojo-intenso.jpg", tipo: "Labiales", rating: 4.9, resenas: 156 },
  { id: 5, nombre: "Paleta Nude", precio: 320, imagen: "/paleta-nude.jpg", tipo: "Sombras", rating: 4.7, resenas: 98 },
  { id: 6, nombre: "Sombras Glitter", precio: 300, imagen: "/sombras-glitter.jpg", tipo: "Sombras", masVendido: true, rating: 5, resenas: 340 },
]

export default function App() {
  const [temaOscuro, setTemaOscuro] = useState(false)
  const [ventana, setVentana] = useState('inicio')
  const [productoSel, setProductoSel] = useState(TODOS_PRODUCTOS[0])
  const [carrito, setCarrito] = useState([])
  const [cantidad, setCantidad] = useState(1)
  const [filtros, setFiltros] = useState({ marcas:[], tonos:[], tipos:['Labiales','Bases','Sombras'], precioMax:500 })
  const [soloMasVendidos, setSoloMasVendidos] = useState(false)
  const [agregado, setAgregado] = useState(false)
  const [pagoExitoso, setPagoExitoso] = useState(false)
  const [mostrarEntrega, setMostrarEntrega] = useState(false)
  const [preguntaGuardar, setPreguntaGuardar] = useState(false)
  const [quiereGuardar, setQuiereGuardar] = useState(false)
  const [datosEnvio, setDatosEnvio] = useState({ nombre:'', telefono:'', calle:'', municipio:'', estado:'', cp:'' })

  useEffect(()=>{
    document.body.style.background = temaOscuro ? '#18181b' : '#FFFBF9'
  },[temaOscuro])

  // Si ya habia guardado su direccion antes, la carga sola
  useEffect(()=>{
    const guardada = localStorage.getItem('glam_direccion')
    if(guardada){
      setDatosEnvio(JSON.parse(guardada))
      setQuiereGuardar(true)
    }
  },[])

  // Pago exitoso se quita solo a los 4 segundos y regresa a inicio
  useEffect(()=>{
    if(pagoExitoso){
      const t = setTimeout(()=>{
        setPagoExitoso(false)
        setVentana('inicio')
      }, 4000)
      return ()=>clearTimeout(t)
    }
  },[pagoExitoso])

  // Fechas entrega 3 a 5 dias
  const hoy = new Date()
  const fechaMin = new Date(hoy); fechaMin.setDate(hoy.getDate()+3)
  const fechaMax = new Date(hoy); fechaMax.setDate(hoy.getDate()+5)
  const formatoFecha = (f) => f.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })

  const filtrados = TODOS_PRODUCTOS.filter(p=>{
    if(soloMasVendidos && !p.masVendido) return false
    if(filtros.marcas.length && !filtros.marcas.includes(p.marca)) return false
    if(filtros.tonos.length && !filtros.tonos.includes(p.tono)) return false
    if(!filtros.tipos.includes(p.tipo)) return false
    if(p.precio > filtros.precioMax) return false
    return true
  })

  const resetearFiltros = () => {
    setFiltros({ marcas:[], tonos:[], tipos:['Labiales','Bases','Sombras'], precioMax:500 })
    setSoloMasVendidos(false)
  }

  const irATiendaTodos = () => { resetearFiltros(); setVentana('tienda') }
  const irAMasVendidos = () => { setSoloMasVendidos(true); setVentana('tienda') }

  const agregarCarrito = (prod, cant=1) => {
    // Al volver a comprar otra cosa, se quita TODO lo del pago anterior
    setPagoExitoso(false)
    setMostrarEntrega(false)
    setPreguntaGuardar(false)
    const existe = carrito.find(i=>i.id===prod.id)
    if(existe) setCarrito(carrito.map(i=> i.id===prod.id ? {...i, cantidad: i.cantidad+cant} : i))
    else setCarrito([...carrito, {...prod, cantidad:cant}])
    setAgregado(true); setTimeout(()=>setAgregado(false),1500)
  }

  const cambiarDato = (campo, valor) => {
    setDatosEnvio({...datosEnvio, [campo]: valor})
    setMostrarEntrega(false)
  }

  const pagarPedido = () => {
    if(carrito.length===0){ setVentana('tienda'); return }
    if(!datosEnvio.nombre || !datosEnvio.telefono || !datosEnvio.calle || !datosEnvio.municipio || !datosEnvio.estado || !datosEnvio.cp){
      alert('Primero llena toda tu dirección de envío porfis 🙏')
      return
    }
    // PASO 1: Pregunta si quiere guardar
    if(!mostrarEntrega && !preguntaGuardar){
      setPreguntaGuardar(true)
      return
    }
    // PASO 2: Ya mostro entrega, ahora si paga
    if(mostrarEntrega){
      setCarrito([])
      setPagoExitoso(true)
      setMostrarEntrega(false)
      setPreguntaGuardar(false)
      // Si dijo que NO quiere guardar, se borra todo para la proxima compra
      if(!quiereGuardar){
        localStorage.removeItem('glam_direccion')
        setDatosEnvio({ nombre:'', telefono:'', calle:'', municipio:'', estado:'', cp:'' })
      }
    }
  }

  const subtotal = carrito.reduce((a,p)=>a+p.precio*p.cantidad,0)
  const impuesto = subtotal*0.08
  const total = subtotal+impuesto
  const textoEnvio = datosEnvio.municipio ? `Envío Gratis a ${datosEnvio.municipio}, ${datosEnvio.estado}` : 'Envío Gratis a todo México'

  return (
    <div className={temaOscuro ? "bg-zinc-900 text-white min-h-screen font-sans" : "bg-[#FFFBF9] min-h-screen font-sans"}>
      <header className={temaOscuro ? "bg-zinc-800 mx-4 mt-4 rounded-2xl shadow flex items-center justify-between px-6 py-4 sticky top-4 z-50" : "bg-white mx-4 mt-4 rounded-2xl shadow flex items-center justify-between px-6 py-4 sticky top-4 z-50"}>
        <div onClick={()=>setVentana('inicio')} className="flex items-center gap-2 cursor-pointer font-black text-xl">✨ Glam<br/>Store</div>
        <nav className="hidden md:flex gap-6 text-gray-500">
          <button onClick={()=>setVentana('inicio')} className={ventana==='inicio'?'text-black font-bold':''}>Inicio</button>
          <button onClick={irATiendaTodos}>Tienda</button>
          <button onClick={irAMasVendidos}>Mas vendidos</button>
        </nav>
        <div className="flex gap-3 items-center">
          <button onClick={()=>setTemaOscuro(!temaOscuro)} className={temaOscuro ? "bg-white text-black px-3 py-1 rounded-full text-xs" : "bg-black text-white px-3 py-1 rounded-full text-xs"}>
            {temaOscuro ? '☀️ Claro' : '🌙 Oscuro'}
          </button>
          <button onClick={irATiendaTodos}>🔍</button>
          <button onClick={()=>setVentana('carrito')} className="relative">🛒 {carrito.length>0 && <span className="absolute -top-2 -right-2 bg-pink-400 text-white text-xs rounded-full px-1">{carrito.reduce((a,b)=>a+b.cantidad,0)}</span>}</button>
        </div>
      </header>

      {ventana==='inicio' && (
        <>
          <section className={temaOscuro ? "bg-zinc-800 mx-4 mt-4 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center" : "bg-[#F9EBE5] mx-4 mt-4 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center"}>
            <div className="md:w-1/2">
              <span className="border border-pink-200 text-pink-400 bg-pink-50 px-4 py-1 rounded-full text-sm">Nueva coleccion 2026</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-6">Brilla Natural. Belleza Sin Esfuerzo Todos Los Dias</h2>
              <div className="flex gap-4 mt-8">
                <button onClick={irATiendaTodos} className={temaOscuro ? "bg-white text-black px-8 py-3 rounded-full" : "bg-black text-white px-8 py-3 rounded-full"}>Comprar ahora</button>
                <button onClick={irATiendaTodos} className="border px-8 py-3 rounded-full">Explorar coleccion</button>
              </div>
            </div>
            <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600" className="md:w-1/2 h-72 object-cover rounded-xl mt-6 md:mt-0" />
          </section>
          <section className={temaOscuro ? "mx-4 mt-8 bg-zinc-800 rounded-2xl p-8" : "mx-4 mt-8 bg-white rounded-2xl p-8"}>
            <h3 className="text-3xl font-bold text-center mb-8">Comprar Por Categoria</h3>
            <div className="grid grid-cols-3 gap-6">
              <button onClick={()=>{setFiltros({...filtros, tipos:['Labiales']}); setSoloMasVendidos(false); setVentana('tienda')}} className="border-2 border-[#F9EBE5] rounded-2xl p-8">💄<h4 className="font-bold">Labiales</h4><p className="text-pink-400 text-sm underline">ver producto →</p></button>
              <button onClick={()=>{setFiltros({...filtros, tipos:['Bases']}); setSoloMasVendidos(false); setVentana('tienda')}} className="border-2 border-[#F9EBE5] rounded-2xl p-8">🧴<h4 className="font-bold">Bases</h4><p className="text-pink-400 text-sm underline">ver producto →</p></button>
              <button onClick={()=>{setFiltros({...filtros, tipos:['Sombras']}); setSoloMasVendidos(false); setVentana('tienda')}} className="border-2 border-[#F9EBE5] rounded-2xl p-8">🎨<h4 className="font-bold">Sombras</h4><p className="text-pink-400 text-sm underline">ver producto →</p></button>
            </div>
          </section>
        </>
      )}

      {ventana==='tienda' && (
        <div className="mx-4 mt-6 grid md:grid-cols-[280px_1fr] gap-6">
          <div className={temaOscuro ? "bg-zinc-800 rounded-2xl p-5 h-fit" : "bg-white rounded-2xl p-5 h-fit"}>
            <h3 className="font-bold">Filtros {soloMasVendidos && <span className="text-pink-400 text-sm">- Mas Vendidos</span>}</h3>
            <p className="font-bold mt-4 text-sm">Tipo</p>
            {['Labiales','Bases','Sombras'].map(t=><label key={t} className="flex gap-2 text-sm"><input type="checkbox" checked={filtros.tipos.includes(t)} onChange={()=>setFiltros(f=>({...f, tipos: f.tipos.includes(t)?f.tipos.filter(x=>x!==t):[...f.tipos,t]}))}/>{t}</label>)}
            <p className="font-bold mt-4 text-sm">Precio max: ${filtros.precioMax}</p>
            <input type="range" min="50" max="500" value={filtros.precioMax} onChange={e=>setFiltros({...filtros, precioMax: parseInt(e.target.value)})} className="w-full accent-pink-300"/>
            <button onClick={resetearFiltros} className="w-full mt-4 border rounded-xl py-2 text-sm">Resetear</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filtrados.length===0 && <p className="col-span-3 text-center text-gray-400 bg-white rounded-2xl p-8">No hay productos con esos filtros</p>}
            {filtrados.map(p=>(
              <div key={p.id} className={temaOscuro ? "bg-zinc-800 rounded-2xl p-3" : "bg-white rounded-2xl p-3 shadow-sm"}>
                <img onClick={()=>{setProductoSel(p); setVentana('detalle'); setCantidad(1)}} src={p.imagen} className="h-48 w-full object-cover rounded-xl cursor-pointer"/>
                <h4 className="font-bold mt-2 text-sm">{p.nombre}</h4><p className="text-[#D49A9A]">${p.precio}</p>
                {p.masVendido && <span className="text-xs bg-pink-100 text-pink-500 px-2 py-1 rounded-full">⭐ Más vendido</span>}
                <button onClick={()=>agregarCarrito(p,1)} className={temaOscuro ? "w-full mt-2 bg-white text-black py-2 rounded-full text-sm" : "w-full mt-2 bg-black text-white py-2 rounded-full text-sm"}>Agregar al carrito</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {ventana==='detalle' && (
        <div className={temaOscuro ? "mx-4 mt-4 bg-zinc-800 rounded-2xl p-6" : "mx-4 mt-4 bg-white rounded-2xl p-6"}>
          <button onClick={()=>setVentana('tienda')} className="text-sm mb-4">← Volver</button>
          <div className="grid md:grid-cols-2 gap-8">
            <img src={productoSel.imagen} className="h-[400px] w-full object-cover rounded-xl bg-[#F9EBE5]"/>
            <div>
              <span className="bg-[#F9EBE5] text-[#C48A8A] px-3 py-1 rounded-full text-sm">Más vendido</span>
              <h1 className="text-3xl font-bold mt-3">{productoSel.nombre}</h1>
              <p className="text-sm mt-1">★★★★★ ({productoSel.rating}) ({productoSel.resenas} reseñas)</p>
              <p className="text-3xl font-bold mt-2">${productoSel.precio}.00</p>
              <div className="flex items-center gap-4 mt-6"><span className="font-bold">Cantidad:</span><div className="flex border rounded-lg"><button onClick={()=>setCantidad(Math.max(1,cantidad-1))} className="px-3">−</button><span className="px-4 border-x">{cantidad}</span><button onClick={()=>setCantidad(cantidad+1)} className="px-3">+</button></div></div>
              <button onClick={()=>agregarCarrito(productoSel,cantidad)} className={temaOscuro ? "w-full bg-white text-black py-3 rounded-xl mt-6" : "w-full bg-black text-white py-3 rounded-xl mt-6"}>Añadir al carrito</button>
            </div>
          </div>
        </div>
      )}

      {ventana==='carrito' && (
        <div className="mx-4 mt-6">
          <h1 className="text-2xl font-bold text-center">Carrito - {carrito.length} Artículos</h1>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {carrito.length===0 ? <p className="bg-white rounded-2xl p-12 text-center text-gray-400 col-span-3">Tu carrito está vacío</p> :
              carrito.map(p=>(
                <div key={p.id} className={temaOscuro ? "bg-zinc-800 rounded-2xl p-4" : "bg-white rounded-2xl p-4"}>
                  <img src={p.imagen} className="h-32 w-full object-cover rounded-xl"/>
                  <h3 className="font-bold mt-2 text-sm">{p.nombre}</h3><p className="text-xs text-gray-500">{p.cantidad} x ${p.precio}</p>
                  <div className="flex justify-between mt-3"><div className="flex border rounded-xl"><button onClick={()=>setCarrito(carrito.map(i=>i.id===p.id?{...i,cantidad:Math.max(1,i.cantidad-1)}:i))} className="px-2">−</button><span className="px-3 border-x">{p.cantidad}</span><button onClick={()=>setCarrito(carrito.map(i=>i.id===p.id?{...i,cantidad:i.cantidad+1}:i))} className="px-2">+</button></div><button onClick={()=>setCarrito(carrito.filter(i=>i.id!==p.id))}>🗑️</button></div>
                </div>
              ))
            }
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-6 items-start">
            <div className={temaOscuro ? "bg-zinc-800 rounded-2xl p-6" : "bg-white rounded-2xl p-6"}>
              <h3 className="font-bold text-lg">📦 Dirección de Envío</h3>
              {quiereGuardar && <p className="text-xs text-green-600 font-bold mt-1">✓ Información guardada de tu última compra</p>}
              <div className="grid gap-3 mt-4">
                <input placeholder="Nombre completo" value={datosEnvio.nombre} onChange={e=>cambiarDato('nombre', e.target.value)} className="border rounded-xl px-3 py-2 w-full text-black" />
                <input placeholder="Teléfono / WhatsApp" value={datosEnvio.telefono} onChange={e=>cambiarDato('telefono', e.target.value)} className="border rounded-xl px-3 py-2 w-full text-black" />
                <input placeholder="Calle, número y colonia" value={datosEnvio.calle} onChange={e=>cambiarDato('calle', e.target.value)} className="border rounded-xl px-3 py-2 w-full text-black" />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Municipio - Ej: Xico" value={datosEnvio.municipio} onChange={e=>cambiarDato('municipio', e.target.value)} className="border rounded-xl px-3 py-2 w-full text-black" />
                  <input placeholder="Estado - Ej: Veracruz" value={datosEnvio.estado} onChange={e=>cambiarDato('estado', e.target.value)} className="border rounded-xl px-3 py-2 w-full text-black" />
                </div>
                <input placeholder="Código Postal" value={datosEnvio.cp} onChange={e=>cambiarDato('cp', e.target.value)} className="border rounded-xl px-3 py-2 w-full text-black" />
              </div>
            </div>

            <div className={temaOscuro ? "bg-zinc-800 rounded-2xl p-6" : "bg-white rounded-2xl p-6"}>
              <h3 className="font-bold">Resumen del Recibo</h3>
              <div className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div><div className="flex justify-between"><span>Envío:</span><span className="text-green-600">Gratis</span></div><div className="flex justify-between"><span>Impuesto 8%:</span><span>${impuesto.toFixed(2)}</span></div><hr/><div className="flex justify-between font-bold text-lg"><span>Total:</span><span>${total.toFixed(2)}</span></div></div>

              {mostrarEntrega && (
                <div className="bg-[#FFFBF9] border border-pink-100 rounded-xl p-3 mt-4 text-center text-black">
                  <p className="text-sm font-bold">🚚 Entrega estimada: 3 a 5 días hábiles</p>
                  <p className="text-sm text-gray-600 mt-1">Llega entre el <span className="font-bold text-black">{formatoFecha(fechaMin)}</span></p>
                  <p className="text-sm text-gray-600">y el <span className="font-bold text-black">{formatoFecha(fechaMax)}</span></p>
                  <p className="text-xs text-green-600 mt-2 font-bold">✓ {textoEnvio}</p>
                  <p className="text-xs text-gray-500 mt-1">Para: {datosEnvio.nombre} - {datosEnvio.calle}, {datosEnvio.municipio}, {datosEnvio.estado} C.P. {datosEnvio.cp}</p>
                </div>
              )}

              <button onClick={pagarPedido} className={temaOscuro ? "w-full bg-white text-black py-3 rounded-xl mt-6 font-bold" : "w-full bg-black text-white py-3 rounded-xl mt-6 font-bold"}>{mostrarEntrega ? '✅ CONFIRMAR PAGO' : '[PAGAR]'}</button>
              {carrito.length===0 && <p className="text-center text-xs text-gray-400 mt-2">Agrega productos para pagar</p>}
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICACION ¿GUSTAS GUARDAR ESTA INFORMACION? */}
      {preguntaGuardar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white text-black rounded-2xl p-6 w-[90%] max-w-sm text-center shadow-xl">
            <p className="text-4xl">💾</p>
            <h3 className="font-bold text-lg mt-2">¿Gustas guardar esta información?</h3>
            <p className="text-sm text-gray-500 mt-1">Se guardará tu registro de envío para tu próxima compra:<br/><span className="font-bold text-black">{datosEnvio.nombre} - {datosEnvio.municipio}, {datosEnvio.estado}</span></p>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>{ setQuiereGuardar(true); localStorage.setItem('glam_direccion', JSON.stringify(datosEnvio)); setPreguntaGuardar(false); setMostrarEntrega(true) }} className="flex-1 bg-black text-white py-2 rounded-full font-bold">Aceptar</button>
              <button onClick={()=>{ setQuiereGuardar(false); localStorage.removeItem('glam_direccion'); setPreguntaGuardar(false); setMostrarEntrega(true) }} className="flex-1 border py-2 rounded-full font-bold">Cancelar / Rechazar</button>
            </div>
          </div>
        </div>
      )}

      {agregado && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-2xl shadow font-bold animate-bounce z-50">Agregado al carrito ✨</div>}
      {pagoExitoso && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-2xl shadow font-bold text-center z-50">
          <button onClick={()=>{setPagoExitoso(false); setVentana('inicio')}} className="absolute top-1 right-3 text-white font-black">✕</button>
          ¡Pago exitoso excelente! ✨<br/>
          <button onClick={()=>{setPagoExitoso(false); setVentana('inicio')}} className="bg-white text-green-600 px-4 py-1 rounded-full text-sm mt-2 font-bold">Seguir comprando</button>
          <p className="text-xs font-normal mt-1">Se cierra sola en 4 segundos...</p>
        </div>
      )}
    </div>
  )
}