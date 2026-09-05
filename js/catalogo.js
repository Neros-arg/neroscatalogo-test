// ============================================================
// CONFIG
// ============================================================

const WHATSAPP = "5493417830300";
const CLAVE_MAYORISTA = "NEROS2026";

let productos = [];
let productosFiltrados = [];
let paginaActual = 1;
const productosPorPagina = 12;

let modoMayorista = sessionStorage.getItem("nerosMayoristaOK") === "true";


// ============================================================
// API
// ============================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbyq3ELQLXoYwdeYfvbL1GXWWc0blYp48VCWObDAYs6YgXiUKczqOlNDRY3KyjoCTD-fUA/exec";


// ============================================================
// ACCESO MAYORISTA
// ============================================================

function abrirAccesoMayorista() {
  const clave = prompt("Ingresá la clave mayorista:");

  if (clave === CLAVE_MAYORISTA) {
    modoMayorista = true;
    sessionStorage.setItem("nerosMayoristaOK", "true");

    alert("Desbloqueaste nuevos productos");

    mostrarProductos();
    actualizarModoMayorista();
  } else if (clave !== null) {
    alert("Clave incorrecta");
  }
}


function cerrarAccesoMayorista() {
  modoMayorista = false;
  sessionStorage.removeItem("nerosMayoristaOK");

  mostrarProductos();
  actualizarModoMayorista();
}


function actualizarModoMayorista() {
  document.body.classList.toggle("modo-mayorista", modoMayorista);

  const botones = document.querySelectorAll(".btn-mayorista");

  botones.forEach(btn => {
    btn.textContent = modoMayorista
      ? "MAYORISTA ACTIVO"
      : "MAYORISTA";
  });
}


// ============================================================
// MODO
// ============================================================

let modoCatalogo = "todos";


// ============================================================
// PAGO
// ============================================================

let metodoPagoSeleccionado = "mercadopago";


// ============================================================
// BUSCADOR
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  const buscador = document.getElementById("buscador");

  if (buscador) {
    buscador.addEventListener("input", () => {
      paginaActual = 1;
      aplicarFiltrosCatalogo();
    });
  }

});


// ============================================================
// MOSTRAR PRODUCTOS
// ============================================================

function mostrarProductos() {

  const contenedor = document.getElementById("productos");

  if (!contenedor) return;

  contenedor.innerHTML = "";

  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;

  const pagina = productosFiltrados.slice(inicio, fin);

  if (!pagina.length) {
    contenedor.innerHTML = `
      <div class="sin-productos">
        <h3>No encontramos productos</h3>
        <p>Probá cambiando los filtros.</p>
      </div>
    `;

    renderPaginacion();
    return;
  }

  pagina.forEach((producto, index) => {

    const precio = precioFinal(producto);

    const disponible =
      normalizarStock(producto.Stock) === "stock inmediato";

    const tipoStock = disponible
      ? "Stock inmediato"
      : "Disponible por pedido";

    const tester =
      String(producto.Tester || "").toUpperCase() === "SI";

    const card = document.createElement("article");

    card.className = "producto-card";

    card.innerHTML = `

      <div class="producto-imagen-wrapper">

        <img
          src="${producto.Foto || ""}"
          alt="${producto.Perfume || "Perfume NERÓS"}"
          class="producto-imagen"
          loading="lazy"
        >

        ${
          tester
            ? `<span class="badge-tester">TESTER</span>`
            : ""
        }

        <span class="badge-stock">
          ${tipoStock}
        </span>

      </div>

      <div class="producto-info">

        <div class="producto-categoria">
          ${producto.Tipo || ""}
        </div>

        <h3>
          ${producto.Perfume || ""}
        </h3>

        <div class="precio-normal">
          ${formatearPrecio(precio)}
        </div>

        <div class="precio-cuotas">
          2 cuotas sin interés
        </div>

        <div class="precio-transferencia">
          ${formatearPrecio(precio * 0.90)}
          <span>efectivo / transferencia</span>
        </div>

        <div class="producto-acciones">

          <button
            class="btn-detalles"
            onclick="abrirFicha(${productos.indexOf(producto)})"
          >
            VER DETALLES
          </button>

          <button
            class="btn-agregar"
            ${
              disponible
                ? `onclick="agregarAlCarrito(${productos.indexOf(producto)})"`
                : ""
            }
            ${!disponible ? "disabled" : ""}
          >
            ${
              disponible
                ? "＋ CARRITO"
                : "SIN STOCK"
            }
          </button>

        </div>

      </div>
    `;

    contenedor.appendChild(card);
  });

  renderPaginacion();
}


