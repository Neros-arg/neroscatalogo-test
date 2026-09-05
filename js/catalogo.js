/* =========================================================
CONFIG
========================================================= */

const API=
"https://script.google.com/macros/s/AKfycbyq3ELQLXoYwdeYfvbL1GXWWc0blYp48VCWObDAYs6YgXiUKczqOlNDRY3KyjoCTD-fUA/exec";

const WHATSAPP=
"5493417830300";

const MINIMO_MAYORISTA=
10;

/*
IMPORTANTE:
Esta clave funciona como barrera visual del catálogo mayorista.
Al estar en un archivo HTML público, NO es seguridad real de servidor.
Podés cambiarla por la que quieras.
*/
const CLAVE_MAYORISTA=
"NEROS2026";

let accesoMayoristaAutorizado=
sessionStorage.getItem("nerosMayoristaOK")==="1";

let accionMayoristaPendiente=null;

const PRODUCTOS_POR_PAGINA=
30;

let perfumes=[];

let carrito=[];

let modoActual=
"particular";

let formaPago=
"transferencia";

let paginaActual=
1;

let productosFiltrados=[];

let filtroRapido=
"todos";

let filtroTipo=
"TODOS";

let filtroGenero=
"TODOS";

let filtroStockPopup=
"todos";

let filtroTester=
"todos";

let filtroPrecioMax=null;
let precioMaximoCatalogo=0;

/* =========================================================
API
========================================================= */

fetch(API)

.then(respuesta=>{

if(!respuesta.ok){

throw new Error(
"HTTP "+
respuesta.status
);

}

return respuesta.json();

})

.then(data=>{

if(!Array.isArray(data)){

throw new Error(
"Respuesta inválida de la API"
);

}

perfumes=data;

calcularPrecioMaximoCatalogo();
actualizarFiltroPrecioUI();
aplicarFiltrosCatalogo();

})

.catch(error=>{

console.error(error);

document
.getElementById("productos")
.innerHTML=`

<div style="
grid-column:1/-1;
text-align:center;
padding:50px;
color:#ff5a5a;
">

No se pudieron cargar los productos.

</div>

`;

});

/* =========================================================
ACCESO MAYORISTA
========================================================= */

function abrirAccesoMayorista(accion){

accionMayoristaPendiente=
typeof accion==="function"
?
accion
:
()=>activarMayoristaAutorizado();

const overlay=
document.getElementById("mayoristaOverlay");

const input=
document.getElementById("claveMayoristaInput");

const error=
document.getElementById("mayoristaError");

if(error){
error.textContent="";
}

if(input){
input.value="";
}

overlay.classList.add("activo");

setTimeout(()=>{
if(input){
input.focus();
}
},120);

}

function cerrarAccesoMayorista(){

document
.getElementById("mayoristaOverlay")
.classList
.remove("activo");

accionMayoristaPendiente=null;

}

function cerrarAccesoMayoristaPorFondo(event){

if(
event.target &&
event.target.id==="mayoristaOverlay"
){
cerrarAccesoMayorista();
}

}

function validarClaveMayorista(){

const input=
document.getElementById("claveMayoristaInput");

const error=
document.getElementById("mayoristaError");

const clave=
String(input.value || "").trim();

if(clave===CLAVE_MAYORISTA){

accesoMayoristaAutorizado=true;

sessionStorage.setItem(
"nerosMayoristaOK",
"1"
);

const accion=
accionMayoristaPendiente;

document
.getElementById("mayoristaOverlay")
.classList
.remove("activo");

accionMayoristaPendiente=null;

if(typeof accion==="function"){
accion();
}

setTimeout(()=>{
mostrarMayoristaDesbloqueado();
},180);

return;
}

error.textContent=
"Clave incorrecta. Volvé a intentarlo.";

input.select();

}


function mostrarMayoristaDesbloqueado(){

const overlay=
document.getElementById("mayoristaSuccessOverlay");

if(overlay){
overlay.classList.add("activo");
}

}

