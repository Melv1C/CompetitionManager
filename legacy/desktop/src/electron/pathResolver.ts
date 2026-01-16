import { app } from 'electron';
import path from 'path';

export function getPreloadPath() {
  return path.join(
    app.getAppPath(),
    process.env.NODE_ENV === 'development' ? '.' : '..',
    '/dist-electron/preload.cjs',
  );
}
