/* =========================================================
MOTOR DE FILTROS
========================================================= */

function esTester(producto){

return String(
producto.tester ||
"NO"
)
.trim()
.toUpperCase()==="SI";

}

function normalizarTipoProducto(valor){

return String(valor || "")
.trim()
.toUpperCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.replace(/\s+/g," ");

}

function normalizarGenero(valor){

const genero=
String(valor || "")
.trim()
.toUpperCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.replace(/\s+/g," ");

const equivalencias={
MASCULINO:"MASCULINO",
HOMBRE:"MASCULINO",
H:"MASCULINO",
MALE:"MASCULINO",
FEMENINO:"FEMENINO",
MUJER:"FEMENINO",
F:"FEMENINO",
FEMALE:"FEMENINO",
UNISEX:"UNISEX",
UNISEXUAL:"UNISEX"
};

return equivalencias[genero] || genero;

}

function valorCampoProducto(producto,nombres){

for(const nombre of nombres){

if(
Object.prototype.hasOwnProperty.call(producto,nombre) &&
producto[nombre]!==null &&
producto[nombre]!==undefined
){

const valor=String(producto[nombre]).trim();

if(valor){
return valor;
}

}

}

return "";

}

function generoProducto(producto){

return normalizarGenero(
valorCampoProducto(
producto,
["genero","género","Genero","Género","GENERO","GÉNERO"]
)
);

}

function notasProducto(producto){

return valorCampoProducto(
producto,
[
"notasOlfativas",
"notas_olfativas",
"notas olfativas",
"Notas olfativas",
"NOTAS OLFATIVAS",
"notas"
]
);

}

function descripcionProducto(producto){

return valorCampoProducto(
producto,
[
"descripcion",
"descripción",
"Descripcion",
"Descripción",
"DESCRIPCION",
"DESCRIPCIÓN"
]
);

}


function precioProductoParaFiltro(producto){

if(modoActual==="mayorista"){

const mayorista10=
precioMayorista(producto,10);

return mayorista10>0
?
mayorista10
:
0;

}

return precioParticular(producto)*0.90;

}

function calcularPrecioMaximoCatalogo(){

let maximo=0;

perfumes.forEach(producto=>{

if(
modoActual==="particular" &&
esTester(producto)
){
return;
}

if(
modoActual==="mayorista" &&
!accesoMayoristaAutorizado
){
return;
}

const precio=
precioProductoParaFiltro(producto);

if(precio>maximo){
maximo=precio;
}

});

if(maximo<=0){
maximo=100000;
}

/* Redondeamos hacia arriba de a $5.000 para que la barra quede prolija */
precioMaximoCatalogo=
Math.ceil(maximo/5000)*5000;

return precioMaximoCatalogo;

}

function actualizarFiltroPrecioUI(){

const range=
document.getElementById("filtroPrecioRange");

const valor=
document.getElementById("filtroPrecioValor");

const maxEtiqueta=
document.getElementById("filtroPrecioMaxEtiqueta");

const ayuda=
document.getElementById("filtroPrecioAyuda");

if(!range || !valor || !maxEtiqueta){
return;
}

const maximo=
calcularPrecioMaximoCatalogo();

range.max=
String(maximo);

range.step=
maximo>=300000
?
"5000"
:
"1000";

let valorActual=
filtroPrecioMax===null
?
maximo
:
Math.min(filtroPrecioMax,maximo);

if(
filtroPrecioMax!==null &&
filtroPrecioMax>=maximo
){
filtroPrecioMax=null;
valorActual=maximo;
}

range.value=
String(valorActual);

const porcentaje=
maximo>0
?
(valorActual/maximo)*100
:
100;

range.style.setProperty(
"--precio-progreso",
porcentaje+"%"
);

valor.textContent=
filtroPrecioMax===null
?
"SIN LÍMITE"
:
"HASTA $"+
Math.round(valorActual).toLocaleString("es-AR");

maxEtiqueta.textContent=
"$"+
Math.round(maximo).toLocaleString("es-AR");

if(ayuda){

ayuda.textContent=
modoActual==="mayorista"
?
"En mayorista se toma como referencia el precio del nivel 10+ unidades."
:
"En particular se toma el precio con 10% OFF por transferencia / efectivo.";

}

}

function cambiarFiltroPrecio(valor){

const maximo=
precioMaximoCatalogo ||
calcularPrecioMaximoCatalogo();

const numero=
Number(valor);

if(
!Number.isFinite(numero) ||
numero>=maximo
){
filtroPrecioMax=null;
}
else{
filtroPrecioMax=numero;
}

actualizarFiltroPrecioUI();

}