function cerrarMayoristaSuccess(){

const overlay=
document.getElementById("mayoristaSuccessOverlay");

if(overlay){
overlay.classList.remove("activo");
}

}

function cerrarMayoristaSuccessPorFondo(event){

if(
event.target &&
event.target.id==="mayoristaSuccessOverlay"
){
cerrarMayoristaSuccess();
}

}

function verTodoMayorista(){

filtroTester="todos";

cerrarMayoristaSuccess();

aplicarFiltrosCatalogo();

document
.getElementById("catalogo")
.scrollIntoView({behavior:"smooth"});

}

function verTestersDesbloqueados(){

filtroTester="tester";

cerrarMayoristaSuccess();

aplicarFiltrosCatalogo();

document
.getElementById("catalogo")
.scrollIntoView({behavior:"smooth"});

}


function solicitarAccesoMayorista(){

if(accesoMayoristaAutorizado){

activarMayoristaAutorizado();
return;

}

abrirAccesoMayorista(
()=>activarMayoristaAutorizado()
);

}

function activarMayoristaAutorizado(){

filtroRapido="todos";
filtroStockPopup="todos";
filtroTester="todos";

cambiarModo("mayorista");

document
.querySelectorAll(".cat-chip")
.forEach(x=>
x.classList.toggle(
"activo",
x.dataset.chip==="mayorista"
)
);

document
.getElementById("catalogo")
.scrollIntoView({
behavior:"smooth"
});

}

/* =========================================================
MODO
========================================================= */

function cambiarModo(modo){

if(
modo==="mayorista" &&
!accesoMayoristaAutorizado
){

abrirAccesoMayorista(
()=>activarMayoristaAutorizado()
);

return;

}

if(
modoActual!==modo &&
carrito.length>0
){

carrito=[];

actualizarCarrito();

}

modoActual=modo;

/* Cada modo maneja una escala de precios diferente */
filtroPrecioMax=null;

if(modo==="particular"){
filtroTester="todos";
}

document
.getElementById("modoParticular")
.classList
.toggle(
"activo",
modo==="particular"
);

document
.getElementById("modoMayorista")
.classList
.toggle(
"activo",
modo==="mayorista"
);

paginaActual=1;

aplicarFiltrosCatalogo();

}

/* =========================================================
PAGO
========================================================= */

function cambiarPago(tipo){

formaPago=tipo;

const ids={

transferencia:
"pagoTransferencia",

debito:
"pagoDebito",

credito:
"pagoCredito"

};

Object.entries(ids)
.forEach(([clave,id])=>{

const boton=
document.getElementById(id);

if(boton){

boton.classList.toggle(
"activo",
tipo===clave
);

}

});

renderCarrito();

actualizarCarrito();

}

/* =========================================================
BUSCADOR
========================================================= */

function filtrarProductos(){

paginaActual=1;

aplicarFiltrosCatalogo();

}

document
.getElementById("buscar")
.addEventListener(
"input",
filtrarProductos
);

/* =========================================================
MOSTRAR PRODUCTOS
========================================================= */

