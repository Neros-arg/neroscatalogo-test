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

productosFiltrados=[
...data
];

/*
Esperamos a que todos los archivos JS hayan terminado
de ejecutarse antes de aplicar filtros/renderizar.
*/
setTimeout(()=>{

if(typeof aplicarFiltrosCatalogo==="function"){

aplicarFiltrosCatalogo();

}else{

mostrarPagina();

}

},0);

})

.catch(error=>{

console.error(
"NERÓS - Error cargando API:",
error
);

const contenedor=
document.getElementById("productos");

if(contenedor){

contenedor.innerHTML=`

<div style="
grid-column:1/-1;
text-align:center;
padding:50px;
color:#ff5a5a;
">

No se pudieron cargar los productos.

</div>

`;

}

});


/* =========================================================
ACCESO MAYORISTA
========================================================= */

function abrirAccesoMayorista(accion){

accionMayoristaPendiente=
typeof accion==="function"
? accion
: null;

const modal=
document.getElementById("modalMayorista");

const input=
document.getElementById("claveMayorista");

const error=
document.getElementById("errorMayorista");

if(error){

error.textContent="";

}

if(input){

input.value="";

}

if(modal){

modal.classList.add("activo");

document.body.style.overflow="hidden";

setTimeout(()=>{

if(input){

input.focus();

}

},100);

}

}


function cerrarAccesoMayorista(){

const modal=
document.getElementById("modalMayorista");

if(modal){

modal.classList.remove("activo");

}

document.body.style.overflow="";


}


function validarClaveMayorista(){

const input=
document.getElementById("claveMayorista");

const error=
document.getElementById("errorMayorista");

const clave=
input
? input.value.trim()
: "";

if(clave===CLAVE_MAYORISTA){

accesoMayoristaAutorizado=true;

sessionStorage.setItem(
"nerosMayoristaOK",
"1"
);

cerrarAccesoMayorista();

if(typeof mostrarPopupMayorista==="function"){

mostrarPopupMayorista();

}

if(
typeof accionMayoristaPendiente==="function"
){

const accion=
accionMayoristaPendiente;

accionMayoristaPendiente=null;

accion();

}

return;

}

if(error){

error.textContent=
"Clave incorrecta.";

}

if(input){

input.select();

}

}


function activarMayoristaAutorizado(){

accesoMayoristaAutorizado=true;

sessionStorage.setItem(
"nerosMayoristaOK",
"1"
);

modoActual="mayorista";

document
.getElementById("modoParticular")
?.classList
.remove("activo");

document
.getElementById("modoMayorista")
?.classList
.add("activo");

paginaActual=1;

if(typeof aplicarFiltrosCatalogo==="function"){

aplicarFiltrosCatalogo();

}else{

productosFiltrados=[
...perfumes
];

mostrarPagina();

}

}


function mostrarPopupMayorista(){

const popup=
document.getElementById("popupMayorista");

if(!popup){

return;

}

popup.classList.add("activo");

setTimeout(()=>{

popup.classList.remove("activo");

},4000);

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

if(modo==="particular"){

filtroTester="todos";

}

document
.getElementById("modoParticular")
?.classList
.toggle(
"activo",
modo==="particular"
);

document
.getElementById("modoMayorista")
?.classList
.toggle(
"activo",
modo==="mayorista"
);

paginaActual=1;

if(typeof aplicarFiltrosCatalogo==="function"){

aplicarFiltrosCatalogo();

}else{

productosFiltrados=[
...perfumes
];

mostrarPagina();

}

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

if(typeof aplicarFiltrosCatalogo==="function"){

aplicarFiltrosCatalogo();

}

}

const campoBuscar=
document.getElementById("buscar");

if(campoBuscar){

campoBuscar.addEventListener(
"input",
filtrarProductos
);

}


/* =========================================================
MOSTRAR PRODUCTOS
========================================================= */

