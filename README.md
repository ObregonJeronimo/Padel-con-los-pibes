# 🏓 Pádel con los Pibes

App web mobile-first para organizar torneos de pádel con sorteo de equipos, puntos individuales e historial completo.

## Features

- **Torneo de puntos individuales** (6 u 8 jugadores)
  - Sorteo aleatorio de duos con opción de re-sortear (hasta 2 veces)
  - Flujo guiado: la app indica quién juega contra quién
  - Puntos individuales progresivos (+1 por integrante del duo ganador)
  - Rondas ilimitadas con nuevo sorteo entre cada una
  - Tabla de posiciones en tiempo real
  
- **Torneíto de 6**: 3 duos, todos vs todos (3 partidos)
- **Torneíto de 8**: 4 duos, todos vs todos (6 partidos) con formato fase de grupos

- **Sorteo rápido**: sorteo aleatorio para cualquier cantidad de participantes con premios opcionales

- **Historial**: todos los torneos guardados con fecha, hora, puntos y posibilidad de reanudar

## Setup

### 1. Clonar e instalar

```bash
git clone https://github.com/ObregonJeronimo/Padel-con-los-pibes.git
cd Padel-con-los-pibes
npm install
```

### 2. Configurar Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Crear una base de datos Firestore
3. Copiar las credenciales y crear archivo `.env`:

```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
```

### 3. Reglas de Firestore

En Firebase Console > Firestore > Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tournaments/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. Correr en desarrollo

```bash
npm run dev
```

### 5. Deploy en Vercel

Conectar el repo a Vercel y agregar las variables de entorno en la configuración del proyecto.

## Tech Stack

- React 18 + Vite
- Firebase Firestore
- Vercel (hosting)
- CSS custom (mobile-first, dark theme)
