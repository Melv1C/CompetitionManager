import { ipcMain } from 'electron';

export function ipcHandler<Key extends keyof EventPayloadMapping>(
  key: Key,
  handler: (...args: any[]) => EventPayloadMapping[Key],
) {
  ipcMain.handle(key, (_event, ...arg) => handler(...arg));
}

export function ipcWebContentsSend<Key extends keyof EventPayloadMapping>(
  key: Key,
  webContents: Electron.WebContents,
  payload: EventPayloadMapping[Key],
) {
  webContents.send(key, payload);
}
