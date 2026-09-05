// ============================================================
// MOTOR DE FILTROS
// ============================================================

let filtroCategoria = "todos";
let filtroDisponibilidad = "todos";
let filtroTester = "todos";

let precioMaximoFiltro = Infinity;


// ============================================================
// POPUP FILTROS
// ============================================================

function abrirFiltros() {

  const popup =
    document.getElementById("popupFiltros");

  if (popup) {
    popup.classList.add("activo");
  }
}


function cerrarFiltros() {

  const popup =
    document.getElementById("popupFiltros");

  if (popup) {
    popup.classList.remove("activo");
  }
}


// ============================================================
// CONVERTIR NÚMEROS
// ============================================================

function numeroSeguro(valor) {

  if (typeof valor === "number") {
    return valor;
  }

  if (!valor) return 0;

  const limpio =
    String(valor)
      .replace(/\$/g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".")
      .replace(/[^\d.-]/g, "");

  const numero =
    Number(limpio);

  return Number.isFinite(numero)
    ? numero
    : 0;
}


// ============================================================
// PRECIO PARTICULAR
// ============================================================

function precioParticular(producto) {

  return numeroSeguro(
    producto?.Precio
  );
}


// ============================================================
// PRECIO MAYORISTA
// ============================================================

function precioMayorista(producto) {

  const precio =
    precioParticular(producto);

  const unidades =
    typeof totalUnidadesCarrito === "function"
      ? totalUnidadesCarrito()
      : 0;

  let porcentaje = 1;

  if (unidades >= 30) {
    porcentaje = 0.80;
  } else if (unidades >= 20) {
    porcentaje = 0.85;
  } else if (unidades >= 10) {
    porcentaje = 0.90;
  }

  const resultado =
    precio * porcentaje;

  return Math.round(resultado / 100) * 100;
}


// ============================================================
// PRECIO FINAL
// ============================================================

function precioFinal(producto) {

  if (
    modoMayorista &&
    typeof totalUnidadesCarrito === "function" &&
    totalUnidadesCarrito() >= 10
  ) {
    return precioMayorista(producto);
  }

  return precioParticular(producto);
}


// ============================================================
// STOCK
// ============================================================

function normalizarStock(stock) {

  const valor =
    String(stock || "")
      .trim()
      .toLowerCase();

  if (
    valor === "disponible" ||
    valor === "stock" ||
    valor === "si" ||
    valor === "sí" ||
    valor.includes("stock")
  ) {
    return "stock inmediato";
  }

  return "disponible por pedido";
}


// ============================================================
// APLICAR FILTROS
// ============================================================

function aplicarFiltrosCatalogo() {

  const buscador =
    document.getElementById("buscador");

  const texto =
    buscador
      ? buscador.value.trim().toLowerCase()
      : "";

  productosFiltrados =
    productos.filter(producto => {

      const nombre =
        String(producto.Perfume || "")
          .toLowerCase();

      const categoria =
        String(producto.Tipo || "")
          .toLowerCase()
          .trim();

      const stock =
        normalizarStock(producto.Stock);

      const esTester =
        String(producto.Tester || "")
          .toUpperCase() === "SI";

      // ----------------------------
      // BUSCADOR
      // ----------------------------

      if (
        texto &&
        !nombre.includes(texto)
      ) {
        return false;
      }

      // ----------------------------
      // CHIPS
      // ----------------------------

      if (modoCatalogo === "disponibles") {

        if (stock !== "stock inmediato") {
          return false;
        }

      }

      if (modoCatalogo === "a-pedido") {

        if (stock !== "disponible por pedido") {
          return false;
        }

      }

      if (modoCatalogo === "mayorista") {

        if (!modoMayorista) {
          return false;
        }

      }

      // ----------------------------
      // CATEGORÍA
      // ----------------------------

      if (
        filtroCategoria !== "todos" &&
        categoria !== filtroCategoria
      ) {
        return false;
      }

      // ----------------------------
      // DISPONIBILIDAD
      // ----------------------------

      if (
        filtroDisponibilidad === "stock" &&
        stock !== "stock inmediato"
      ) {
        return false;
      }

      if (
        filtroDisponibilidad === "pedido" &&
        stock !== "disponible por pedido"
      ) {
        return false;
      }

      // ----------------------------
      // TESTER
      // ----------------------------

      if (
        filtroTester === "tester" &&
        !esTester
      ) {
        return false;
      }

      if (
        filtroTester === "sin-tester" &&
        esTester
      ) {
        return false;
      }

      // ----------------------------
      // PRECIO
      // ----------------------------

      const precio =
        precioParticular(producto);

      if (
        Number.isFinite(precioMaximoFiltro) &&
        precio > precioMaximoFiltro
      ) {
        return false;
      }

      // ----------------------------

      return true;

    });

  paginaActual = 1;

  mostrarProductos();

  actualizarContadoresFiltros();
}


