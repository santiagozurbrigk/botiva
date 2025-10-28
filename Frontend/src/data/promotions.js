// Datos del flyer promocional
export const getPromotionFlyer = () => {
  return {
    id: 1,
    title: "Promoción Especial",
    subtitle: "",
    description: "",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1200&h=675&fit=crop",
    isActive: true,
    validUntil: "2024-12-31",
    buttonText: "",
    buttonLink: ""
  };
};

// Función para actualizar el flyer (para el panel de admin)
export const updatePromotionFlyer = (newFlyerData) => {
  // En una implementación real, esto haría una llamada a la API
  // Por ahora, solo retornamos los datos actualizados
  return {
    ...getPromotionFlyer(),
    ...newFlyerData
  };
};
