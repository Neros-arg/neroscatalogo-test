/* =========================================================
AGREGAR AL CARRITO
========================================================= */

function agregarAlCarrito(nombre){

const producto=
buscarProducto(nombre);

if(
!producto
){

return;

}

const existente=

carrito.find(

item=>

item.perfume===
nombre

);

if(
existente
){

existente.cantidad++;

}

else{

carrito.push({

...producto,

cantidad:1

});

}

actualizarCarrito();

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

if(
!item
){

return;

}

item.cantidad+=
cambio;

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

renderCarrito();

}
/* =========================================================
TOTAL UNIDADES
========================================================= */

function totalUnidades(){

return carrito.reduce(

(total,item)=>

total +
item.cantidad,

0

);

}
/* =========================================================
ACTUALIZAR CARRITO
========================================================= */

function actualizarCarrito(){

const total=totalUnidades();
const barra=document.getElementById("carritoBarra");
const info=document.getElementById("carritoInfo");

barra.classList.toggle("activo",total>0);

let totalVista=0;
if(total>0){
carrito.forEach(item=>{
const precio=obtenerPrecioItem(item,total);
totalVista+=precio*item.cantidad;
});
}

info.innerHTML=`
<div class="carrito-mini-icon">🛒</div>
<div class="carrito-mini-copy">
<strong>${total} ${total===1 ? "unidad" : "unidades"} en tu pedido</strong>
<span>${total>0 ? `Total actual · <b>$${Math.round(totalVista).toLocaleString("es-AR")}</b>` : "Tu carrito está vacío"}</span>
</div>
`;

}
/* =========================================================
ABRIR CARRITO
========================================================= */

function abrirCarrito(){

document
.getElementById(
"modalCarrito"
)
.classList
.add(
"activo"
);

document.body.style.overflow=
"hidden";

document
.getElementById(
"pagoSelector"
)
.classList
.toggle(
"activo",
modoActual==="particular"
);

document
.getElementById(
"pagoAyuda"
)
.style.display=

modoActual==="particular"

?

"block"

:

"none";

document
.getElementById(
"tituloCarrito"
)
.innerHTML=

modoActual==="mayorista"

?

"📦 Pedido mayorista"

:

"🛒 Tu pedido";

renderCarrito();

}
/* =========================================================
CERRAR CARRITO
========================================================= */

function cerrarCarrito(){

document
.getElementById(
"modalCarrito"
)
.classList
.remove(
"activo"
);

document.body.style.overflow="";

}
/* =========================================================
RENDER CARRITO
========================================================= */

