# Frontend - Ala Burguer

Panel de administración y repartidores para el restaurante.

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

3. Configurar las variables de entorno en `.env`:
- `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: Clave anónima de Supabase
- `VITE_API_URL`: URL del backend (default: http://localhost:3001)

## Ejecutar

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run preview
```

## Estructura

```
src/
├── components/        # Componentes reutilizables
│   ├── admin/        # Componentes del panel admin
│   └── rider/        # Componentes del panel rider
├── contexts/         # Contextos de React
├── lib/              # Utilidades y configuraciones
├── pages/            # Páginas de la aplicación
│   ├── admin/        # Páginas del panel admin
│   ├── rider/        # Páginas del panel rider
│   └── Login.jsx     # Página de login
└── App.jsx           # Componente principal
```

## Características

### Panel de Administración
- Dashboard con resumen de ventas
- Gestión de productos (CRUD)
- Gestión de pedidos y asignación de repartidores
- Gestión de repartidores
- Reportes financieros

### Panel de Repartidores
- Vista de pedidos asignados
- Actualización de estado de pedidos
- Información de cliente y dirección

## Tecnologías

- React 18
- React Router DOM
- Tailwind CSS 4
- Supabase Client
- Axios (para llamadas API)