// ============================================================
// CAMBIAR CATEGORÍA
// ============================================================

function cambiarCategoria(valor) {

  filtroCategoria =
    String(valor || "todos")
      .toLowerCase()
      .trim();

  paginaActual = 1;

  aplicarFiltrosCatalogo();
}


// ============================================================
// CAMBIAR DISPONIBILIDAD
// ============================================================

function cambiarDisponibilidad(valor) {

  filtroDisponibilidad =
    valor || "todos";

  paginaActual = 1;

  aplicarFiltrosCatalogo();
}


// ============================================================
// CAMBIAR TESTER
// ============================================================

function cambiarTester(valor) {

  filtroTester =
    valor || "todos";

  paginaActual = 1;

  aplicarFiltrosCatalogo();
}


// ============================================================
// ACTUALIZAR CONTADORES
// ============================================================

function actualizarContadoresFiltros() {

  const contador =
    document.getElementById("contadorProductos");

  if (!contador) return;

  contador.textContent =
    `${productosFiltrados.length} productos`;
}


// ============================================================
// FORMATEAR PRECIO
// ============================================================

function formatearPrecio(valor) {

  const numero =
    numeroSeguro(valor);

  return numero.toLocaleString(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }
  );
}


// ============================================================
// INICIALIZAR SLIDER
// ============================================================

function inicializarFiltroPrecio() {

  const slider =
    document.getElementById("sliderPrecio");

  if (!slider || !productos.length) {
    return;
  }

  const precios =
    productos.map(p =>
      precioParticular(p)
    );

  const max =
    Math.max(...precios);

  let maxRedondeado;

  if (max >= 300000) {
    maxRedondeado =
      Math.ceil(max / 5000) * 5000;
  } else {
    maxRedondeado =
      Math.ceil(max / 1000) * 1000;
  }

  slider.min = 0;
  slider.max = maxRedondeado;
  slider.value = maxRedondeado;

  precioMaximoFiltro =
    maxRedondeado;

  const display =
    document.getElementById("precioHasta");

  if (display) {
    display.textContent =
      formatearPrecio(maxRedondeado);
  }

  slider.addEventListener(
    "input",
    () => {

      precioMaximoFiltro =
        Number(slider.value);

      const texto =
        document.getElementById("precioHasta");

      if (texto) {
        texto.textContent =
          formatearPrecio(
            precioMaximoFiltro
          );
      }

      aplicarFiltrosCatalogo();
    }
  );
}


// ============================================================
// RESET FILTROS
// ============================================================

function resetearFiltros() {

  filtroCategoria = "todos";
  filtroDisponibilidad = "todos";
  filtroTester = "todos";

  modoCatalogo = "todos";

  const buscador =
    document.getElementById("buscador");

  if (buscador) {
    buscador.value = "";
  }

  const slider =
    document.getElementById("sliderPrecio");

  if (slider) {

    slider.value =
      slider.max;

    precioMaximoFiltro =
      Number(slider.max);

    const display =
      document.getElementById("precioHasta");

    if (display) {
      display.textContent =
        formatearPrecio(
          Number(slider.max)
        );
    }
  }

  document
    .querySelectorAll(".chip")
    .forEach(chip =>
      chip.classList.remove("activo")
    );

  const todos =
    document.querySelector(
      '.chip[data-modo="todos"]'
    );

  if (todos) {
    todos.classList.add("activo");
  }

  aplicarFiltrosCatalogo();
}


// ============================================================
// ETIQUETA DE FILTRO DE PRECIO
// ============================================================

function mostrarFiltroPrecioActivo() {

  const contenedor =
    document.getElementById("filtroPrecioActivo");

  if (!contenedor) return;

  const slider =
    document.getElementById("sliderPrecio");

  if (!slider) return;

  if (
    Number(slider.value) <
    Number(slider.max)
  ) {

    contenedor.textContent =
      `Hasta ${formatearPrecio(
        Number(slider.value)
      )}`;

    contenedor.classList.add("activo");

  } else {

    contenedor.textContent = "";

    contenedor.classList.remove(
      "activo"
    );
  }
}
