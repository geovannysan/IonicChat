export const STATUS_OPTIONS: SelectOption[] = [
  { id: "abierto", name: "Abierto" },
  { id: "asignado", name: "Asignado" },
  { id: "en_progreso", name: "En Progreso" },
  { id: "en_espera_cliente", name: "Esperando Cliente" },
  { id: "resuelto", name: "Resuelto" },
  { id: "cerrado", name: "Cerrado" },
  { id: "cancelado", name: "Cancelado" },
  { id: "pendiente", name: "Pendiente" },
];

export interface SelectOption {
  id: string | number;
  name: string;
}