function mostrarPagina(){

const contenedor=
document.getElementById(
"productos"
);

if(
!productosFiltrados.length
){

contenedor.innerHTML=`

<div style="
grid-column:1/-1;
text-align:center;
padding:70px 15px;
color:#777;
">

No encontramos productos con esa búsqueda.

</div>

`;

document
.getElementById(
"paginacion"
)
.innerHTML="";

return;

}

const inicio=
(
paginaActual-1
)
*
PRODUCTOS_POR_PAGINA;

const fin=
inicio +
PRODUCTOS_POR_PAGINA;

const pagina=

productosFiltrados.slice(
inicio,
fin
);

contenedor.innerHTML="";

pagina.forEach(producto=>{

const nombre=
producto.perfume ||
"Producto";

const imagen=
producto.foto ||
producto.imagen ||
"";

const stock=
producto.stock ||
"Consultar";

let precio=0;

if(
modoActual==="particular"
){

precio=
precioParticular(producto);

}

else{

precio=
precioMayorista(
producto,
10
);

}

const disponible=
stockDisponible(producto);

const card=
document.createElement(
"div"
);

card.className=
"card reveal";

card.innerHTML=`

<div
class="imagen-producto card-imagen-minimal"
onclick="abrirProducto('${escapeAttr(nombre)}')">

${

imagen

?

`
<img
src="${escapeAttr(imagen)}"
alt="${escapeAttr(nombre)}"
loading="lazy"
onerror="this.style.display='none';">
`

:

`
<div class="sin-imagen-minimal">
SIN IMAGEN
</div>
`

}

${producto.notasOlfativas ? `
<div class="card-notas-hover">
  <div class="card-notas-hover-titulo">NOTAS OLFATIVAS</div>
  ${renderizarNotasOlfativas(producto.notasOlfativas)}
  <div class="card-notas-hover-ayuda">Click para ver todos los detalles</div>
</div>
` : ""}

<div class="badge-stock badge-stock-minimal">
${escapeHTML(stock)}
</div>

</div>

<div
class="card-info card-info-minimal"
onclick="abrirProducto('${escapeAttr(nombre)}')">

<div class="card-minimal-meta">
${producto.tipo ? escapeHTML(producto.tipo==="ARABE" ? "ÁRABE" : producto.tipo) : "NERÓS"}
</div>

<div class="nombre-producto nombre-producto-minimal">
${escapeHTML(nombre)}
</div>

<div class="card-minimal-precio">

${

modoActual==="mayorista"

?

`
<strong>
${
precio>0
?
"$"+Math.round(precio).toLocaleString("es-AR")
:
"Consultar"
}
</strong>
<span>desde 10 unidades</span>
`

:

`
<strong>
$${Math.round(precioParticular(producto)*0.90).toLocaleString("es-AR")}
</strong>
<span>efectivo / transferencia</span>

<div class="card-minimal-cuotas">
💳 2 cuotas sin interés de
<b>$${Math.round(precioParticular(producto)/2).toLocaleString("es-AR")}</b>
</div>
`

}

</div>

<div class="card-mobile-acciones">

<button
type="button"
class="card-mobile-ver"
onclick="
event.stopPropagation();
abrirProducto('${escapeAttr(nombre)}')
">
VER DETALLES
</button>

<button
type="button"
class="card-mobile-agregar"
${!disponible ? "disabled" : ""}
onclick="
event.stopPropagation();
agregarAlCarrito('${escapeAttr(nombre)}')
">
${disponible ? "＋ CARRITO" : "SIN STOCK"}
</button>

</div>

</div>

`;

contenedor.appendChild(
card
);

});

renderPaginacion();

activarAnimacionesCards();

}

/* =========================================================
PAGINACIÓN
========================================================= */

function renderPaginacion(){

const contenedor=
document.getElementById(
"paginacion"
);

const totalPaginas=
Math.ceil(
productosFiltrados.length /
PRODUCTOS_POR_PAGINA
);

contenedor.innerHTML="";

if(totalPaginas<=1){
return;
}

/* -----------------------------------------
CAMBIAR DE PÁGINA
----------------------------------------- */

function irAPagina(numero){

if(
numero<1 ||
numero>totalPaginas ||
numero===paginaActual
){
return;
}

paginaActual=numero;

mostrarPagina();

document
.getElementById("catalogo")
.scrollIntoView({
behavior:"smooth"
});

}


/* -----------------------------------------
BOTÓN NORMAL
----------------------------------------- */

function crearBoton(texto,pagina,claseExtra=""){

const boton=
document.createElement("button");

boton.textContent=texto;

if(claseExtra){
boton.classList.add(claseExtra);
}

if(pagina===paginaActual){
boton.classList.add("activo");
}

boton.onclick=()=>{
irAPagina(pagina);
};

contenedor.appendChild(boton);

}


/* -----------------------------------------
ANTERIOR
----------------------------------------- */

if(paginaActual>1){

crearBoton(
"‹",
paginaActual-1,
"paginacion-nav"
);

}


/* -----------------------------------------
PÁGINAS A MOSTRAR
----------------------------------------- */

const paginas=[];

if(totalPaginas<=7){

for(let i=1;i<=totalPaginas;i++){
paginas.push(i);
}

}else{

paginas.push(1);

const desde=
Math.max(
2,
paginaActual-2
);

const hasta=
Math.min(
totalPaginas-1,
paginaActual+2
);

if(desde>2){
paginas.push("...");
}

for(
let i=desde;
i<=hasta;
i++
){
paginas.push(i);
}

if(hasta<totalPaginas-1){
paginas.push("...");
}

paginas.push(totalPaginas);

}


/* -----------------------------------------
RENDER
----------------------------------------- */

paginas.forEach(item=>{

if(item==="..."){

const puntos=
document.createElement("span");

puntos.className=
"paginacion-puntos";

puntos.textContent=
"…";

contenedor.appendChild(
puntos
);

return;

}

crearBoton(
String(item),
item
);

});


/* -----------------------------------------
SIGUIENTE
----------------------------------------- */

if(paginaActual<totalPaginas){

crearBoton(
"›",
paginaActual+1,
"paginacion-nav"
);

}

}

