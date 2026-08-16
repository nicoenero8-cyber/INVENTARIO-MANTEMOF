import { useEffect, useState } from "react";
import axios from "axios";
import { getProductos } from "../services/api";

export default function Tecnicos() {

    const [productos, setProductos] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);

    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [area, setArea] = useState("");
    const [correo, setCorreo] = useState("");

    const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(null);

    const [productoSeleccionado, setProductoSeleccionado] = useState("");

    const [cantidadAsignar, setCantidadAsignar] = useState(1);

    const token = localStorage.getItem("token");

    console.log("TOKEN:", token);

    // =========================
    // OBTENER TECNICOS
    // =========================

    const obtenerTecnicos = async () => {

        try {

            const res = await axios.get(
                "http://127.0.0.1:3000/api/tecnicos",               {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setTecnicos(res.data.data);

        } catch (error) {

            console.error(error);

        }

    };

    // =========================
    // OBTENER PRODUCTOS
    // =========================

        const obtenerProductos = async () => {

            try {

                const data = await getProductos();

                console.log("PRODUCTOS:");
                console.log(data);

                if (data.status === "OK") {
                    setProductos(data.data);
                }

            } catch (error) {

                console.error("ERROR PRODUCTOS:");
                console.error(error);

            }

        };
    // =========================
    // USE EFFECT
    // =========================

    useEffect(() => {

        obtenerTecnicos();
        obtenerProductos();

    }, [token]);

    // =========================
    // CREAR TECNICO
    // =========================

    const crearTecnico = async () => {

        console.log({
            nombre,
            telefono,
            area,
            correo
        });
        try {

            await axios.post(
                "http://localhost:3000/api/tecnicos",
                {
                    nombre,
                    telefono,
                    area,
                    correo
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Técnico creado");

            setNombre("");
            setTelefono("");
            setArea("");
            setCorreo("");

            obtenerTecnicos();

        } catch (error) {

            console.error(error);

        }

    };

    // =========================
    // ASIGNAR HERRAMIENTA
    // =========================

    const asignarHerramienta = async () => {

        try {

            await axios.post(
                "http://localhost:3000/api/tecnicos/asignar",
                {
                    tecnicos_id: tecnicoSeleccionado.id,
                    productos_id: productoSeleccionado,
                    cantidad: cantidadAsignar
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Herramienta asignada");

            setTecnicoSeleccionado(null);

            obtenerTecnicos();
            obtenerProductos();

        } catch (error) {

            console.error(error);

            alert(error.response?.data?.message);

        }

    };

    return (

        <div style={{ padding: "20px" }}>

            <h1>👨‍🔧 Técnicos</h1>

            {/* ========================= */}
            {/* FORMULARIO */}
            {/* ========================= */}

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "20px"
                }}
            >

                <input
                    placeholder="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />

                <input
                    placeholder="Teléfono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                />

                <input
                    placeholder="Área"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                />

                <input
                    placeholder="Correo"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                />

                <button
                    type="button"
                    onClick={crearTecnico}
                >
                    ➕ Crear Técnico
                </button>
                

            </div>

            {/* ========================= */}
            {/* TABLA */}
            {/* ========================= */}

            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse"
                }}
            >

                <thead
                    style={{
                        background: "#2c3e50",
                        color: "white"
                    }}
                >

                    <tr>
                        <th>Nombre</th>
                        <th>Teléfono</th>
                        <th>Área</th>
                        <th>Correo</th>
                        <th>Acciones</th>
                    </tr>

                </thead>

                <tbody>

                    {tecnicos.map((t) => (

                        <tr key={t.id}>

                            <td>{t.nombre}</td>
                            <td>{t.telefono}</td>
                            <td>{t.area}</td>
                            <td>{t.correo}</td>

                            <td>

                                <button
                                    onClick={() =>
                                        setTecnicoSeleccionado(t)
                                    }
                                >
                                    🔧 Asignar
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

            {/* ========================= */}
            {/* ASIGNAR */}
            {/* ========================= */}

            {
                tecnicoSeleccionado && (

                    <div
                        style={{
                            marginTop: "20px",
                            padding: "20px",
                            border: "1px solid #ddd",
                            borderRadius: "10px"
                        }}
                    >

                        <h3>
                            Asignar herramienta a:
                            {" "}
                            {tecnicoSeleccionado.nombre}
                        </h3>

                        <select
                            value={productoSeleccionado}
                            onChange={(e) =>
                                setProductoSeleccionado(e.target.value)
                            }
                        >

                            <option value="">
                                Selecciona producto
                            </option>

                            {
                                productos.map((p) => (

                                    <option
                                        key={p.id}
                                        value={p.id}
                                    >
                                        {p.nombre}
                                        {" - Stock: "}
                                        {p.stock_actual}
                                    </option>

                                ))
                            }

                        </select>

                        <input
                            type="number"
                            value={cantidadAsignar}
                            onChange={(e) =>
                                setCantidadAsignar(e.target.value)
                            }
                            style={{
                                marginLeft: "10px"
                            }}
                        />

                        <button
                            onClick={asignarHerramienta}
                            style={{
                                marginLeft: "10px"
                            }}
                        >
                            ✅ Confirmar
                        </button>

                    </div>

                )
            }

        </div>

    );

}