function mostrarPagina(){

const contenedor=
document.getElementById("productos");

if(!contenedor){

return;

}

const inicio=
(paginaActual-1)*
PRODUCTOS_POR_PAGINA;

const fin=
inicio+
PRODUCTOS_POR_PAGINA;

const productos=
productosFiltrados.slice(
inicio,
fin
);

contenedor.innerHTML="";

if(productos.length===0){

contenedor.innerHTML=`

<div style="
grid-column:1/-1;
text-align:center;
padding:60px 20px;
">

<div style="
font-size:40px;
margin-bottom:15px;
">
⌕
</div>

<div style="
font-size:18px;
font-weight:600;
">
No encontramos productos
</div>

<div style="
opacity:.65;
margin-top:8px;
">
Probá modificando los filtros o la búsqueda.
</div>

</div>

`;

renderPaginacion();

return;

}


productos.forEach(producto=>{

const nombre=
String(
producto.perfume||
"Perfume NERÓS"
);

const foto=
String(
producto.foto||
""
);

const precio=
precioFinal(producto);

const stock=
productoPorPedido(producto)
?
"Disponible por pedido"
:
"Stock inmediato";

const tester=
esTester(producto);

const card=
document.createElement("article");

card.className="producto";

if(tester){

card.classList.add("es-tester");

}

const imagen=
document.createElement("img");

imagen.src=
foto;

imagen.alt=
nombre;

imagen.loading="lazy";

imagen.onerror=function(){

this.style.opacity="0.25";

};

card.appendChild(imagen);


const contenido=
document.createElement("div");

contenido.className=
"producto-info";


const titulo=
document.createElement("h3");

titulo.textContent=
nombre;

contenido.appendChild(titulo);


if(tester){

const badgeTester=
document.createElement("span");

badgeTester.className=
"badge-tester";

badgeTester.textContent=
"TESTER";

contenido.appendChild(
badgeTester
);

}


const badgeStock=
document.createElement("span");

badgeStock.className=
productoPorPedido(producto)
?
"stock pedido"
:
"stock disponible";

badgeStock.textContent=
stock;

contenido.appendChild(
badgeStock
);


const precioBox=
document.createElement("div");

precioBox.className=
"precio-box";


if(modoActual==="mayorista"){

const precio10=
precioMayorista(producto,10);

const precio20=
precioMayorista(producto,20);

const precio30=
precioMayorista(producto,30);

precioBox.innerHTML=`

<div class="precio-mayorista-principal">
${formatearPrecio(precio10)}
</div>

<div class="precio-mayorista-info">

10+ un.
<strong>
${formatearPrecio(precio10)}
</strong>

·

20+
<strong>
${formatearPrecio(precio20)}
</strong>

·

30+
<strong>
${formatearPrecio(precio30)}
</strong>

</div>

`;

}else{

const precioLista=
numeroSeguro(
producto.precio
);

const precioTransferencia=
Math.round(
precioLista*0.90
);

precioBox.innerHTML=`

<div class="precio-lista">
${formatearPrecio(precioLista)}
</div>

<div class="precio-cuotas">
2 cuotas sin interés
</div>

<div class="precio-transferencia">
${formatearPrecio(precioTransferencia)}
<br>
<small>
10% OFF transferencia / efectivo
</small>
</div>

`;

}

contenido.appendChild(
precioBox
);


const acciones=
document.createElement("div");

acciones.className=
"producto-acciones";


const detalles=
document.createElement("button");

detalles.type="button";

detalles.className=
"btn-detalles";

detalles.textContent=
"VER DETALLES";

detalles.onclick=function(){

abrirFichaProducto(nombre);

};

acciones.appendChild(
detalles
);


const agregar=
document.createElement("button");

agregar.type="button";

agregar.className=
"btn-agregar";

agregar.textContent=
"+ CARRITO";

agregar.onclick=function(){

agregarAlCarrito(nombre);

};


if(
productoPorPedido(producto)===false &&
!tieneStockDisponible(producto)
){

agregar.disabled=true;

agregar.textContent=
"SIN STOCK";

}

acciones.appendChild(
agregar
);

contenido.appendChild(
acciones
);

card.appendChild(
contenido
);

contenedor.appendChild(
card
);

});

renderPaginacion();

}


function tieneStockDisponible(producto){

const stock=
String(
producto.stock||
""
)
.toLowerCase()
.trim();

if(
stock.includes("stock inmediato")
){

return true;

}

if(
stock.includes("disponible por pedido")
){

return true;

}

if(
stock.includes("sin stock")
){

return false;

}

return true;

}


/* =========================================================
PAGINACIÓN
========================================================= */

