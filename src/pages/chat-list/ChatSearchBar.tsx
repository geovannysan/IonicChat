import React from 'react';
import { IonSearchbar } from '@ionic/react';

interface ChatSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/** Barra de búsqueda de chats. Extraída de ChatListPage para responsabilidad única. */
export const ChatSearchBar: React.FC<ChatSearchBarProps> = ({ value, onChange }) => (
  <IonSearchbar
    value={value}
    onIonInput={(e) => onChange(e.detail.value!)}
    placeholder="Buscar chats..."
    showClearButton="focus"
  />
);
