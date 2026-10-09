import { useRef } from 'react';
import { IonDatetime } from '@ionic/react';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

interface RangeExampleProps {
  selectedDates: string[];
  setSelectedDates: (dates: string[]) => void;
}

/**
 * Selector de rango de fechas.
 * `endpoints` se guarda en useRef porque es un valor auxiliar de cálculo
 * que no necesita disparar re-renders (rerender-state-only-in-handlers).
 */
export function RangeExample({ selectedDates, setSelectedDates }: RangeExampleProps) {
  // useRef: endpoints es un cursor de estado interno, no necesita re-render
  const endpointsRef = useRef<string[]>([]);

  const handleDateChange = (ev: CustomEvent) => {
    const value = ev.detail.value;
    const lastClicked = Array.isArray(value) ? value[value.length - 1] : value;

    if (!lastClicked) {
      endpointsRef.current = [];
      setSelectedDates([]);
      return;
    }

    const endpoints = endpointsRef.current;

    // Rango completo o clic repetido en el mismo extremo → resetear
    if (endpoints.length === 2 || (endpoints.length === 1 && endpoints[0] === lastClicked)) {
      endpointsRef.current = [lastClicked];
      setSelectedDates([lastClicked]);
    }
    // Segundo extremo del rango
    else if (endpoints.length === 1) {
      const start = parseISO(endpoints[0]);
      const end = parseISO(lastClicked);

      const intervalStart = start < end ? start : end;
      const intervalEnd = start < end ? end : start;

      const fullRange = eachDayOfInterval({
        start: intervalStart,
        end: intervalEnd,
      }).map(d => format(d, 'yyyy-MM-dd'));

      endpointsRef.current = [endpoints[0], lastClicked];
      setSelectedDates(fullRange);
    }
    // Primer clic
    else {
      endpointsRef.current = [lastClicked];
      setSelectedDates([lastClicked]);
    }
  };

  return (
    <IonDatetime
      presentation="date"
      multiple={true}
      value={selectedDates}
      onIonChange={handleDateChange}
    />
  );
}
