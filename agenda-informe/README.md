# Agenda Informe

Aplicación de escritorio para Windows: planifica tu semana día a día y genera un informe PDF ordenado para tu jefe.

## Funciones

- **Configuración inicial**: al instalar, ingresas tu nombre, cargo, departamento, email, empresa y el nombre de tu jefe.
- **Agenda semanal**: ingresa actividades por día (hora, título y detalle opcional).
- **Informe PDF**: genera un documento profesional con tus datos, la agenda completa y un resumen.

## Requisitos

- Windows 10 o superior
- Node.js 20+ (solo para desarrollo)

## Desarrollo

```bash
cd agenda-informe
npm install
npm run dev
```

## Generar instalador Windows (.exe)

```bash
cd agenda-informe
npm install
npm run dist:win
```

El instalador quedará en `agenda-informe/release/`.

## Uso

1. Abre la aplicación e ingresa tus datos personales (solo la primera vez).
2. Navega por los días de la semana y agrega tus actividades.
3. Pulsa **Generar informe PDF** y elige dónde guardarlo.
4. Envía el PDF a tu jefe.

Los datos se guardan localmente en tu equipo (`%APPDATA%/agenda-informe`).
