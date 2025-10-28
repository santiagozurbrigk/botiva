-- Verificar si el campo payment_status existe en la tabla orders
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'payment_status';
