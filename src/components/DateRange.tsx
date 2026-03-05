import React, { useState } from 'react';
import { IonDatetime } from '@ionic/react';
import { format, addDays, isBefore, isAfter, eachDayOfInterval, parseISO } from 'date-fns';

export function RangeExample({ selectedDates, setSelectedDates }: { selectedDates: string[], setSelectedDates: (dates: string[]) => void }) {

  // Guardamos solo los clics reales del usuario (inicio y fin)
  const [endpoints, setEndpoints] = useState<string[]>([]);

  const handleDateChange = (ev: CustomEvent) => {
    const value = ev.detail.value;
    // Extraemos la última fecha sobre la que el usuario hizo clic
    const lastClicked = Array.isArray(value) ? value[value.length - 1] : value;

    if (!lastClicked) {
      setEndpoints([]);
      setSelectedDates([]);
      return;
    }

    // CASO 1: Si ya había 2 fechas (rango completo) o clic en la misma fecha B
    // Reiniciamos y esa fecha pasa a ser el nuevo "Punto A"
    if (endpoints.length === 2 || (endpoints.length === 1 && endpoints[0] === lastClicked)) {
      setEndpoints([lastClicked]);
      setSelectedDates([lastClicked]);
    } 
    // CASO 2: Tenemos un Punto A y elegimos un Punto B
    else if (endpoints.length === 1) {
      const start = parseISO(endpoints[0]);
      const end = parseISO(lastClicked);

      // Ordenamos cronológicamente
      const intervalStart = start < end ? start : end;
      const intervalEnd = start < end ? end : start;

      const fullRange = eachDayOfInterval({
        start: intervalStart,
        end: intervalEnd
      }).map(d => format(d, 'yyyy-MM-dd'));

      setEndpoints([endpoints[0], lastClicked]); // Guardamos los dos puntos
      setSelectedDates(fullRange); // Pintamos todo el rango
    } 
    // CASO 3: Primer clic de la historia
    else {
      setEndpoints([lastClicked]);
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
};