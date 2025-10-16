import { app, BrowserWindow } from 'electron';
import path from 'path';
import { getPrealoadPath } from './pathResolver.js';
import { ipcHandler } from './utils.js';
import { exportCompetition } from './functions/export.js';
import { importAthletes, importCompetition } from './functions/import.js';
import dotenv from 'dotenv';
dotenv.config();

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: getPrealoadPath(),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5000');
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
  }

  ipcHandler('importCompetition', importCompetition);

  ipcHandler('importAthletes', importAthletes);

  ipcHandler('exportCompetition', exportCompetition);
});
