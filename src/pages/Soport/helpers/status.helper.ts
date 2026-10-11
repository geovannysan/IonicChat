export const getStatusStyle = (status: string = '') => {
  switch (status?.toLowerCase()) {
    case 'abierto':     return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
    case 'asignado':    return 'bg-blue-500/10 text-blue-600 border-blue-200';
    case 'en_progreso': return 'bg-amber-500/10 text-amber-600 border-amber-200';
    case 'resuelto':    return 'bg-primary/10 text-primary border-primary/30';
    case 'cerrado':     return 'bg-muted text-muted-foreground border-border';
    default:            return 'bg-secondary text-secondary-foreground border-border';
  }
};
export const getStyleMarquer = (status: string = ''): string => {
  switch (status.toLowerCase()) {
    case 'abierto':
      return 'fill-blue-500 stroke-blue-800 dark:fill-blue-400 dark:stroke-blue-200';

    case 'asignado':
      return 'fill-violet-500 stroke-violet-800 dark:fill-violet-400 dark:stroke-violet-200';

    case 'en_progreso':
      return 'fill-amber-500 stroke-amber-800 dark:fill-amber-400 dark:stroke-amber-200';

    case 'resuelto':
      return 'fill-emerald-500 stroke-emerald-800 dark:fill-emerald-400 dark:stroke-emerald-200';

    case 'cerrado':
      return 'fill-slate-500 stroke-slate-800 dark:fill-slate-400 dark:stroke-slate-200';

    default:
      return 'fill-gray-500 stroke-gray-800 dark:fill-gray-400 dark:stroke-gray-200';
  }
};

export const getPriorityDot = (priority: string | null='') => {
  switch (priority?.toLowerCase()) {
    case 'alta':  return 'bg-red-500/10 text-red-600 border-red-200';
    case 'media': return 'bg-amber-500/10 text-amber-600 border-amber-200';
    case 'baja':  return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
    case null:  return 'bg-red-500/10 text-red-600 border-red-200';
    default:      return 'bg-secondary text-secondary-foreground border-border';
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────


