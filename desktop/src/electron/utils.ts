import { ipcMain } from 'electron';

export function ipcHandler<Key extends keyof EventPayloadMapping>(
  key: Key,
  handler: () => EventPayloadMapping[Key],
) {
  ipcMain.handle(key, handler);
}

export function ipcWebContentsSend<Key extends keyof EventPayloadMapping>(
  key: Key,
  webContents: Electron.WebContents,
  payload: EventPayloadMapping[Key],
) {
  webContents.send(key, payload);
}
