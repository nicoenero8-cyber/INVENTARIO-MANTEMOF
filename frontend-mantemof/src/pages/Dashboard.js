import { useEffect, useState } from "react";
import {
  getProductos,
  crearProducto,
  crearMovimiento,
  getMovimientos
} from "../services/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import axios from "axios";

function Dashboard() {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [busqueda, setBusqueda] = useState(""); // ✅ AQUÍ VA
  const [codigoBarras, setCodigoBarras] = useState("");

  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [ubicacion, setUbicacion] = useState("");

  const [cantidadInicial, setCantidadInicial] = useState(0);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [cantidad, setCantidad] = useState(0);

  const [paginaProductos, setPaginaProductos] = useState(1);
  const [paginaHistorial, setPaginaHistorial] = useState(1);
 


  const token = localStorage.getItem("token");
 
  // 🔥 PRODUCTOS
  const cargarProductos = async () => {
    const data = await getProductos();
    if (data.status === "OK") {
      setProductos(data.data);
    }
  };

  // 🔥 MOVIMIENTOS
  const cargarMovimientos = async () => {
    const data = await getMovimientos();
    if (data.status === "OK") {
      setMovimientos(data.data);
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarMovimientos();
  }, []);
  useEffect(() => {
  setPaginaProductos(1);
  setPaginaHistorial(1);
  
  }, [busqueda]);

  const handleCrear = async () => {
      const nuevo = {
        nombre,
        descripcion,
        marca,
        modelo,
        precio_compra: Number(precioCompra),
        precio_venta: Number(precio),
        cantidad: Number(cantidadInicial),
        ubicacion,
        categorias_id: 1,
        codigo_barras: codigoBarras
      };

    console.log(nuevo);

    

    const res = await crearProducto(nuevo);

    if (res.status === "OK") {
      alert("Producto creado 🔥");
      setNombre("");
      setPrecio("");
      setCantidadInicial(0);
      setUbicacion("");
      cargarProductos();
    } else {
      alert("Error al crear producto");
    }
  };

        const handleCreateProducto = async () => {
        try {

            const res = await axios.post(
              "/api/productos",
            {
              nombre,
              descripcion,
              marca,
              modelo,
              precio_compra: precioCompra,
              precio_venta: precio,
              cantidad,
              ubicacion,
              categorias_id: 1,
              codigo_barras: codigoBarras
            },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          alert("✅ Producto creado");

          setMostrarModal(false);       
          cargarMovimientos(); 
          cargarProductos();

        } catch (error) {

          console.error(error);

          alert(
            error.response?.data?.message ||
            "Error al crear producto"
          );
        }
      };

  // 🔥 MOVIMIENTO
  const handleMovimiento = async (productoId, tipo) => {
    const cantidad = prompt("Cantidad:");
    if (!cantidad) return;

    const user = JSON.parse(localStorage.getItem("user"));

      let destino = "";

      if (tipo === "entrada") {
        destino = prompt("📍 ¿Dónde quedará almacenado?");
      } else {
        destino = prompt("🚚 ¿A dónde va el producto?");
      }

      const movimiento = {
        productos_id: productoId,
        usuarios_id: user.id,
        tipo,
        cantidad: Number(cantidad),
        destino: destino || "General",
        observaciones:
          tipo === "entrada"
            ? "Ingreso manual"
            : "Salida manual"
      };

    const res = await crearMovimiento(movimiento);

    if (res.status === "OK") {
      alert("Movimiento registrado 🔥");
      cargarProductos();
      cargarMovimientos();
    } else {
      alert(res.message || "Error en movimiento");
    }
  };

  
      // 🔥 MÉTRICAS

    // 📅 Movimientos de hoy
    const movimientosHoy = movimientos.filter(m => {
      const hoy = new Date().toDateString();
      const fecha = new Date(m.fecha).toDateString();
      return hoy === fecha;
    });

    // 🔥 Producto más usado
   const conteo = {};

      movimientos.forEach(m => {
        if (m.tipo === "salida") { // 🔥 SOLO SALIDAS
          if (!conteo[m.producto]) conteo[m.producto] = 0;
          conteo[m.producto] += m.cantidad;
        }
      });

    const productoMasUsado =
      Object.keys(conteo).length > 0
        ? Object.keys(conteo).reduce((a, b) =>
            conteo[a] > conteo[b] ? a : b
          )
        : "N/A";

    // ⚠️ Stock bajo (menos de 5)
    const stockBajo = productos.filter(p => p.stock_actual < 5);


    const movimientosPorUsuario = {};

    movimientos.forEach((m) => {
      if (!movimientosPorUsuario[m.usuario]) {
        movimientosPorUsuario[m.usuario] = 0;
      }

      movimientosPorUsuario[m.usuario]++;
    });

    const dataUsuarios = Object.keys(movimientosPorUsuario).map((usuario) => ({
      usuario,
      movimientos: movimientosPorUsuario[usuario]
    }));



    const cardStyle = (color) => ({
        background: color,
        color: "white",
        padding: "15px",
        borderRadius: "10px",
        flex: 1,
        minWidth: "180px",
        textAlign: "center",
        fontWeight: "bold",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
      });

      const inputStyle = {
        width: "100%",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        marginTop: "5px"
      };

      const th = {
        padding: "10px",
        fontSize: "14px"
      };

      const td = {
        padding: "8px",
        borderBottom: "1px solid #eee"
      };


     const nuevo = {
      nombre,
      marca,
      modelo,
      precio_compra: Number(precioCompra),
      precio_venta: Number(precio),
      ubicacion,
      categorias_id: 1,
      codigo_barras: codigoBarras
    };


    const productosPorPagina = 20;
    const historialPorPagina = 10;

    const productosFiltrados = productos.filter((p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    const indexUltimoProducto =
      paginaProductos * productosPorPagina;

    const indexPrimerProducto =
      indexUltimoProducto - productosPorPagina;

    const productosActuales =
      productosFiltrados.slice(
        indexPrimerProducto,
        indexUltimoProducto
      );

    const totalPaginasProductos = Math.ceil(
      productosFiltrados.length / productosPorPagina
    );

    const movimientosFiltrados = movimientos.filter((m) =>
      m.producto
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );

    const indexUltimoMovimiento =
      paginaHistorial * historialPorPagina;

    const indexPrimerMovimiento =
      indexUltimoMovimiento - historialPorPagina;

    const movimientosActuales =
      movimientosFiltrados.slice(
        indexPrimerMovimiento,
        indexUltimoMovimiento
      );

    const totalPaginasHistorial = Math.ceil(
      movimientosFiltrados.length / historialPorPagina
    );




  return (

      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px"
      }}>

       
    <h1 style={{ margin: 0 }}>
      🏢 MANTEMOF
    </h1>

    <span style={{ fontSize: "14px", color: "#555" }}>
      Sistema de Inventario
    </span>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        gap: "20px",
        alignItems: "start",
        marginTop: "30px",
        marginBottom: "30px"
      }}
    >

      {/* PANEL IZQUIERDO */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px"
        }}
      >

        <div style={cardStyle("#3498db")}>
          📦 <b>{productos.length}</b><br />
          Total productos
        </div>

        <div style={cardStyle("#2ecc71")}>
          🔄 <b>{movimientosHoy.length}</b><br />
          Movimientos hoy
        </div>

        <div style={cardStyle("#e67e22")}>
          🔥 <b>{productoMasUsado}</b><br />
          <b>({conteo[productoMasUsado] || 0} mov.)</b><br />
          Más usado
        </div>

        <div style={cardStyle("#e74c3c")}>
          ⚠️ <b>{stockBajo.length}</b><br />
          Stock bajo
        </div>

      </div>

      {/* PANEL DERECHO */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "15px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>
          📊 Movimientos por usuario
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataUsuarios}>
            <XAxis dataKey="usuario" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="movimientos"
              fill="#3498db"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>


    

      <hr />

      {mostrarModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999
    }}
  >
    <div
      style={{
        background: "white",
        padding: "30px",
        borderRadius: "15px",
        width: "600px",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 5px 20px rgba(0,0,0,0.3)"
      }}
    >


      <h2 style={{ marginBottom: "20px" }}>
        📦 Crear Producto
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px"
        }}
      >

        <div>
          <label>Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Marca</label>
          <input
            type="text"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Modelo</label>
          <input
            type="text"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Ubicación</label>
          <input
            type="text"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Precio compra</label>
          <input
            type="number"
            value={precioCompra}
            onChange={(e) => setPrecioCompra(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Precio venta</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Cantidad</label>
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Código barras</label>
          <input
            type="text"
            value={codigoBarras}
            onChange={(e) => setCodigoBarras(e.target.value)}
            style={inputStyle}
          />
        </div>

      </div>

      <div style={{ marginTop: "15px" }}>
        <label>Descripción</label>

        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            minHeight: "100px"
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: "20px"
        }}
      >
        <button
          onClick={() => setMostrarModal(false)}
          style={{
            padding: "10px 15px",
            borderRadius: "10px",
            border: "none",
            background: "#95a5a6",
            color: "white"
          }}
        >
          Cancelar
        </button>

        <button
          onClick={handleCreateProducto}
          style={{
            padding: "10px 15px",
            borderRadius: "10px",
            border: "none",
            background: "#2ecc71",
            color: "white",
            fontWeight: "bold"
          }}
        >
          💾 Guardar producto
        </button>
      </div>
    </div>
  </div>
)}



       <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}
        >
          <h2>📦 Productos</h2>

          <button
            onClick={() => setMostrarModal(true)}
            style={{
              background: "#3498db",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "15px"
            }}
          >
            ➕ Nuevo producto
          </button>
        </div>

        {/* 🔍 BUSCADOR */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              margin: "30px 0"
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "700px"
              }}
            >
              <h3
                style={{
                  marginBottom: "10px",
                  color: "#2c3e50"
                }}
              >
                🔍 Buscar Producto
              </h3>

              <input
                placeholder="Buscar por nombre o serial"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: "12px",
                  border: "1px solid #dcdcdc",
                  fontSize: "16px",
                  outline: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>



          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "15px",
              marginTop: "20px"
            }}
          >
            {productosActuales.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setProductoSeleccionado(p)}
                  style={{
                    background: "white",
                    padding: "15px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                    transition: "0.2s"
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  <strong>📦 {p.nombre}</strong>

                  <div
                    style={{
                      marginTop: "8px",
                      color: p.stock_actual < 5 ? "#e74c3c" : "#2ecc71",
                      fontWeight: "bold"
                    }}
                  >
                    Stock: {p.stock_actual}
                  </div>

                  <div style={{ marginTop: "10px" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovimiento(p.id, "entrada");
                      }}
                      style={{
                        marginRight: "10px",
                        background: "#3498db",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px"
                      }}
                    >
                      ➕ Entrada
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovimiento(p.id, "salida");
                      }}
                      style={{
                        background: "#e74c3c",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px"
                      }}
                    >
                      ➖ Salida
                    </button>
                  </div>
                </div>
              ))}
          </div>


                
     <h3 style={{ marginTop: "30px" }}>PRODUCTOS</h3>

      

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
            background: "white",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          <thead style={{ background: "#2c3e50", color: "white" }}>
            <tr>
              <th style={th}>Producto</th>
              <th style={th}>Marca</th>
              <th style={th}>Modelo</th>
              <th style={th}>Descripción</th>
              <th style={th}>Compra</th>
              <th style={th}>Venta</th>
              <th style={th}>Stock</th>
              <th style={th}>Ubicación</th>
              <th style={th}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {productosActuales.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setProductoSeleccionado(p)}
                  style={{
                    textAlign: "center",
                    borderBottom: "1px solid #ddd",
                    cursor: "pointer"
                  }}
                >
                  <td style={td}>{p.nombre}</td>

                  <td style={td}>{p.marca || "-"}</td>

                  <td style={td}>{p.modelo || "-"}</td>

                  <td style={td}>{p.descripcion || "-"}</td>

                  <td style={td}>
                    $
                    {Number(
                      p.precio_compra || 0
                    ).toLocaleString()}
                  </td>

                  <td style={td}>
                    $
                    {Number(
                      p.precio_venta || 0
                    ).toLocaleString()}
                  </td>

                  <td
                    style={{
                      ...td,
                      color:
                        p.stock_actual < 5
                          ? "red"
                          : "green",
                      fontWeight: "bold"
                    }}
                  >
                    {p.stock_actual > 0
                      ? p.stock_actual
                      : "SIN STOCK"}
                  </td>

                  <td style={td}>
                    {p.ubicacion || "Sin ubicación"}
                  </td>

                  <td style={td}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovimiento(
                          p.id,
                          "entrada"
                        );
                      }}
                    >
                      ➕
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovimiento(
                          p.id,
                          "salida"
                        );
                      }}
                    >
                      ➖
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "20px",
            flexWrap: "wrap"
          }}
        >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "15px",
            marginTop: "20px"
          }}
        >
          <button
            onClick={() =>
              setPaginaProductos((prev) =>
                Math.max(prev - 1, 1)
              )
            }
            disabled={paginaProductos === 1}
            style={{
              padding: "10px 15px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              background:
                paginaProductos === 1
                  ? "#bdc3c7"
                  : "#3498db",
              color: "white",
              fontWeight: "bold"
            }}
          >
            ⬅️ Anterior
          </button>

          <span
            style={{
              fontWeight: "bold",
              color: "#2c3e50"
            }}
          >
            Página {paginaProductos} de {totalPaginasProductos}
          </span>

          <button
            onClick={() =>
              setPaginaProductos((prev) =>
                Math.min(
                  prev + 1,
                  totalPaginasProductos
                )
              )
            }
            disabled={
              paginaProductos ===
              totalPaginasProductos
            }
            style={{
              padding: "10px 15px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              background:
                paginaProductos ===
                totalPaginasProductos
                  ? "#bdc3c7"
                  : "#3498db",
              color: "white",
              fontWeight: "bold"
            }}
          >
            Siguiente ➡️
          </button>
        </div>
        </div>


        <hr />

        <h3>📜 Historial de movimientos</h3>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          <thead
            style={{
              background: "#2c3e50",
              color: "white"
            }}
          >
            <tr>
              <th style={th}>Fecha</th>
              <th style={th}>Producto</th>
              <th style={th}>Tipo</th>
              <th style={th}>Cantidad</th>
              <th style={th}>Usuario</th>
              <th style={th}>Destino</th>
            </tr>
          </thead>

          <tbody>
            {movimientosActuales.map((m) => (
                <tr
                  key={m.id}
                  style={{
                    textAlign: "center",
                    borderBottom: "1px solid #ddd"
                  }}
                >
                  <td style={td}>
                    {new Date(
                      m.fecha
                    ).toLocaleString()}
                  </td>

                  <td style={td}>
                    {m.producto}
                  </td>

                  <td
                    style={{
                      ...td,
                      color:
                        m.tipo === "entrada"
                          ? "green"
                          : "red",
                      fontWeight: "bold"
                    }}
                  >
                    {m.tipo}
                  </td>

                  <td style={td}>
                    {m.cantidad}
                  </td>

                  <td style={td}>
                    {m.usuario || "-"}
                  </td>

                  <td style={td}>
                    {m.destino || "-"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>    

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "20px",
            flexWrap: "wrap"
          }}
        >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "15px",
            marginTop: "20px"
          }}
        >
          <button
            onClick={() =>
              setPaginaHistorial((prev) =>
                Math.max(prev - 1, 1)
              )
            }
            disabled={paginaHistorial === 1}
            style={{
              padding: "10px 15px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              background:
                paginaHistorial === 1
                  ? "#bdc3c7"
                  : "#3498db",
              color: "white",
              fontWeight: "bold"
            }}
          >
            ⬅️ Anterior
          </button>

          <span
            style={{
              fontWeight: "bold",
              color: "#2c3e50"
            }}
          >
            Página {paginaHistorial} de {totalPaginasHistorial}
          </span>

          <button
            onClick={() =>
              setPaginaHistorial((prev) =>
                Math.min(
                  prev + 1,
                  totalPaginasHistorial
                )
              )
            }
            disabled={
              paginaHistorial ===
              totalPaginasHistorial
            }
            style={{
              padding: "10px 15px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              background:
                paginaHistorial ===
                totalPaginasHistorial
                  ? "#bdc3c7"
                  : "#3498db",
              color: "white",
              fontWeight: "bold"
            }}
          >
            Siguiente ➡️
          </button>
        </div>
        </div>

    </div>
  );
}

export default Dashboard;