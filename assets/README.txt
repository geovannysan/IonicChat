# HealdChat - Capacitor Assets

Estos recursos se generaron a partir de las dos imágenes proporcionadas.

## Archivos
- `icon-only.png`: icono completo para recursos de launcher heredados.
- `icon-foreground.png`: símbolo extraído para el icono adaptativo de Android.
- `icon-background.png`: fondo azul marino para el icono adaptativo.
- `splash.png`: logotipo completo centrado sobre fondo blanco para la pantalla de inicio.

## Instalación
1. Copia la carpeta `assets` dentro de la raíz de tu proyecto Ionic/Capacitor.
2. Instala la herramienta si todavía no está instalada:
   `npm install -D @capacitor/assets`
3. Genera los recursos Android:
   `npx capacitor-assets generate --android`
4. Sincroniza:
   `npx cap sync android`

La estructura esperada es:
```
tu-proyecto/
  assets/
    icon-only.png
    icon-foreground.png
    icon-background.png
    splash.png
```

Si tu proyecto ya tiene una carpeta `assets`, respalda sus archivos antes de reemplazarlos.
El splash generado usa fondo blanco para conservar la identidad visual del logotipo original.