function renderCarrito(){

const lista=
document.getElementById(
"listaCarrito"
);

const resumen=
document.getElementById(
"resumenCarrito"
);

const boton=
document.getElementById(
"btnFinalizar"
);

if(
carrito.length===0
){

lista.innerHTML=`

<div style="
padding:30px;
text-align:center;
color:#888;
">

Tu pedido está vacío.

</div>

`;

resumen.innerHTML="";

boton.disabled=true;

return;

}

const total=
totalUnidades();

let totalPedido=0;
let totalLista=0;

lista.innerHTML="";

carrito.forEach(item=>{

const precio=
obtenerPrecioItem(
item,
total
);

const subtotal=
precio *
item.cantidad;

totalPedido+=
subtotal;

// Total de lista sin descuento para mostrar el ahorro real
if(
modoActual==="particular"
){
totalLista+=
precioParticular(item) *
item.cantidad;
}

lista.innerHTML+=`

<div class="item-carrito">

<div class="item-foto">
${(item.foto || item.imagen)
? `<img src="${escapeAttr(item.foto || item.imagen)}" alt="${escapeAttr(item.perfume)}">`
: `<div class="item-foto-placeholder">🧴</div>`}
</div>

<div class="item-main">

<div class="item-nombre">
${escapeHTML(item.perfume)}
</div>

<div class="item-precio">
$${Math.round(precio).toLocaleString("es-AR")} por unidad
</div>

<div class="item-subtotal">
Subtotal · $${Math.round(subtotal).toLocaleString("es-AR")}
</div>

</div>

<div class="item-controles">

<button
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

`;

});

let mensajeExtra="";

if(
modoActual==="mayorista"
){

if(
total<10
){

mensajeExtra=`

<div class="proximo-nivel">

⚠️ Te faltan

<strong>
${10-total}
</strong>

unidades para alcanzar
el mínimo mayorista.

</div>

`;

}

else if(
total<20
){

mensajeExtra=`

<div class="proximo-nivel">

📦 Precio mayorista

<strong>
10+
</strong>

activado.

<br>

Te faltan

<strong>
${20-total}
</strong>

unidades para precio 20+.

</div>

`;

}

else if(
total<30
){

mensajeExtra=`

<div class="proximo-nivel">

🔥 Precio mayorista

<strong>
20+
</strong>

activado.

<br>

Te faltan

<strong>
${30-total}
</strong>

unidades para precio 30+.

</div>

`;

}

else{

mensajeExtra=`

<div class="proximo-nivel">

🔥

<strong>
Mejor precio mayorista desbloqueado.
</strong>

<br>

Nivel 30+ unidades.

</div>

`;

}

}

else{

mensajeExtra=`

${

formaPago==="transferencia"

?

""

:

`

<div class="proximo-nivel">

${

formaPago==="debito"

?

"💳 Débito seleccionado · pedido calculado a precio de lista."

:

"📱 Crédito / Mercado Pago seleccionado · pedido calculado a precio de lista."

}

</div>

`

}

`;

}

const contienePedido=
carrito.some(
item=>productoPorPedido(item)
);

if(
modoActual!=="mayorista"
&&
contienePedido
){

mensajeExtra+=`
<div class="pedido-carrito-aviso">
<strong>📦 Tu carrito incluye productos por pedido.</strong>
<br>Entrega estimada: 10 días hábiles.
<br><br>
${
formaPago==="credito"
?
"💳 Tarjeta / Mercado Pago: abonás el total al realizar la compra."
:
"🏦 Transferencia / efectivo: abonás 50% para confirmar el pedido y 50% cuando llega."
}
</div>
`;

}

const ahorroTransferencia=

modoActual==="particular" &&
formaPago==="transferencia"

?

Math.max(
0,
totalLista-totalPedido
)

:

0;


const bloqueBeneficioTransferencia=

modoActual==="particular" &&
formaPago==="transferencia"

?

`

<div class="resumen-precio-lista">

  <span>
    Total de lista
  </span>

  <strong>
    $${Math.round(totalLista).toLocaleString("es-AR")}
  </strong>

</div>

<div class="beneficio-transferencia">

  <div class="beneficio-transferencia-top">

    <div class="beneficio-transferencia-kicker">
      💸 BENEFICIO NERÓS
    </div>

    <div class="beneficio-transferencia-badge">
      10% OFF
    </div>

  </div>

  <div class="beneficio-transferencia-ahorro">

    <span>
      Ahorrás pagando por<br>
      transferencia / efectivo
    </span>

    <strong>
      - $${Math.round(ahorroTransferencia).toLocaleString("es-AR")}
    </strong>

  </div>

  <div class="beneficio-transferencia-copy">
    El descuento ya está aplicado en el total final de tu pedido.
  </div>

</div>

`

:

"";


resumen.classList.toggle(
"transferencia-activa",
modoActual==="particular" &&
formaPago==="transferencia"
);


resumen.innerHTML=`

<div class="resumen-linea">

<span>
Unidades
</span>

<strong>
${total}
</strong>

</div>

${bloqueBeneficioTransferencia}

<div class="resumen-total ${modoActual==="particular" && formaPago==="transferencia" ? "transferencia" : ""}">

<span>

  ${
  modoActual==="particular" &&
  formaPago==="transferencia"

  ?

  `
  <span class="resumen-total-label-principal">
    TOTAL FINAL
  </span>

  <span class="resumen-total-label-secundario">
    CON 10% OFF APLICADO
  </span>
  `

  :

  "TOTAL"
  }

</span>

<span>

$${Math.round(totalPedido)
.toLocaleString("es-AR")}

</span>

</div>

${mensajeExtra}

`;

if(
modoActual==="particular"
){

boton.classList.remove(
"mercadopago",
"cargando"
);

if(
formaPago==="credito"
){

boton.classList.add(
"mercadopago"
);

boton.innerHTML=
"💳 PAGAR AHORA CON MERCADO PAGO";

}
else{

boton.innerHTML=
`<img src="wsplogo.png" alt="WhatsApp" class="wa-inline"> FINALIZAR COMPRA POR WHATSAPP`;

}

}

else{

boton.classList.remove(
"mercadopago",
"cargando"
);

boton.innerHTML=
`<img src="wsplogo.png" alt="WhatsApp" class="wa-inline"> ENVIAR PEDIDO MAYORISTA POR WHATSAPP`;

}

boton.disabled=

modoActual==="mayorista"

&&

total<
MINIMO_MAYORISTA;

}
/* =========================================================
FINALIZAR COMPRA
========================================================= */

