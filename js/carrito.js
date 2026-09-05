/* =========================================================
AGREGAR AL CARRITO
========================================================= */

function agregarAlCarrito(nombre){

const producto=
buscarProducto(nombre);

if(!producto){
return;
}

if(
!stockDisponible(producto)
){
return;
}

const existente=
carrito.find(
item=>
item.perfume===
producto.perfume
);

if(existente){

existente.cantidad+=1;

}
else{

carrito.push({

...producto,

cantidad:1

});

}

actualizarCarrito();

abrirCarrito();

}


/* =========================================================
CAMBIAR CANTIDAD
========================================================= */

function cambiarCantidad(
nombre,
cambio
){

const item=
carrito.find(
producto=>
producto.perfume===
nombre
);

if(!item){
return;
}

item.cantidad+=cambio;

if(
item.cantidad<=0
){

carrito=
carrito.filter(
producto=>
producto.perfume!==
nombre
);

}

actualizarCarrito();

}


/* =========================================================
TOTAL UNIDADES
========================================================= */

function totalUnidadesCarrito(){

return carrito.reduce(

(total,item)=>
total+
Number(
item.cantidad||0
),

0

);

}


/* =========================================================
ACTUALIZAR CARRITO
========================================================= */

function actualizarCarrito(){

const cantidad=
totalUnidadesCarrito();

const contador=
document.getElementById(
"cartCount"
);

if(contador){

contador.textContent=
cantidad;

contador.classList.toggle(
"visible",
cantidad>0
);

}

renderCarrito();

}


/* =========================================================
ABRIR CARRITO
========================================================= */

function abrirCarrito(){

document
.getElementById(
"carritoOverlay"
)
.classList
.add(
"activo"
);

document.body.style.overflow=
"hidden";

renderCarrito();

}


/* =========================================================
CERRAR CARRITO
========================================================= */

function cerrarCarrito(){

document
.getElementById(
"carritoOverlay"
)
.classList
.remove(
"activo"
);

document.body.style.overflow=
"";

}


/* =========================================================
CERRAR CARRITO POR FONDO
========================================================= */

function cerrarCarritoPorFondo(event){

if(
event.target &&
event.target.id===
"carritoOverlay"
){

cerrarCarrito();

}

}


/* =========================================================
RENDER CARRITO
========================================================= */

