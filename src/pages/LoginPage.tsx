/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonInput,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonLoading,
  IonToast
} from '@ionic/react';
import { useAuthContext } from '../contexts/AuthContext';
import { useHistory } from 'react-router';
import { Button } from '@/components/ui/Button';
import apiService from '@/services/api';

const LoginPage: React.FC = () => {
  const history = useHistory()
  const [user, setUser] = useState({ email: "", password: "" });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { handleLogin, loading, setUser: setuserLogin } = useAuthContext();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    const users = localStorage.getItem("user")
    if (token) {
      (async () => {
        try {

          apiService.setToken(token);

          history.push("/tabs/chat");
          setuserLogin(JSON.parse(users ?? ""))
        } catch (err: any) {
          const errorData = err?.response?.data;
          if (errorData?.mensaje === "ERR_SESSION_EXPIRED" ||
            errorData?.mensaje === "Token inválido") {
            localStorage.removeItem("token");

            history.push("/login");
          }
        }
      })();
    }
    // exhaustive-deps: history y setuserLogin son referencias estables
    // (history viene de useHistory, setuserLogin es el setter del contexto),
    // se incluyen para satisfacer la regla sin riesgo de re-ejecución inesperada.
  }, [history, setuserLogin]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await handleLogin(user);
      history.push("/tabs/chat");
    } catch {
      setToastMessage("HUBO UN ERROR AL INICIAR SESIÓN, VERIFIQUE SUS CREDENCIALES");
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="flex h-screen w-full items-center justify-center p-1">
          <div className="w-full max-w-sm">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Entra a tu cuenta</IonCardTitle>
                <IonText color="medium">
                  <p>Ingrese su correo electrónico a continuación para iniciar sesión en su cuenta</p>
                </IonText>
              </IonCardHeader>
              <IonCardContent>
                <form onSubmit={handleSubmit}>
                  <IonItem className="ion-margin-bottom">
                    <IonLabel position="stacked">Email</IonLabel>
                    <IonInput
                      type="email"
                      name="email"
                      value={user.email}
                      placeholder="usuario@mail.com"
                      required
                      onIonInput={handleChange}
                    />
                  </IonItem>

                  <IonItem className="ion-margin-bottom">
                    <IonLabel position="stacked">Password</IonLabel>
                    <IonInput
                      type="password"
                      name="password"
                      value={user.password}
                      placeholder="***********"
                      required
                      onIonInput={handleChange}
                    />
                  </IonItem>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="ion-margin-top"
                  >
                    Login
                  </Button>
                </form>
              </IonCardContent>
            </IonCard>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Iniciando sesión..." />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
