import { useState } from "react";
import apiService from "@/services/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLocation } from "@/hooks/useLocation";

export type ProfileTab = "perfil" | "configuracion" | "apariencia";

/**
 * Centraliza toda la lógica de UserProfilePage:
 *  - tabs
 *  - cambio de cuenta (ActionSheet)
 *  - toggle de notificaciones push
 *  - logout
 */
export function useUserProfile() {
  const { error: locationError } = useLocation();
  const { user, setUser, handleLogout, handleCuenta } = useAuthContext();

  const [activeTab, setActiveTab]           = useState<ProfileTab>("perfil");
  const [showAccountSheet, setShowAccountSheet] = useState(false);

  /**
   * Actualiza la preferencia de notificaciones push en el backend
   * y refresca el usuario en el contexto/localStorage.
   */
  const updatePushInDB = async (enabled: boolean) => {
    try {
      const account = user.selectedAccount;
      if (!account) return;

      await apiService.UpdatePerfil(account.id, { isPush: enabled });
      const newUser = await apiService.updateUser(user.id, {
        chatperfliid: account.accountId,
      });
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error("Error actualizando preferencia push:", error);
    }
  };

  /** Cuentas disponibles para cambiar (excluye la activa) */
  const otherAccounts: Array<{
    userId: number;
    accountId: string;
    account: { nombre: string };
  }> = (user?.cuenta ?? []).filter(
    (elm: { accountId: string }) => elm.accountId !== user.perfil,
  );

  /** Nombre de la cuenta activa */
  const activeAccountName: string =
    user?.cuenta?.find(
      (elm: { accountId: string }) => elm.accountId === user.perfil,
    )?.account?.nombre ?? "Cuenta";

  return {
    // Auth / user
    user,
    handleLogout,
    handleCuenta,
    // Tabs
    activeTab,
    setActiveTab,
    // Account sheet
    showAccountSheet,
    setShowAccountSheet,
    otherAccounts,
    activeAccountName,
    // Push notifications
    updatePushInDB,
    locationError,
  };
}
