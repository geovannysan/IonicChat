import React from 'react';
import { Redirect } from 'react-router-dom';
import { IonSpinner, IonContent } from '@ionic/react';
import { useAuthContext } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuth, loading, user } = useAuthContext();

  if (loading) {
    return (
      <IonContent className="ion-padding">
        <div className="flex justify-center items-center h-full">
          <IonSpinner name="crescent" />
        </div>
      </IonContent>
    );
  }

  if (!isAuth) {
    return <Redirect to="/login" />;
  }

  // Verificar roles si se especifican
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return (
      <IonContent className="ion-padding">
        <div className="text-center">
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder a esta sección.</p>
        </div>
      </IonContent>
    );
  }

  return <>{children}</>;
};
