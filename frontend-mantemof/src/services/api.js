export const login = async (email, password) => {
  try {
    const res = await fetch(`/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    console.log("STATUS:", res.status);

    const data = await res.json();
    console.log("RESPUESTA:", data);

    return data;

  } catch (error) {
    console.error("ERROR FETCH:", error);
  }
};

export const getProductos = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/productos", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();
  return data;
};

export const crearProducto = async (producto) => {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/productos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(producto)
  });

  const data = await res.json();
  return data;
};

export const crearMovimiento = async (movimiento) => {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/movimientos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(movimiento)
  });

  const data = await res.json();
  return data;
};

export const getMovimientos = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/movimientos", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return await res.json();
};