/* =========================================================
BUSCAR PRODUCTO
========================================================= */

function buscarProducto(nombre){

return perfumes.find(

producto=>

producto.perfume===
nombre

);

}

/* =========================================================
NOTAS OLFATIVAS — FORMATO VISUAL
========================================================= */

function renderizarNotasOlfativas(texto){

const notas=String(texto || "").trim();

if(!notas){
return "";
}

const limpio=notas.replace(/\s+/g," ").trim();
const regex=/(SALIDA|CORAZ[ÓO]N|FONDO)\s*:\s*([\s\S]*?)(?=\s*[|•·]?\s*(?:SALIDA|CORAZ[ÓO]N|FONDO)\s*:|$)/gi;
const bloques=[];
let match;

while((match=regex.exec(limpio))!==null){
let titulo=match[1].toUpperCase();
if(titulo.startsWith("CORAZ")) titulo="CORAZÓN";
let contenido=match[2].replace(/^[\s|•·-]+|[\s|•·-]+$/g,"").trim();
if(contenido){
bloques.push({titulo,contenido});
}
}

if(!bloques.length){
return `<div class="nota-simple">${escapeHTML(limpio)}</div>`;
}

return `<div class="producto-notas-grid">${bloques.map(b=>{
const emoji=
b.titulo==="SALIDA"
?
"🍋"
:
b.titulo==="CORAZÓN"
?
"🌸"
:
b.titulo==="FONDO"
?
"🌲"
:
"";

return `
<div class="nota-bloque">
<span><b class="nota-emoji">${emoji}</b>${escapeHTML(b.titulo)}</span>
<p>${escapeHTML(b.contenido).replace(/,\s*/g," · ")}</p>
</div>`;
}).join("")}
</div>`;
}

/* =========================================================
FICHA DINÁMICA
========================================================= */

let productoDetalleActual=null;

let cantidadDetalle=1;