function aplicarFiltrosCatalogo(){

const input=
document.getElementById("buscar");

const texto=
String(
input ? input.value : ""
)
.toLowerCase()
.trim();

productosFiltrados=
perfumes.filter(producto=>{

/* Testers:
   particular = ocultos
   mayorista autorizado = visibles
*/
if(
modoActual==="particular" &&
esTester(producto)
){
return false;
}

if(
modoActual==="mayorista" &&
!accesoMayoristaAutorizado
){
return false;
}

if(
modoActual==="mayorista" &&
accesoMayoristaAutorizado
){

if(
filtroTester==="tester" &&
!esTester(producto)
){
return false;
}

if(
filtroTester==="no-tester" &&
esTester(producto)
){
return false;
}

}

if(texto){

const nombre=
String(
producto.perfume ||
""
)
.toLowerCase();

if(!nombre.includes(texto)){
return false;
}

}

const tipoProducto=
normalizarTipoProducto(
producto.tipo
);

if(
filtroTipo!=="TODOS" &&
tipoProducto!==
normalizarTipoProducto(filtroTipo)
){
return false;
}

const genero=
generoProducto(producto);

if(
filtroGenero!=="TODOS" &&
genero!==filtroGenero
){
return false;
}

const stock=
String(
producto.stock ||
""
)
.toLowerCase()
.trim();

let disponibilidad=
filtroRapido!=="todos"
?
filtroRapido
:
filtroStockPopup;

if(
disponibilidad==="disponible" &&
!stock.includes("stock inmediato")
){
return false;
}

if(
disponibilidad==="pedido" &&
!stock.includes("disponible por pedido")
){
return false;
}


if(filtroPrecioMax!==null){

const precioFiltro=
precioProductoParaFiltro(producto);

if(
precioFiltro<=0 ||
precioFiltro>filtroPrecioMax
){
return false;
}

}

return true;

});

paginaActual=1;

actualizarTagsFiltros();

mostrarPagina();

}
/* =========================================================
POPUP FILTROS
========================================================= */

function abrirFiltros(){

const grupoTester=
document.getElementById("filtroTesterGrupo");

if(grupoTester){

grupoTester.style.display=
(
modoActual==="mayorista" &&
accesoMayoristaAutorizado
)
?
"block"
:
"none";

}

sincronizarBotonesFiltro();
actualizarFiltroPrecioUI();

document
.getElementById("filtroOverlay")
.classList
.add("activo");

}

function cerrarFiltros(){

document
.getElementById("filtroOverlay")
.classList
.remove("activo");

}

function cerrarFiltrosPorFondo(event){

if(
event.target &&
event.target.id==="filtroOverlay"
){
cerrarFiltros();
}

}

function seleccionarTipoFiltro(tipo){

filtroTipo=tipo;

document
.querySelectorAll("[data-filtro-tipo]")
.forEach(btn=>{

btn.classList.toggle(
"activo",
btn.dataset.filtroTipo===tipo
);

});

}

function seleccionarGeneroFiltro(genero){

filtroGenero=genero;

document
.querySelectorAll("[data-filtro-genero]")
.forEach(btn=>{

btn.classList.toggle(
"activo",
btn.dataset.filtroGenero===genero
);

});

}

function seleccionarStockFiltro(tipo){

filtroStockPopup=tipo;

document
.querySelectorAll("[data-filtro-stock]")
.forEach(btn=>{

btn.classList.toggle(
"activo",
btn.dataset.filtroStock===tipo
);

});

}

function seleccionarTesterFiltro(tipo){

if(
modoActual!=="mayorista" ||
!accesoMayoristaAutorizado
){
return;
}

filtroTester=tipo;

document
.querySelectorAll("[data-filtro-tester]")
.forEach(btn=>{

btn.classList.toggle(
"activo",
btn.dataset.filtroTester===tipo
);

});

}

function sincronizarBotonesFiltro(){

document
.querySelectorAll("[data-filtro-tipo]")
.forEach(btn=>{

btn.classList.toggle(
"activo",
btn.dataset.filtroTipo===filtroTipo
);

});

document
.querySelectorAll("[data-filtro-genero]")
.forEach(btn=>{

btn.classList.toggle(
"activo",
btn.dataset.filtroGenero===filtroGenero
);

});

document
.querySelectorAll("[data-filtro-stock]")
.forEach(btn=>{

btn.classList.toggle(
"activo",
btn.dataset.filtroStock===filtroStockPopup
);

});

document
.querySelectorAll("[data-filtro-tester]")
.forEach(btn=>{

btn.classList.toggle(
"activo",
btn.dataset.filtroTester===filtroTester
);

});

}

function aplicarFiltrosDesdePopup(){

/*
Si el usuario eligió disponibilidad dentro del popup,
desactivamos el chip rápido para evitar contradicciones.
*/
if(filtroStockPopup!=="todos"){

filtroRapido="todos";

document
.querySelectorAll(".cat-chip")
.forEach(btn=>
btn.classList.toggle(
"activo",
btn.dataset.chip==="todos"
)
);

}

cerrarFiltros();

aplicarFiltrosCatalogo();

document
.getElementById("catalogo")
.scrollIntoView({
behavior:"smooth"
});

}

