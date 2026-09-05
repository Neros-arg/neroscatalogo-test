// ============================================================
// CARRITO
// ============================================================

let carrito = [];


// ============================================================
// AGREGAR AL CARRITO
// ============================================================

function agregarAlCarrito(index) {

  const producto =
    productos[index];

  if (!producto) return;

  const existente =
    carrito.find(
      item =>
        item.Perfume === producto.Perfume
    );

  if (existente) {

    existente.cantidad++;

  } else {

    carrito.push({
      ...producto,
      cantidad: 1
    });

  }

  actualizarCarrito();

  abrirCarrito();
}


// ============================================================
// CAMBIAR CANTIDAD
// ============================================================

function cambiarCantidad(index, cantidad) {

  const item =
    carrito[index];

  if (!item) return;

  cantidad =
    Number(cantidad);

  if (cantidad <= 0) {

    carrito.splice(index, 1);

  } else {

    item.cantidad = cantidad;

  }

  actualizarCarrito();
}


// ============================================================
// TOTAL UNIDADES
// ============================================================

function totalUnidadesCarrito() {

  return carrito.reduce(
    (total, item) =>
      total + Number(item.cantidad || 0),
    0
  );
}


// ============================================================
// ACTUALIZAR CARRITO
// ============================================================

function actualizarCarrito() {

  renderCarrito();

  const cantidad =
    totalUnidadesCarrito();

  const contador =
    document.getElementById("contadorCarrito");

  if (contador) {
    contador.textContent =
      cantidad;
  }

  if (
    typeof aplicarFiltrosCatalogo ===
    "function"
  ) {
    mostrarProductos();
  }
}


// ============================================================
// ABRIR CARRITO
// ============================================================

function abrirCarrito() {

  const carritoPanel =
    document.getElementById("carrito");

  if (!carritoPanel) return;

  carritoPanel.classList.add("activo");

  document.body.classList.add(
    "carrito-abierto"
  );
}


// ============================================================
// CERRAR CARRITO
// ============================================================

function cerrarCarrito() {

  const carritoPanel =
    document.getElementById("carrito");

  if (!carritoPanel) return;

  carritoPanel.classList.remove(
    "activo"
  );

  document.body.classList.remove(
    "carrito-abierto"
  );
}


// ============================================================
// RENDER CARRITO
// ============================================================

function renderCarrito() {

  const contenedor =
    document.getElementById(
      "itemsCarrito"
    );

  const totalElement =
    document.getElementById(
      "totalCarrito"
    );

  if (!contenedor) return;

  if (!carrito.length) {

    contenedor.innerHTML = `
      <div class="carrito-vacio">
        <p>Tu carrito está vacío.</p>
      </div>
    `;

    if (totalElement) {
      totalElement.textContent =
        "$0";
    }

    return;
  }

  let total = 0;

  contenedor.innerHTML = "";

  carrito.forEach(
    (item, index) => {

      const precio =
        precioFinal(item);

      const subtotal =
        precio *
        Number(item.cantidad || 0);

      total += subtotal;

      const div =
        document.createElement("div");

      div.className =
        "item-carrito";

      div.innerHTML = `

        <div class="item-carrito-info">

          <strong>
            ${escapeHTML(item.Perfume)}
          </strong>

          <span>
            ${formatearPrecio(precio)}
          </span>

        </div>

        <div class="item-carrito-controles">

          <button
            onclick="cambiarCantidad(
              ${index},
              ${item.cantidad - 1}
            )"
          >
            −
          </button>

          <span>
            ${item.cantidad}
          </span>

          <button
            onclick="cambiarCantidad(
              ${index},
              ${item.cantidad + 1}
            )"
          >
            +
          </button>

          <button
            class="eliminar-item"
            onclick="cambiarCantidad(
              ${index},
              0
            )"
          >
            ×
          </button>

        </div>

        <div class="item-carrito-subtotal">
          ${formatearPrecio(subtotal)}
        </div>
      `;

      contenedor.appendChild(div);
    }
  );

  if (totalElement) {

    totalElement.textContent =
      formatearPrecio(total);

  }
}


// ============================================================
// FINALIZAR COMPRA
// ============================================================

function finalizarCompra() {

  if (!carrito.length) {

    alert("El carrito está vacío.");

    return;
  }

  const nombre =
    prompt("Nombre y apellido:");

  if (!nombre) return;

  const telefono =
    prompt("Teléfono de contacto:");

  if (!telefono) return;

  const mensaje =
    generarMensajeWhatsApp(
      nombre,
      telefono
    );

  window.open(
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`,
    "_blank"
  );
}


// ============================================================
// PAGAR CON MERCADO PAGO
// ============================================================

async function pagarConMercadoPago() {

  if (!carrito.length) {

    alert("El carrito está vacío.");

    return;
  }

  const total =
    carrito.reduce(
      (sum, item) =>
        sum +
        precioFinal(item) *
        Number(item.cantidad || 0),
      0
    );

  const items =
    carrito.map(item => ({
      title: item.Perfume,
      quantity: Number(item.cantidad || 1),
      unit_price: precioFinal(item)
    }));

  try {

    const respuesta =
      await fetch(
        API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },
          body: JSON.stringify({
            accion: "crear_preferencia",
            items,
            total
          })
        }
      );

    const data =
      await respuesta.json();

    if (
      data.init_point
    ) {

      window.location.href =
        data.init_point;

    } else {

      throw new Error(
        "No se recibió init_point"
      );

    }

  } catch (error) {

    console.error(error);

    alert(
      "No pudimos iniciar el pago con Mercado Pago."
    );

  }
}


// ============================================================
// WHATSAPP
// ============================================================

function generarMensajeWhatsApp(
  nombre,
  telefono
) {

  let mensaje =
    `Hola NERÓS 👋\n\n`;

  mensaje +=
    `Quiero realizar una compra.\n\n`;

  mensaje +=
    `Nombre: ${nombre}\n`;

  mensaje +=
    `Teléfono: ${telefono}\n\n`;

  mensaje +=
    `Productos:\n`;

  carrito.forEach(item => {

    const precio =
      precioFinal(item);

    mensaje +=
      `• ${item.Perfume} x${item.cantidad} — ${formatearPrecio(precio * item.cantidad)}\n`;

  });

  const total =
    carrito.reduce(
      (sum, item) =>
        sum +
        precioFinal(item) *
        item.cantidad,
      0
    );

  mensaje +=
    `\nTotal: ${formatearPrecio(total)}`;

  return mensaje;
}


function enviarWhatsApp() {

  const mensaje =
    generarMensajeWhatsApp(
      "Cliente",
      ""
    );

  window.open(
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`,
    "_blank"
  );
}


// ============================================================
// CARGAR CARRITO GUARDADO
// ============================================================

try {

  const guardado =
    localStorage.getItem(
      "nerosCarrito"
    );

  if (guardado) {
    carrito =
      JSON.parse(guardado);
  }

} catch (error) {

  console.error(
    "No se pudo cargar el carrito:",
    error
  );

}


// ============================================================
// GUARDAR CARRITO
// ============================================================

function guardarCarrito() {

  try {

    localStorage.setItem(
      "nerosCarrito",
      JSON.stringify(carrito)
    );

  } catch (error) {

    console.error(
      "No se pudo guardar el carrito:",
      error
    );

  }

}


// Guardamos automáticamente cada vez
// que se actualiza el carrito.

const actualizarCarritoOriginal =
  actualizarCarrito;

actualizarCarrito = function () {

  actualizarCarritoOriginal();

  guardarCarrito();

};