function abrirProducto(nombre){

const producto=
buscarProducto(nombre);

if(
!producto
){

return;

}

productoDetalleActual=
producto;

cantidadDetalle=
1;

const contenidoModalProducto=
document.querySelector(".producto-modal-contenido");

if(contenidoModalProducto){
contenidoModalProducto.scrollTop=0;
}

const foto=

producto.foto ||
producto.imagen ||
"";

const precioLista=
precioParticular(producto);

const precioTransferencia=
precioLista *
0.90;

const stock=
producto.stock ||
"Consultar";

document
.getElementById(
"detalleNombre"
)
.textContent=

producto.perfume ||
"Producto NERÓS";

document
.getElementById(
"detalleStock"
)
.textContent=
stock;

const genero=
generoProducto(producto);

const notas=
notasProducto(producto);

const descripcion=
descripcionProducto(producto);

const detalleGenero=
document.getElementById(
"detalleGenero"
);

if(detalleGenero){

let generoTexto="";

if(genero==="MASCULINO"){
generoTexto="♂ Masculino";
}
else if(genero==="FEMENINO"){
generoTexto="♀ Femenino";
}
else if(genero==="UNISEX"){
generoTexto="⚥ Unisex";
}

detalleGenero.textContent=
generoTexto;

detalleGenero.classList.toggle(
"visible",
Boolean(generoTexto)
);

}

const detalleNotas=
document.getElementById(
"detalleNotas"
);

const detalleNotasContenido=
document.getElementById(
"detalleNotasContenido"
);

if(detalleNotas && detalleNotasContenido){

detalleNotasContenido.innerHTML=
renderizarNotasOlfativas(notas);

detalleNotas.classList.toggle(
"visible",
Boolean(notas)
);

}

const detalleDescripcion=
document.getElementById(
"detalleDescripcion"
);

const detalleDescripcionContenido=
document.getElementById(
"detalleDescripcionContenido"
);

if(
detalleDescripcion &&
detalleDescripcionContenido
){

detalleDescripcionContenido.textContent=
descripcion;

detalleDescripcion.classList.toggle(
"visible",
Boolean(descripcion)
);

}

document
.getElementById(
"detalleCantidad"
)
.textContent=
cantidadDetalle;

const imagen=
document.getElementById(
"detalleFoto"
);

imagen.src=
foto;

imagen.alt=

producto.perfume ||
"Producto NERÓS";

imagen.onerror=function(){

this.onerror=null;

this.src=

"https://placehold.co/700x700/151515/c89d38?text=NERÓS";

};

const precios=
document.getElementById(
"detallePrecios"
);

if(
modoActual==="mayorista"
){

const p10=
precioMayorista(
producto,
10
);

const p20=
precioMayorista(
producto,
20
);

const p30=
precioMayorista(
producto,
30
);

precios.innerHTML=`

<div class="producto-precio-principal">

${

p10>0

?

"$"+
Math.round(p10)
.toLocaleString("es-AR")

:

"Consultar"

}

</div>

<div class="producto-ahorro">

Precio mayorista desde 10 unidades

</div>

<div class="producto-mayorista-niveles">

<div class="producto-nivel">

<small>
10+ UNIDADES
</small>

<strong>

${

p10>0

?

"$"+
Math.round(p10)
.toLocaleString("es-AR")

:

"—"

}

</strong>

</div>

<div class="producto-nivel">

<small>
20+ UNIDADES
</small>

<strong>

${

p20>0

?

"$"+
Math.round(p20)
.toLocaleString("es-AR")

:

"—"

}

</strong>

</div>

<div class="producto-nivel">

<small>
30+ UNIDADES
</small>

<strong>

${

p30>0

?

"$"+
Math.round(p30)
.toLocaleString("es-AR")

:

"—"

}

</strong>

</div>

</div>

`;

}

else{

precios.innerHTML=`

<div class="producto-precio-lista">

Precio de lista:
$${Math.round(precioLista)
.toLocaleString("es-AR")}

</div>

<div class="producto-cuotas">

💳 <b>2 cuotas sin interés</b> de

<strong>

$${Math.round(precioLista/2)
.toLocaleString("es-AR")}

</strong>

</div>

<div class="producto-precio-principal">

$${Math.round(precioTransferencia)
.toLocaleString("es-AR")}

</div>

<div class="producto-ahorro">

10% OFF pagando por transferencia / efectivo

</div>

`;

}

const avisoPedido=
document.getElementById(
"detallePedidoAviso"
);

if(
productoPorPedido(producto)
){

avisoPedido.style.display=
"block";

avisoPedido.innerHTML=`
<strong>📦 Disponible por pedido · Entrega estimada: 10 días hábiles</strong>
<br><br>
💳 <strong>Tarjeta / Mercado Pago:</strong> se abona el total al realizar la compra.
<br>
🏦 <strong>Transferencia / efectivo:</strong> abonás 50% para confirmar el pedido y 50% cuando llega tu producto.
`;

}
else{

avisoPedido.style.display=
"none";

avisoPedido.innerHTML=
"";

}

const boton=
document.getElementById(
"detalleAgregar"
);

const disponible=
stockDisponible(producto);

boton.disabled=
!disponible;

boton.textContent=

disponible

?

"AGREGAR AL CARRITO"

:

"SIN STOCK";

document
.getElementById(
"modalProducto"
)
.classList
.add(
"activo"
);

document.body.style.overflow=
"hidden";

}

