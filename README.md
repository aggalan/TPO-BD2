# API de Seguros - TP-BD2

## 🚀 Setup en Codespace

### 1. Crear Codespace


### 2. Cargar Datos (Seed) (correr en la terminal de la app)
```bash
npm run seed
```

### 3. Iniciar la API (correr en la terminal de la app)
```bash
npm run start
```

---

## ❗️ Configuración de la URL

1. Abrí la pestaña **PUERTOS (PORTS)** del Codespace.
2. Buscá el puerto **3000**, hacé clic derecho.
3. Cambiá **Visibility → Public**.
4. Copiá la **Local Address** (algo como):  
   `https://TU-NOMBRE-DE-CODESPACE-3000.app.github.dev`
5. Tu **URL Base** de la API es:

```
URL_BASE = https://TU-NOMBRE-DE-CODESPACE-3000.app.github.dev/api
```

Usá `URL_BASE` para todos los endpoints.

---

# 📦 Endpoints (Queries)

## 📈 Q1–Q12: Consultas de Lectura (GET)

### Q1: Clientes Activos con Pólizas Vigentes
```bash
curl URL_BASE/clientes/activos-polizas-vigentes
```

### Q2: Siniestros Abiertos
```bash
curl URL_BASE/siniestros/abiertos
```

### Q3: Vehículos Asegurados
```bash
curl URL_BASE/vehiculos/asegurados
```

### Q4: Clientes sin Pólizas Activas
```bash
curl URL_BASE/clientes/sin-polizas-activas
```

### Q5: Agentes Activos con Cantidad de Pólizas
```bash
curl URL_BASE/agentes/activos-polizas
```

### Q6: Pólizas Vencidas
```bash
curl URL_BASE/polizas/vencidas
```

### Q7: Top 10 Clientes por Cobertura
```bash
curl URL_BASE/clientes/top-cobertura
```

### Q8: Siniestros tipo "Accidente" del Último Año
```bash
curl URL_BASE/siniestros/accidentes-recientes
```

### Q9: Listar Pólizas Activas 
```bash
curl URL_BASE/polizas/activas
```

### Q10: Pólizas Suspendidas
```bash
curl URL_BASE/polizas/suspendidas
```

### Q11: Clientes con Múltiples Vehículos Asegurados
```bash
curl URL_BASE/clientes/multiples-vehiculos
```

### Q12: Agentes y Cantidad de Siniestros
```bash
curl URL_BASE/agentes/cantidad-siniestros
```

---

# ⚙️ Q13–Q15: Operaciones de Escritura

## Q13: ABM de Clientes

### Alta (Crear Cliente)
```bash
curl -X POST URL_BASE/clientes \
-H "Content-Type: application/json" \
-d '{
  "nombre": "Carlos",
  "apellido": "Santana",
  "dni": "36123987",
  "email": "carlos.santana@email.com",
  "telefono": "11-4455-6677",
  "domicilio": {"direccion": "Av. del Libertador 7000", "ciudad": "CABA", "provincia": "Buenos Aires"},
  "vehiculos": [
    {"id_vehiculo": 3001, "marca": "Fiat", "modelo": "Cronos", "anio": 2022, "patente": "AF111AB", "nro_chasis": "CHASIS-CAR-001", "asegurado": true},
    {"id_vehiculo": 3002, "marca": "Renault", "modelo": "Sandero", "anio": 2023, "patente": "AF222CD", "nro_chasis": "CHASIS-CAR-002", "asegurado": true}
  ]
}'
```

### Modificación (Actualizar Cliente 1)
```bash
curl -X PUT URL_BASE/clientes/1 \
-H "Content-Type: application/json" \
-d '{"telefono": "11-9999-8888", "email": "juan.perez.actualizado@email.com"}'
```

### Baja (Borrado Lógico Cliente 2)
```bash
curl -X DELETE URL_BASE/clientes/2
```

---

## Q14: Alta de Siniestro
```bash
curl -X POST URL_BASE/siniestros \
-H "Content-Type: application/json" \
-d '{
  "nro_poliza": "POL1004",
  "fecha": "2025-11-13T18:00:00Z",
  "tipo": "robo",
  "monto": 150000,
  "descripcion": "Robo de unidad en garage",
  "estado": "abierto"
}'
```

---

## Q15: Emisión de Póliza
```bash
curl -X POST URL_BASE/polizas \
-H "Content-Type: application/json" \
-d '{
  "nro_poliza": "POL1004",
  "id_cliente": 3,
  "id_agente": 101,
  "tipo": "hogar",
  "fecha_inicio": "2025-11-15T00:00:00Z",
  "fecha_vencimiento": "2026-11-15T00:00:00Z",
  "monto_prima": 7500,
  "monto_cobertura": 20000000,
  "estado": "activa"
}'
```