function renderCarrito(){

const contenedor=
document.getElementById(
"carritoItems"
);

const totalElement=
document.getElementById(
"carritoTotal"
);

const subtotalElement=
document.getElementById(
"carritoSubtotal"
);

const descuentoElement=
document.getElementById(
"carritoDescuento"
);

if(
!contenedor
){

return;

}


if(
!carrito.length
){

contenedor.innerHTML=`

<div class="carrito-vacio">

<div class="carrito-vacio-icon">
🛍️
</div>

<h3>
Tu carrito está vacío
</h3>

<p>
Agregá productos para comenzar tu compra.
</p>

</div>

`;

if(totalElement){

totalElement.textContent=
"$0";

}

if(subtotalElement){

subtotalElement.textContent=
"$0";

}

if(descuentoElement){

descuentoElement.textContent=
"$0";

}

return;

}


const unidades=
totalUnidadesCarrito();

let subtotal=0;

carrito.forEach(item=>{

const precio=

modoActual==="mayorista"

?

precioMayorista(
item,
unidades
)

:

precioParticular(
item
);

subtotal+=
precio*
item.cantidad;

});


let descuento=0;

let total=subtotal;


/* =========================================================
DESCUENTO PARTICULAR
========================================================= */

if(
modoActual==="particular" &&
formaPago==="transferencia"
){

descuento=
subtotal*0.10;

total=
subtotal-descuento;

}


/* =========================================================
RENDER ITEMS
========================================================= */

contenedor.innerHTML="";

carrito.forEach(item=>{

const precio=

modoActual==="mayorista"

?

precioMayorista(
item,
unidades
)

:

precioParticular(
item
);

const subtotalItem=
precio*
item.cantidad;

const itemHTML=
document.createElement(
"div"
);

itemHTML.className=
"carrito-item";

itemHTML.innerHTML=`

<div class="carrito-item-imagen">

${
item.foto

?

`
<img
src="${escapeAttr(item.foto)}"
alt="${escapeAttr(item.perfume)}"
loading="lazy"
onerror="this.style.display='none';"
>
`

:

`
<div class="carrito-sin-imagen">
NERÓS
</div>
`

}

</div>


<div class="carrito-item-info">

<div class="carrito-item-nombre">

${escapeHTML(
item.perfume
)}

</div>

<div class="carrito-item-precio">

$${Math.round(
precio
).toLocaleString(
"es-AR"
)}

</div>


<div class="carrito-item-cantidad">

<button
type="button"
onclick="
cambiarCantidad(
'${escapeAttr(item.perfume)}',
-1
)
">

−

</button>


<span>

${item.cantidad}

</span>


<button
type="button"
onclick="
cambiarCantidad(
'${escapeAttr(item.perfume)}',
1
)
">

+

</button>

</div>

</div>


<div class="carrito-item-subtotal">

$${Math.round(
subtotalItem
).toLocaleString(
"es-AR"
)}

</div>

`;

contenedor.appendChild(
itemHTML
);

});


/* =========================================================
TOTALES
========================================================= */

if(subtotalElement){

subtotalElement.textContent=
"$"+
Math.round(
subtotal
)
.toLocaleString(
"es-AR"
);

}

if(descuentoElement){

descuentoElement.textContent=
descuento>0

?

"-$"+
Math.round(
descuento
)
.toLocaleString(
"es-AR"
)

:

"$0";

}

if(totalElement){

totalElement.textContent=
"$"+
Math.round(
total
)
.toLocaleString(
"es-AR"
);

}


/* =========================================================
MAYORISTA — NIVELES
========================================================= */

const mayoristaInfo=
document.getElementById(
"carritoMayoristaInfo"
);

if(
mayoristaInfo
){

if(
modoActual==="mayorista"
){

let nivel="10+";

if(unidades>=30){
nivel="30+";
}
else if(unidades>=20){
nivel="20+";
}

mayoristaInfo.innerHTML=`

<div class="carrito-mayorista-info">

<span>
MAYORISTA
</span>

<strong>
${unidades} unidades
</strong>

<small>
Precio aplicado: nivel ${nivel}
</small>

</div>

`;

}
else{

mayoristaInfo.innerHTML="";

}

}


/* =========================================================
FINALIZAR COMPRA
========================================================= */

function finalizarCompra(){

if(
!carrito.length
){

alert(
"Tu carrito está vacío."
);

return;

}


if(
modoActual==="mayorista"
){

if(
totalUnidadesCarrito()<
MINIMO_MAYORISTA
){

alert(
`El pedido mayorista mínimo es de ${MINIMO_MAYORISTA} unidades.`
);

return;

}

}


if(
formaPago==="debito" ||
formaPago==="credito"
){

pagarConMercadoPago();

return;

}


/* =========================================================
WHATSAPP
========================================================= */

enviarPedidoWhatsApp();

}


/* =========================================================
PAGAR CON MERCADO PAGO
========================================================= */

async function pagarConMercadoPago(){

if(
!carrito.length
){

alert(
"Tu carrito está vacío."
);

return;

}

const unidades=
totalUnidadesCarrito();

if(
modoActual==="mayorista" &&
unidades<MINIMO_MAYORISTA
){

alert(
`El pedido mayorista mínimo es de ${MINIMO_MAYORISTA} unidades.`
);

return;

}


const items=
carrito.map(item=>{

const precio=

modoActual==="mayorista"

?

precioMayorista(
item,
unidades
)

:

precioParticular(
item
);

return{

title:
item.perfume,

quantity:
Number(
item.cantidad
),

unit_price:
Math.round(precio)

};

});


const boton=
document.getElementById(
"btnMercadoPago"
);

if(boton){

boton.disabled=true;

boton.textContent=
"PROCESANDO...";

}


try{

const respuesta=
await fetch(
API,
{

method:"POST",

headers:{
"Content-Type":
"text/plain;charset=utf-8"
},

body:
JSON.stringify({

accion:
"crear_preferencia",

items:
items,

modo:
modoActual,

formaPago:
formaPago,

unidades:
unidades

})

}
);


if(
!respuesta.ok
){

throw new Error(
"HTTP "+
respuesta.status
);

}


const data=
await respuesta.json();


if(
data.init_point
){

window.location.href=
data.init_point;

return;

}


if(
data.url
){

window.location.href=
data.url;

return;

}


throw new Error(
"No se recibió una URL de Mercado Pago."
);


}
catch(error){

console.error(
"Error Mercado Pago:",
error
);

alert(
"No pudimos iniciar el pago con Mercado Pago. Probá nuevamente o finalizá tu compra por WhatsApp."
);

if(boton){

boton.disabled=false;

boton.textContent=
"PAGAR CON MERCADO PAGO";

}

}

}


/* =========================================================
WHATSAPP
========================================================= */

function generarMensajePedido(){

const unidades=
totalUnidadesCarrito();

let mensaje=
"Hola NERÓS 👋\n\n";

if(
modoActual==="mayorista"
){

mensaje+=
"Quiero realizar un pedido MAYORISTA.\n\n";

}
else{

mensaje+=
"Quiero realizar una compra.\n\n";

}

mensaje+=
"Productos:\n";


carrito.forEach(item=>{

const precio=

modoActual==="mayorista"

?

precioMayorista(
item,
unidades
)

:

precioParticular(
item
);

const subtotal=
precio*
item.cantidad;

mensaje+=
`• ${item.perfume} x${item.cantidad} — $${Math.round(subtotal).toLocaleString("es-AR")}\n`;

});


let subtotal=0;

carrito.forEach(item=>{

const precio=

modoActual==="mayorista"

?

precioMayorista(
item,
unidades
)

:

precioParticular(
item
);

subtotal+=
precio*
item.cantidad;

});


let descuento=0;

if(
modoActual==="particular" &&
formaPago==="transferencia"
){

descuento=
subtotal*0.10;

}


const total=
subtotal-
descuento;


mensaje+=
"\n";

mensaje+=
`Subtotal: $${Math.round(subtotal).toLocaleString("es-AR")}\n`;


if(
descuento>0
){

mensaje+=
`10% OFF transferencia / efectivo: -$${Math.round(descuento).toLocaleString("es-AR")}\n`;

}


mensaje+=
`TOTAL: $${Math.round(total).toLocaleString("es-AR")}\n\n`;


if(
modoActual==="mayorista"
){

mensaje+=
`Cantidad total: ${unidades} unidades\n\n`;

}


mensaje+=
"Quedo atento para coordinar la compra. 👍";


return mensaje;

}


function enviarPedidoWhatsApp(){

const mensaje=
generarMensajePedido();


window.open(

"https://wa.me/"+
WHATSAPP+
"?text="+
encodeURIComponent(
mensaje
),

"_blank"

);

}


/* =========================================================
INICIALIZAR CARRITO
========================================================= */

actualizarCarrito();
