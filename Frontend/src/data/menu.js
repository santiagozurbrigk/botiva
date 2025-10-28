// Datos de productos con categorías dinámicas
export const getAllProducts = () => {
  return [
    // Hamburguesas (categoryId: 1)
    {
      id: 1,
      name: "Clásica Ala-Burguer",
      description: "Hamburguesa tradicional con carne de res, lechuga, tomate, cebolla y nuestra salsa especial",
      price: 1200,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
      categoryId: 1
    },
    {
      id: 2,
      name: "Doble Carne",
      description: "Doble porción de carne de res, queso cheddar, lechuga, tomate y salsa BBQ",
      price: 1800,
      image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop",
      categoryId: 1
    },
    {
      id: 3,
      name: "Pollo Crispy",
      description: "Pechuga de pollo empanizada, lechuga, tomate, mayonesa y salsa de ajo",
      price: 1400,
      image: "https://images.unsplash.com/photo-1606755962773-d324e9f8b6b1?w=400&h=300&fit=crop",
      categoryId: 1
    },
    {
      id: 4,
      name: "Vegetariana",
      description: "Medallón de quinoa y vegetales, lechuga, tomate, cebolla morada y salsa tahini",
      price: 1300,
      image: "https://images.unsplash.com/photo-1525059696034-4967a729002e?w=400&h=300&fit=crop",
      categoryId: 1
    },
    {
      id: 5,
      name: "Bacon Deluxe",
      description: "Carne de res, queso cheddar, bacon crujiente, lechuga, tomate y salsa especial",
      price: 1600,
      image: "https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400&h=300&fit=crop",
      categoryId: 1
    },
    {
      id: 6,
      name: "Picante Mexicana",
      description: "Carne de res, jalapeños, queso pepper jack, lechuga, tomate y salsa picante",
      price: 1500,
      image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=300&fit=crop",
      categoryId: 1
    },

    // Combos (categoryId: 2)
    {
      id: 7,
      name: "Combo Clásico",
      description: "Hamburguesa Clásica + Papas fritas + Bebida",
      price: 1800,
      image: "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400&h=300&fit=crop",
      categoryId: 2
    },
    {
      id: 8,
      name: "Combo Doble",
      description: "Hamburguesa Doble Carne + Papas fritas + Bebida",
      price: 2400,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      categoryId: 2
    },
    {
      id: 9,
      name: "Combo Familiar",
      description: "2 Hamburguesas Clásicas + 2 Papas fritas + 2 Bebidas",
      price: 3200,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      categoryId: 2
    },

    // Bebidas (categoryId: 3)
    {
      id: 10,
      name: "Coca Cola",
      description: "Bebida gaseosa de 500ml",
      price: 500,
      image: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
      categoryId: 3
    },
    {
      id: 11,
      name: "Jugo de Naranja",
      description: "Jugo natural de naranja 300ml",
      price: 600,
      image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop",
      categoryId: 3
    },
    {
      id: 12,
      name: "Agua Mineral",
      description: "Agua mineral natural 500ml",
      price: 300,
      image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop",
      categoryId: 3
    },

    // Nuggets (categoryId: 4)
    {
      id: 13,
      name: "Nuggets de Pollo",
      description: "6 piezas de nuggets de pollo crujientes",
      price: 800,
      image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop",
      categoryId: 4
    },
    {
      id: 14,
      name: "Nuggets Picantes",
      description: "6 piezas de nuggets de pollo con especias",
      price: 850,
      image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop",
      categoryId: 4
    },
    {
      id: 15,
      name: "Nuggets de Queso",
      description: "6 piezas de nuggets rellenos de queso",
      price: 900,
      image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop",
      categoryId: 4
    }
  ];
};

// Función para obtener productos por categoría
export const getProductsByCategory = (categoryId) => {
  return getAllProducts().filter(product => product.categoryId === categoryId);
};