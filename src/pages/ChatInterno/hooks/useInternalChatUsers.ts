import { useState, useCallback, useEffect } from 'react';
import chatMessagesService from '../services/chat-messages.service';
import type { ChatInternalUser } from '../models/chat-message.interface';

interface UseInternalChatUsersReturn {
  users: ChatInternalUser[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredUsers: ChatInternalUser[];
}

/**
 * Hook con responsabilidad única: cargar y filtrar la lista de
 * usuarios con quienes el usuario autenticado puede chatear.
 */
export function useInternalChatUsers(): UseInternalChatUsersReturn {
  const [users, setUsers] = useState<ChatInternalUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // El backend devuelve la lista de usuarios del workspace.
      // Adaptamos la respuesta al shape ChatInternalUser.
      const result = await chatMessagesService.getUsers(1);
      // getUsers puede devolver array directo o { users: [] }
      const raw = Array.isArray(result) ? result : (result as { users?: ChatInternalUser[] }).users ?? [];

      const mapped: ChatInternalUser[] = raw.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        profile: u.profile ?? '',
      }));
      setUsers(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error cargando usuarios';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter((u) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return {
    users,
    isLoading,
    error,
    refresh: loadUsers,
    searchTerm,
    setSearchTerm,
    filteredUsers,
  };
}