function finalizarCompra(){

if(
carrito.length===0
){

return;

}

if(
modoActual==="particular" &&
formaPago==="credito"
){

pagarMercadoPago();

return;

}

enviarPedidoWhatsApp();

}
/* =========================================================
PAGAR CON MERCADO PAGO
========================================================= */

async function pagarMercadoPago(){

if(
modoActual!=="particular"
){

alert(
"El pago online está disponible para compras particulares."
);

return;

}

if(
carrito.length===0
){

return;

}

const boton=
document.getElementById(
"btnFinalizar"
);

const textoOriginal=
boton.innerHTML;

try{

boton.disabled=true;

boton.classList.add(
"cargando"
);

boton.innerHTML=
"⏳ GENERANDO CHECKOUT...";

const items=
carrito.map(item=>({

perfume:
item.perfume,

cantidad:
item.cantidad

}));

const respuesta=
await fetch(
API,
{

method:
"POST",

headers:{
"Content-Type":
"text/plain;charset=utf-8"
},

body:
JSON.stringify({

accion:
"crearPago",

items:
items

})

}
);

if(
!respuesta.ok
){

throw new Error(
"Error HTTP "+
respuesta.status
);

}

const datos=
await respuesta.json();

if(
datos.error
){

throw new Error(
datos.mensaje ||
"No se pudo crear el pago."
);

}

if(
!datos.checkoutUrl
){

throw new Error(
"Mercado Pago no devolvió una URL de pago."
);

}

window.location.href=
datos.checkoutUrl;

}
catch(error){

console.error(
"Error Mercado Pago:",
error
);

alert(
"No pudimos abrir Mercado Pago.\n\n"+
error.message+
"\n\nPodés intentar nuevamente o finalizar por WhatsApp."
);

boton.disabled=false;

boton.classList.remove(
"cargando"
);

boton.innerHTML=
textoOriginal;

}

}
/* =========================================================
WHATSAPP
========================================================= */

function enviarPedidoWhatsApp(){

if(
!carrito.length
){
alert("Tu carrito está vacío.");
return;
}

let totalPedido=0;

const lineas=
carrito.map(item=>{

const precio=
obtenerPrecioItem(item,totalUnidades());

const subtotal=
precio *
item.cantidad;

totalPedido+=
subtotal;

return `• ${item.perfume} x${item.cantidad} — $${Math.round(subtotal).toLocaleString("es-AR")}`;

});

const incluyePedido=
carrito.some(item=>
productoPorPedido(item)
);

let medioPago="";

if(
modoActual==="mayorista"
){
medioPago=
"Mayorista · Transferencia / Efectivo";
}
else if(
formaPago==="transferencia"
){
medioPago=
"Transferencia / Efectivo — 10% OFF aplicado";
}
else if(
formaPago==="debito"
){
medioPago=
"Débito — precio de lista";
}
else{
medioPago=
"Crédito / Mercado Pago — precio de lista";
}

let mensaje=
`Hola NERÓS 👋 Quiero finalizar mi compra.

🛒 Pedido:
${lineas.join("\n")}

💳 ${medioPago}
💰 Total: $${Math.round(totalPedido).toLocaleString("es-AR")}`;

if(
incluyePedido
){
mensaje+=`

📦 El pedido incluye productos por pedido.
Entrega estimada: 10 días hábiles.`;

if(
modoActual==="particular" &&
formaPago==="transferencia"
){
mensaje+=`
Reserva: 50% ahora + 50% cuando llega.`;
}
}

mensaje+=`

Quiero confirmar disponibilidad y coordinar entrega o envío. Gracias.`;

const telefono=
"5493417830300";

const url=
"https://wa.me/" +
telefono +
"?text=" +
encodeURIComponent(mensaje);

window.open(
url,
"_blank"
);

}
