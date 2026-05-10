export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
}

export interface CategoryForm {
  name: string;
  color: string;
  icon: string;
}

export const AVAILABLE_ICONS = [
  { value: 'utensils', label: 'Comida' },
  { value: 'car', label: 'Transporte' },
  { value: 'heart-pulse', label: 'Salud' },
  { value: 'film', label: 'Entretenimiento' },
  { value: 'home', label: 'Hogar' },
  { value: 'shopping-cart', label: 'Compras' },
  { value: 'briefcase', label: 'Trabajo' },
  { value: 'ellipsis', label: 'Otros' },
];