function renderPaginacion(){

const contenedor=
document.getElementById(
"paginacion"
);

if(!contenedor){

return;

}

const total=
Math.ceil(
productosFiltrados.length/
PRODUCTOS_POR_PAGINA
);

contenedor.innerHTML="";

if(total<=1){

return;

}


const anterior=
document.createElement("button");

anterior.type="button";

anterior.textContent="‹";

anterior.disabled=
paginaActual<=1;

anterior.onclick=function(){

if(paginaActual>1){

paginaActual--;

mostrarPagina();

window.scrollTo({
top:0,
behavior:"smooth"
});

}

};

contenedor.appendChild(
anterior
);


let inicio=
Math.max(
1,
paginaActual-2
);

let fin=
Math.min(
total,
paginaActual+2
);


if(paginaActual<=3){

inicio=1;

fin=Math.min(
total,
5
);

}

if(paginaActual>=total-2){

inicio=Math.max(
1,
total-4
);

fin=total;

}


for(
let pagina=inicio;
pagina<=fin;
pagina++
){

const boton=
document.createElement("button");

boton.type="button";

boton.textContent=
pagina;

boton.className=
pagina===paginaActual
?
"activo"
:
"";

boton.onclick=function(){

paginaActual=
pagina;

mostrarPagina();

window.scrollTo({
top:0,
behavior:"smooth"
});

};

contenedor.appendChild(
boton
);

}


const siguiente=
document.createElement("button");

siguiente.type="button";

siguiente.textContent="›";

siguiente.disabled=
paginaActual>=total;

siguiente.onclick=function(){

if(
paginaActual<total
){

paginaActual++;

mostrarPagina();

window.scrollTo({
top:0,
behavior:"smooth"
});

}

};

contenedor.appendChild(
siguiente
);

}


/* =========================================================
BUSCAR PRODUCTO
========================================================= */

function buscarProducto(nombre){

return perfumes.find(
producto=>
String(
producto.perfume||
""
)
.trim()
.toLowerCase()===
String(
nombre||
""
)
.trim()
.toLowerCase()
);

}


/* =========================================================
NOTAS OLFATIVAS — FORMATO VISUAL
========================================================= */

function formatearNotasOlfativas(texto){

if(!texto){

return "";

}

const partes=
String(texto)
.split(/[,;|]+/)
.map(x=>x.trim())
.filter(Boolean);

if(!partes.length){

return "";

}

return partes
.map(
nota=>
`<span class="nota-chip">${escapeHTML(nota)}</span>`
)
.join("");

}


/* =========================================================
FICHA DINÁMICA
========================================================= */

function abrirFichaProducto(nombre){

const producto=
buscarProducto(nombre);

if(!producto){

return;

}

const modal=
document.getElementById(
"modalProducto"
);

if(!modal){

return;

}

const imagen=
document.getElementById(
"modalProductoImagen"
);

const titulo=
document.getElementById(
"modalProductoTitulo"
);

const descripcion=
document.getElementById(
"modalProductoDescripcion"
);

const notas=
document.getElementById(
"modalProductoNotas"
);

const precio=
document.getElementById(
"modalProductoPrecio"
);

const stock=
document.getElementById(
"modalProductoStock"
);

if(imagen){

imagen.src=
producto.foto||
"";

imagen.alt=
producto.perfume||
"Perfume NERÓS";

}

if(titulo){

titulo.textContent=
producto.perfume||
"";

}

if(descripcion){

descripcion.innerHTML=
escapeHTML(
descripcionProducto(producto)
);

}

if(notas){

notas.innerHTML=
formatearNotasOlfativas(
notasProducto(producto)
);

}

if(precio){

precio.innerHTML=
formatearPrecio(
precioFinal(producto)
);

}

if(stock){

stock.textContent=
productoPorPedido(producto)
?
"Disponible por pedido"
:
"Stock inmediato";

}

modal.classList.add(
"activo"
);

document.body.style.overflow=
"hidden";

}


function cerrarFichaProducto(){

const modal=
document.getElementById(
"modalProducto"
);

if(modal){

modal.classList.remove(
"activo"
);

}

document.body.style.overflow="";

}


/* =========================================================
ESCAPES
========================================================= */

function escapeHTML(valor){

return String(valor??"")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");

}