// ============================================================
// PAGINACIÓN
// ============================================================

function renderPaginacion() {

  const contenedor = document.getElementById("paginacion");

  if (!contenedor) return;

  const totalPaginas =
    Math.ceil(productosFiltrados.length / productosPorPagina);

  if (totalPaginas <= 1) {
    contenedor.innerHTML = "";
    return;
  }

  let html = "";

  if (paginaActual > 1) {
    html += `
      <button onclick="cambiarPagina(${paginaActual - 1})">
        ‹
      </button>
    `;
  }

  for (let i = 1; i <= totalPaginas; i++) {

    if (
      i === 1 ||
      i === totalPaginas ||
      Math.abs(i - paginaActual) <= 1
    ) {
      html += `
        <button
          class="${i === paginaActual ? "activo" : ""}"
          onclick="cambiarPagina(${i})"
        >
          ${i}
        </button>
      `;
    }

    else if (
      i === paginaActual - 2 ||
      i === paginaActual + 2
    ) {
      html += `<span>…</span>`;
    }
  }

  if (paginaActual < totalPaginas) {
    html += `
      <button onclick="cambiarPagina(${paginaActual + 1})">
        ›
      </button>
    `;
  }

  contenedor.innerHTML = html;
}


function cambiarPagina(numero) {

  paginaActual = numero;

  mostrarProductos();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ============================================================
// BUSCAR PRODUCTO
// ============================================================

function buscarProducto(nombre) {

  return productos.find(
    p =>
      String(p.Perfume || "").toLowerCase() ===
      String(nombre || "").toLowerCase()
  );
}


// ============================================================
// NOTAS OLFATIVAS — FORMATO VISUAL
// ============================================================

function mostrarNotasOlfativas(producto) {

  if (!producto) return "";

  const notas =
    producto.Notas ||
    producto["Notas Olfativas"] ||
    "";

  if (!notas) return "";

  return `
    <div class="notas-olfativas">
      <h4>Notas olfativas</h4>
      <p>${notas}</p>
    </div>
  `;
}


// ============================================================
// FICHA DINÁMICA
// ============================================================

function abrirFicha(index) {

  const producto = productos[index];

  if (!producto) return;

  const modal =
    document.getElementById("modalProducto");

  if (!modal) return;

  const precio = precioFinal(producto);

  const contenido =
    modal.querySelector(".modal-producto-contenido");

  if (!contenido) return;

  contenido.innerHTML = `

    <button
      class="cerrar-modal"
      onclick="cerrarFicha()"
    >
      ×
    </button>

    <div class="ficha-producto">

      <div class="ficha-imagen">
        <img
          src="${producto.Foto || ""}"
          alt="${producto.Perfume || ""}"
        >
      </div>

      <div class="ficha-info">

        <div class="ficha-categoria">
          ${producto.Tipo || ""}
        </div>

        <h2>
          ${producto.Perfume || ""}
        </h2>

        <div class="ficha-precio">
          ${formatearPrecio(precio)}
        </div>

        <div class="ficha-stock">
          ${normalizarStock(producto.Stock)}
        </div>

        ${mostrarNotasOlfativas(producto)}

        <button
          class="btn-agregar-ficha"
          onclick="agregarAlCarrito(${index}); cerrarFicha();"
        >
          AGREGAR AL CARRITO
        </button>

      </div>

    </div>
  `;

  modal.classList.add("activo");
  document.body.classList.add("modal-abierto");
}


function cerrarFicha() {

  const modal =
    document.getElementById("modalProducto");

  if (!modal) return;

  modal.classList.remove("activo");
  document.body.classList.remove("modal-abierto");
}


// ============================================================
// ESCAPES
// ============================================================

function escapeHTML(texto) {

  const div = document.createElement("div");

  div.textContent = texto ?? "";

  return div.innerHTML;
}


// ============================================================
// MENÚ
// ============================================================

function abrirMenu() {

  const menu =
    document.getElementById("menuMobile");

  if (menu) {
    menu.classList.add("activo");
  }
}


function cerrarMenu() {

  const menu =
    document.getElementById("menuMobile");

  if (menu) {
    menu.classList.remove("activo");
  }
}


// ============================================================
// CHIPS
// ============================================================

function seleccionarChip(chip, modo) {

  document
    .querySelectorAll(".chip")
    .forEach(c => c.classList.remove("activo"));

  chip.classList.add("activo");

  modoCatalogo = modo;

  paginaActual = 1;

  aplicarFiltrosCatalogo();
}


// ============================================================
// ANIMACIONES
// ============================================================

function iniciarAnimaciones() {

  const elementos =
    document.querySelectorAll(".animar");

  elementos.forEach(el => {
    el.classList.add("visible");
  });
}


// ============================================================
// RESULTADO DE PAGO AL VOLVER DE MERCADO PAGO
// ============================================================

function revisarResultadoPago() {

  const params =
    new URLSearchParams(window.location.search);

  const status =
    params.get("status");

  if (!status) return;

  if (status === "approved") {
    alert("¡Pago aprobado! Gracias por tu compra.");
  }

  if (status === "pending") {
    alert("Tu pago está pendiente de confirmación.");
  }

  if (status === "rejected") {
    alert("El pago fue rechazado.");
  }
}


// ============================================================
// PARÁMETROS DE ENTRADA DESDE LA HOME
// ============================================================

function aplicarParametrosIniciales() {

  const params =
    new URLSearchParams(window.location.search);

  const seccion =
    params.get("seccion");

  if (!seccion) return;

  const mapa = {
    arabes: "arabe",
    arabe: "arabe",
    diseñador: "diseñador",
    disenador: "diseñador",
    nicho: "nicho",
    kits: "kits",
    "cuidado-personal": "cuidado personal"
  };

  const categoria =
    mapa[seccion.toLowerCase()];

  if (categoria) {

    const select =
      document.getElementById("categoria");

    if (select) {
      select.value = categoria;
    }

    aplicarFiltrosCatalogo();
  }
}


// ============================================================
// ESC
// ============================================================

document.addEventListener("keydown", e => {

  if (e.key === "Escape") {
    cerrarFicha();
    cerrarCarrito();
    cerrarMenu();
  }

});


// ============================================================
// PARALLAX FONDO CATÁLOGO
// ============================================================

window.addEventListener("scroll", () => {

  const fondo =
    document.querySelector(".fondo-catalogo");

  if (!fondo) return;

  fondo.style.transform =
    `translateY(${window.scrollY * 0.15}px)`;

});


// ============================================================
// SLIDER
// ============================================================

function actualizarSliderPrecio() {

  const slider =
    document.getElementById("sliderPrecio");

  const valor =
    document.getElementById("precioHasta");

  if (!slider || !valor) return;

  valor.textContent =
    formatearPrecio(Number(slider.value));

  aplicarFiltrosCatalogo();
}


// ============================================================
// CARGA DE PRODUCTOS
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

  try {

    const respuesta =
      await fetch(API_URL);

    const datos =
      await respuesta.json();

    productos = Array.isArray(datos)
      ? datos
      : datos.productos || [];

    productosFiltrados = [...productos];

    actualizarModoMayorista();

    inicializarFiltroPrecio();

    aplicarFiltrosCatalogo();

    iniciarAnimaciones();

    revisarResultadoPago();

    setTimeout(
      aplicarParametrosIniciales,
      700
    );

  } catch (error) {

    console.error(
      "Error cargando catálogo:",
      error
    );

    const contenedor =
      document.getElementById("productos");

    if (contenedor) {
      contenedor.innerHTML = `
        <div class="sin-productos">
          <h3>No se pudo cargar el catálogo</h3>
          <p>Intentá nuevamente en unos segundos.</p>
        </div>
      `;
    }

  }

});
