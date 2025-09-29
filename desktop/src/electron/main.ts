import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { connectAmDb } from './connect-am.js';
import { getPrealoadPath } from './pathResolver.js';
import { ipcHandler } from './utils.js';
import { getResults, listenToResultsChanges } from './utils/exportCompetition.js';

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
  connectAmDb();

  ipcHandler('getResults', async () => {
    return getResults();
  });

  listenToResultsChanges(mainWindow);
});