function escapeAttr(valor){

return escapeHTML(valor);

}


/* =========================================================
MENÚ
========================================================= */

function toggleMenu(){

const menu=
document.getElementById(
"menuMobile"
);

if(menu){

menu.classList.toggle(
"activo"
);

}

}


/* =========================================================
CHIPS
========================================================= */

function activarChip(chip){

const todos=
document.querySelectorAll(
".chip"
);

todos.forEach(
elemento=>
elemento.classList.remove(
"activo"
)
);

if(chip){

chip.classList.add(
"activo"
);

}

}


document
.querySelectorAll(
"[data-chip]"
)
.forEach(chip=>{

chip.addEventListener(
"click",
function(){

const valor=
this.dataset.chip;

if(
valor==="todos"
){

filtroRapido=
"todos";

}

if(
valor==="disponible"
){

filtroRapido=
"disponible";

}

if(
valor==="pedido"
){

filtroRapido=
"pedido";

}

if(
valor==="mayorista"
){

if(
!accesoMayoristaAutorizado
){

abrirAccesoMayorista(
()=>{
cambiarModo("mayorista");
}
);

return;

}

cambiarModo("mayorista");

return;

}

activarChip(this);

paginaActual=1;

if(
typeof aplicarFiltrosCatalogo==="function"
){

aplicarFiltrosCatalogo();

}

});

});


/* =========================================================
SLIDER
========================================================= */

function actualizarSliderDesdeCodigo(){

if(
typeof calcularPrecioMaximoCatalogo===
"function"
){

calcularPrecioMaximoCatalogo();

}

if(
typeof actualizarFiltroPrecioUI===
"function"
){

actualizarFiltroPrecioUI();

}

}


/* =========================================================
ANIMACIONES
========================================================= */

document.addEventListener(
"DOMContentLoaded",
function(){

document
.querySelectorAll(
".producto"
)
.forEach((elemento,index)=>{

elemento.style.animationDelay=
(index*0.03)+"s";

});

}
);


/* =========================================================
RESULTADO DE PAGO AL VOLVER DE MERCADO PAGO
========================================================= */

function revisarResultadoPago(){

const parametros=
new URLSearchParams(
window.location.search
);

const estado=
parametros.get("status");

if(!estado){

return;

}

if(
estado==="approved"
){

alert(
"¡Pago aprobado! Gracias por tu compra en NERÓS."
);

}

if(
estado==="pending"
){

alert(
"El pago quedó pendiente. Te contactaremos para confirmar el pedido."
);

}

if(
estado==="rejected"
){

alert(
"El pago no pudo completarse."
);

}

}


/* =========================================================
PARÁMETROS DE ENTRADA DESDE LA HOME
========================================================= */

function procesarParametrosEntrada(){

const parametros=
new URLSearchParams(
window.location.search
);

const seccion=
parametros.get("seccion");

const tipo=
parametros.get("tipo");

if(
tipo &&
typeof filtroTipo!=="undefined"
){

filtroTipo=
tipo;

}

if(
seccion==="mayorista"
){

if(
accesoMayoristaAutorizado
){

cambiarModo(
"mayorista"
);

}else{

abrirAccesoMayorista(
()=>{
cambiarModo("mayorista")
}
);

}

}

}


/* =========================================================
ESC
========================================================= */

document.addEventListener(
"keydown",
function(event){

if(
event.key!=="Escape"
){

return;

}

cerrarFichaProducto();

cerrarCarrito();

const modalFiltro=
document.getElementById(
"modalFiltros"
);

if(modalFiltro){

modalFiltro.classList.remove(
"activo"
);

}

cerrarAccesoMayorista();

}
);


/* =========================================================
PARALLAX FONDO CATÁLOGO
========================================================= */

window.addEventListener(
"scroll",
function(){

const scroll=
window.scrollY;

const fondo=
document.querySelector(
".catalogo-page"
);

if(!fondo){

return;

}

fondo.style.backgroundPosition=
"center "+
(scroll*0.12)+
"px";

},
{
passive:true
}
);


/* =========================================================
INICIALIZACIÓN
========================================================= */

window.addEventListener(
"DOMContentLoaded",
function(){

revisarResultadoPago();

procesarParametrosEntrada();

});
