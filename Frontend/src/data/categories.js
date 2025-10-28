// Datos de categorías dinámicas
let categories = [
  {
    id: 1,
    name: 'Hamburguesas',
    description: 'Deliciosas hamburguesas artesanales',
    isActive: true,
    order: 1
  },
  {
    id: 2,
    name: 'Combos',
    description: 'Combos completos con bebida y papas',
    isActive: true,
    order: 2
  },
  {
    id: 3,
    name: 'Bebidas',
    description: 'Refrescantes bebidas y jugos',
    isActive: true,
    order: 3
  },
  {
    id: 4,
    name: 'Nuggets',
    description: 'Crujientes nuggets de pollo',
    isActive: true,
    order: 4
  }
];

// Función para obtener todas las categorías activas
export const getCategories = () => {
  return categories.filter(category => category.isActive).sort((a, b) => a.order - b.order);
};

// Función para obtener todas las categorías (incluyendo inactivas)
export const getAllCategories = () => {
  return categories.sort((a, b) => a.order - b.order);
};

// Función para obtener una categoría por ID
export const getCategoryById = (id) => {
  return categories.find(category => category.id === id);
};

// Función para agregar una nueva categoría
export const addCategory = (categoryData) => {
  const newCategory = {
    id: Date.now(), // ID temporal
    name: categoryData.name,
    description: categoryData.description,
    isActive: true,
    order: categories.length + 1
  };
  categories.push(newCategory);
  return newCategory;
};

// Función para actualizar una categoría
export const updateCategory = (id, categoryData) => {
  const index = categories.findIndex(category => category.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...categoryData };
    return categories[index];
  }
  return null;
};

// Función para eliminar una categoría
export const deleteCategory = (id) => {
  const index = categories.findIndex(category => category.id === id);
  if (index !== -1) {
    categories.splice(index, 1);
    return true;
  }
  return false;
};

// Función para reordenar categorías
export const reorderCategories = (newOrder) => {
  newOrder.forEach((categoryId, index) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      category.order = index + 1;
    }
  });
  return categories.sort((a, b) => a.order - b.order);
};
