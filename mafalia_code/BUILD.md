# Mafalia Code Build Instructions

## Prerequisites
- Node.js 18+ installed
- Python backend available for agent execution

## Project Structure
```
mafalia_code/
├── electron/          # Electron main & preload scripts
├── src/             # React source code
│   ├── components/  # React components
│   ├── api.ts       # Python bridge API client
│   ├── types.ts     # TypeScript definitions
│   └── ...
├── public/          # Static assets
│   └── mafalia-logo.png   # App logo (used in UI and .exe)
├── bridge_api.py    # Python FastAPI server
├── package.json     # Node dependencies
└── BUILD.md         # This file
```

## Install Dependencies
```bash
cd mafalia_code
npm install
```

## Development Mode
Start the Python bridge API first (in another terminal):
```bash
python mafalia_code/bridge_api.py
```

Then start the Electron app:
```bash
cd mafalia_code
npm run dev
```

## Build Production App
```bash
npm run build
```

## Build Standalone .exe
```bash
npm run package
```

The installer will be at: `release/MafaliaCode Setup.exe`

The app logo (`public/mafalia-logo.png`) is automatically included in:
- The Electron window icon
- The built .exe file icon
- The sidebar UI header
