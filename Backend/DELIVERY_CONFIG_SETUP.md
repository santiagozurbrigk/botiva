# Configuración de Entrega - Instrucciones de Instalación

## 1. Ejecutar la migración de la base de datos

Ejecuta el siguiente SQL en tu panel de Supabase (SQL Editor):

```sql
-- Migración para agregar configuración de entrega
-- Esta tabla almacena la configuración global de tiempo de demora y costo de envío

CREATE TABLE IF NOT EXISTS delivery_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_time_minutes INTEGER NOT NULL DEFAULT 30,
    delivery_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO delivery_config (delivery_time_minutes, delivery_cost, is_active) 
VALUES (30, 0.00, true)
ON CONFLICT DO NOTHING;

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_delivery_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_delivery_config_updated_at
    BEFORE UPDATE ON delivery_config
    FOR EACH ROW
    EXECUTE FUNCTION update_delivery_config_updated_at();

-- Políticas RLS para delivery_config
ALTER TABLE delivery_config ENABLE ROW LEVEL SECURITY;

-- Solo los administradores pueden leer y modificar la configuración
CREATE POLICY "Admins can manage delivery config" ON delivery_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.auth_user_id = auth.uid()
        )
    );

-- Agregar comentarios a la tabla
COMMENT ON TABLE delivery_config IS 'Configuración global de entrega (tiempo de demora y costo)';
COMMENT ON COLUMN delivery_config.delivery_time_minutes IS 'Tiempo de demora en minutos';
COMMENT ON COLUMN delivery_config.delivery_cost IS 'Costo de envío en la moneda local';
COMMENT ON COLUMN delivery_config.is_active IS 'Indica si esta configuración está activa';
```

## 2. Reiniciar el backend

Después de ejecutar la migración, reinicia el backend:

```bash
cd Backend
npm run dev
```

## 3. Funcionalidades agregadas

### Panel de Administrador
- **Nueva sección "Configuración"** en el menú lateral
- **Configuración de entrega** con campos para:
  - Tiempo de demora (en minutos)
  - Costo de envío (en la moneda local)
- **Historial de configuraciones** para ver cambios anteriores
- **Validación** de datos (valores no negativos)

### Página de Pedidos
- **Banner informativo** que muestra la configuración actual
- **Enlace directo** para cambiar la configuración
- **Información en tiempo real** del tiempo de demora y costo

### API Endpoints
- `GET /api/delivery-config` - Obtener configuración actual
- `PUT /api/delivery-config` - Actualizar configuración
- `GET /api/delivery-config/history` - Obtener historial

## 4. Características técnicas

- **Solo administradores** pueden modificar la configuración
- **Sistema de versionado** - cada cambio crea un nuevo registro
- **Configuración activa** - solo una configuración puede estar activa a la vez
- **Políticas RLS** para seguridad a nivel de fila
- **Validación** tanto en frontend como backend

## 5. Uso

1. Ve a **Configuración** en el panel de administrador
2. Modifica el **tiempo de demora** y **costo de envío**
3. Haz clic en **"Guardar Configuración"**
4. La nueva configuración se aplicará inmediatamente
5. Puedes ver el **historial** de cambios anteriores

La configuración se muestra en la página de pedidos para que siempre tengas visibilidad de los valores actuales.