function limpiarFiltros(){

filtroTipo="TODOS";
filtroGenero="TODOS";
filtroStockPopup="todos";
filtroTester="todos";
filtroRapido="todos";
filtroPrecioMax=null;

const buscar=
document.getElementById("buscar");

if(buscar){
buscar.value="";
}

document
.querySelectorAll(".cat-chip")
.forEach(btn=>
btn.classList.toggle(
"activo",
btn.dataset.chip==="todos"
)
);

sincronizarBotonesFiltro();

cerrarFiltros();

aplicarFiltrosCatalogo();

}

function actualizarTagsFiltros(){

const contenedor=
document.getElementById("filtrosActivos");

if(!contenedor){
return;
}

const tags=[];

if(filtroTipo!=="TODOS"){

const etiqueta=
filtroTipo==="ARABE"
?
"ÁRABES"
:
filtroTipo;

tags.push(
`<span class="filtro-tag">Categoría: ${escapeHTML(etiqueta)}</span>`
);

}

if(filtroGenero!=="TODOS"){

let etiquetaGenero=filtroGenero;

if(filtroGenero==="MASCULINO"){
etiquetaGenero="Masculino";
}
else if(filtroGenero==="FEMENINO"){
etiquetaGenero="Femenino";
}
else if(filtroGenero==="UNISEX"){
etiquetaGenero="Unisex";
}

tags.push(
`<span class="filtro-tag">Género: ${escapeHTML(etiquetaGenero)}</span>`
);

}

const disponibilidad=
filtroRapido!=="todos"
?
filtroRapido
:
filtroStockPopup;

if(disponibilidad==="disponible"){
tags.push(
'<span class="filtro-tag">Stock inmediato</span>'
);
}

if(disponibilidad==="pedido"){
tags.push(
'<span class="filtro-tag">Disponible por pedido</span>'
);
}

if(filtroPrecioMax!==null){

tags.push(
`<span class="filtro-tag">Hasta $${Math.round(filtroPrecioMax).toLocaleString("es-AR")}</span>`
);

}

if(modoActual==="mayorista"){

if(filtroTester==="tester"){
tags.push(
'<span class="filtro-tag">Mayorista · Solo testers</span>'
);
}
else if(filtroTester==="no-tester"){
tags.push(
'<span class="filtro-tag">Mayorista · Sin testers</span>'
);
}
else{
tags.push(
'<span class="filtro-tag">Mayorista · Todos los productos</span>'
);
}

}

contenedor.innerHTML=
tags.join("");

const boton=
document.querySelector(".abrir-filtros-btn");

if(boton){

boton.classList.toggle(
"activo",
filtroTipo!=="TODOS" ||
filtroGenero!=="TODOS" ||
filtroStockPopup!=="todos" ||
filtroPrecioMax!==null ||
(
modoActual==="mayorista" &&
filtroTester!=="todos"
)
);

}

}
/* =========================================================
CONVERTIR NÚMEROS
========================================================= */

function numeroSeguro(valor){

if(
valor===null ||
valor===undefined ||
valor===""
){

return 0;

}

if(
typeof valor==="number"
){

return Number.isFinite(valor)
?
valor
:
0;

}

let texto=

String(valor)
.trim()
.replace(/ARS/gi,"")
.replace(/\$/g,"")
.replace(/\s/g,"");

if(
texto.includes(".") &&
texto.includes(",")
){

texto=
texto
.replace(/\./g,"")
.replace(",",".");

}

else if(
texto.includes(",")
){

texto=
texto.replace(",", ".");

}

else if(
/^\d{1,3}(\.\d{3})+$/
.test(texto)
){

texto=
texto.replace(/\./g,"");

}

const numero=
Number(texto);

return Number.isFinite(numero)
?
numero
:
0;

}
/* =========================================================
PRECIO PARTICULAR
========================================================= */

function precioParticular(producto){

return numeroSeguro(
producto.precio
);

}
/* =========================================================
PRECIO MAYORISTA
========================================================= */

function precioMayorista(
producto,
cantidadTotal
){

let precio=0;

if(
cantidadTotal>=30
){

precio=
numeroSeguro(
producto.precioMayorista30
);

}

else if(
cantidadTotal>=20
){

precio=
numeroSeguro(
producto.precioMayorista20
);

}

else if(
cantidadTotal>=10
){

precio=
numeroSeguro(
producto.precioMayorista10
);

}

return precio;

}
/* =========================================================
PRECIO FINAL
========================================================= */

function obtenerPrecioItem(
item,
cantidadTotal
){

if(
modoActual==="mayorista"
){

return precioMayorista(
item,
cantidadTotal
);

}

let precio=
precioParticular(item);

if(
formaPago==="transferencia"
){

precio*=0.90;

}

return precio;

}
/* =========================================================
STOCK
========================================================= */

function stockDisponible(producto){

const stock=

String(
producto.stock ||
""
)
.toLowerCase();

return !(

stock.includes(
"sin stock"
)

||

stock.includes(
"agotado"
)

);

}

function productoPorPedido(producto){

return String(
producto.stock ||
""
)
.toLowerCase()
.includes(
"pedido"
);

}