function cerrarProducto(){

document
.getElementById(
"modalProducto"
)
.classList
.remove(
"activo"
);

document.body.style.overflow=
"";

productoDetalleActual=
null;

cantidadDetalle=
1;

}

function cerrarProductoPorFondo(event){

if(
event.target.id===
"modalProducto"
){

cerrarProducto();

}

}

function cambiarCantidadDetalle(cambio){

cantidadDetalle=

Math.max(
1,
cantidadDetalle+
cambio
);

document
.getElementById(
"detalleCantidad"
)
.textContent=
cantidadDetalle;

}

function agregarDesdeDetalle(){

if(

!productoDetalleActual

||

!stockDisponible(
productoDetalleActual
)

){

return;

}

const nombre=
productoDetalleActual.perfume;

for(
let i=0;
i<cantidadDetalle;
i++
){

agregarAlCarrito(
nombre
);

}

cerrarProducto();

abrirCarrito();

}

/* =========================================================
ESCAPES
========================================================= */

function escapeHTML(text){

return String(text)

.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");

}

function escapeAttr(text){

return String(text)

.replace(/\\/g,"\\\\")
.replace(/'/g,"\\'")
.replace(/"/g,"&quot;");

}

/* =========================================================
MENÚ
========================================================= */

function abrirMenu(){

document
.getElementById(
"sideMenu"
)
.classList
.add(
"activo"
);

document
.getElementById(
"sideOverlay"
)
.classList
.add(
"activo"
);

document.body.style.overflow=
"hidden";

}

function cerrarMenu(){

document
.getElementById(
"sideMenu"
)
.classList
.remove(
"activo"
);

document
.getElementById(
"sideOverlay"
)
.classList
.remove(
"activo"
);

document.body.style.overflow=
"";

}

/* =========================================================
CHIPS
========================================================= */

function filtrarChip(tipo){

if(tipo==="mayorista"){

solicitarAccesoMayorista();
return;

}

if(
modoActual!=="particular"
){

cambiarModo(
"particular"
);

}

filtroRapido=tipo;

/*
Los chips rápidos pisan únicamente la disponibilidad.
La categoría elegida en FILTRAR se conserva.
*/
if(
tipo==="disponible" ||
tipo==="pedido"
){
filtroStockPopup="todos";
}

if(tipo==="todos"){
filtroStockPopup="todos";
}

document
.querySelectorAll(
".cat-chip"
)
.forEach(x=>

x.classList.toggle(

"activo",

x.dataset.chip===
tipo

)

);

const input=
document.getElementById(
"buscar"
);

const inputHeader=
document.getElementById(
"buscarHeader"
);

if(input){
input.value="";
}

if(inputHeader){
inputHeader.value="";
}

aplicarFiltrosCatalogo();

document
.getElementById(
"catalogo"
)
.scrollIntoView({

behavior:
"smooth"

});

}

/* =========================================================
SLIDER
========================================================= */

let slideActual=0;

let slideTimer=null;

function mostrarSlide(indice){

const slides=

document.querySelectorAll(
".hero-slide"
);

const dots=

document.querySelectorAll(
".hero-dot"
);

if(
!slides.length
){

return;

}

slideActual=

(
indice+
slides.length
)

%

slides.length;

slides.forEach(
(s,i)=>

s.classList.toggle(

"activo",

i===slideActual

)

);

dots.forEach(
(d,i)=>

d.classList.toggle(

"activo",

i===slideActual

)

);

clearInterval(
slideTimer
);

slideTimer=

setInterval(

()=>mostrarSlideSinReset(
slideActual+1
),

5200

);

}

function mostrarSlideSinReset(indice){

const slides=

document.querySelectorAll(
".hero-slide"
);

const dots=

document.querySelectorAll(
".hero-dot"
);

if(
!slides.length
){

return;

}

slideActual=

(
indice+
slides.length
)

%

slides.length;

slides.forEach(
(s,i)=>

s.classList.toggle(

"activo",

i===slideActual

)

);

dots.forEach(
(d,i)=>

d.classList.toggle(

"activo",

i===slideActual

)

);

}

slideTimer=

setInterval(

()=>mostrarSlideSinReset(
slideActual+1
),

5200

);

/* =========================================================
ANIMACIONES
========================================================= */

function activarAnimacionesCards(){

const cards=

document.querySelectorAll(
".card.reveal"
);

cards.forEach(
(card,index)=>{

setTimeout(
()=>{

card.classList.add(
"visible"
);

},
Math.min(
index*35,
400
)
);

});

}

/* =========================================================
RESULTADO DE PAGO AL VOLVER DE MERCADO PAGO
========================================================= */

function mostrarResultadoPago(){

const parametros=
new URLSearchParams(
window.location.search
);

const estado=
parametros.get(
"pago"
);

if(
!estado
){

return;

}

let mensaje="";

if(
estado==="aprobado"
){

mensaje=
"✅ Pago aprobado. ¡Gracias por tu compra en NERÓS!";

}
else if(
estado==="pendiente"
){

mensaje=
"⏳ Tu pago quedó pendiente. Mercado Pago te informará cuando se acredite.";

}
else if(
estado==="rechazado"
){

mensaje=
"❌ El pago no pudo completarse. Podés volver a intentarlo o finalizar por WhatsApp.";

}

if(
mensaje
){

setTimeout(
()=>alert(mensaje),
350
);

}

}

mostrarResultadoPago();

/* =========================================================
PARÁMETROS DE ENTRADA DESDE LA HOME
========================================================= */

function aplicarParametrosIniciales(){

const parametros=
new URLSearchParams(
window.location.search
);

const modo=
parametros.get(
"modo"
);

const filtro=
parametros.get(
"filtro"
);

const generoParametro=
normalizarGenero(
parametros.get(
"genero"
)
);

if(
["MASCULINO","FEMENINO","UNISEX"]
.includes(generoParametro)
){

filtroGenero=
generoParametro;

}

if(
modo==="mayorista"
){

solicitarAccesoMayorista();

}
else if(
filtro==="pedido"
){

filtrarChip(
"pedido"
);

}
else if(
filtro==="disponible"
){

filtrarChip(
"disponible"
);

}
else if(
["MASCULINO","FEMENINO","UNISEX"]
.includes(generoParametro)
){

sincronizarBotonesFiltro();
aplicarFiltrosCatalogo();

document
.getElementById("catalogo")
.scrollIntoView({
behavior:"smooth"
});

}

}

setTimeout(
aplicarParametrosIniciales,
700
);

/* =========================================================
ESC
========================================================= */

document.addEventListener(
"keydown",
e=>{

if(
e.key==="Escape"
){

cerrarMenu();

cerrarCarrito();

cerrarProducto();

cerrarAccesoMayorista();

cerrarFiltros();

}

}
);

/* =========================================================
PARALLAX FONDO CATÁLOGO
========================================================= */

let parallaxTicking=false;

function actualizarParallaxFondo(){

  if(parallaxTicking){
    return;
  }

  parallaxTicking=true;

  requestAnimationFrame(()=>{

    const y=window.scrollY || 0;

    /*
    Movimiento suave:
    el fondo se desplaza más lento que el contenido.
    */
    const desplazamiento=Math.min(y * 0.08, 120);

    document.documentElement.style.setProperty(
      "--parallax-y",
      desplazamiento + "px"
    );

    parallaxTicking=false;

  });

}

window.addEventListener(
  "scroll",
  actualizarParallaxFondo,
  {passive:true}
);

actualizarParallaxFondo();
