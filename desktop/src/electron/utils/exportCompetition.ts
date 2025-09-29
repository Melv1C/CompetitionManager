import { BrowserWindow } from 'electron';
import { dbLocal } from '../connect-am.js';
import { ipcWebContentsSend } from '../utils.js';

export const getResults = async () => {
  try {
    const result = await dbLocal.query('SELECT * FROM results');
    return result.rows;
  } catch (err: any) {
    console.error(err);
    return [];
  }
};

export const listenToResultsChanges = (mainWindow: BrowserWindow) => {
  setInterval(async () => {
    const result = await dbLocal.query('SELECT * FROM results');
    ipcWebContentsSend('result', mainWindow.webContents, result.rows[0].count as number);
  }, 5000);
};
