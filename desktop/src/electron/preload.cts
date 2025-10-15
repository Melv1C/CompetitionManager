const electron = require('electron')

electron.contextBridge.exposeInMainWorld('electron', {
    importCompetition: (competition) => ipcInvoke('importCompetition', competition),
    importAthletes: (inscriptions, competitionId) => ipcInvoke('importAthletes', inscriptions, competitionId),
    exportCompetition: async () => await ipcInvoke('exportCompetition'),
} satisfies Window['electron'])

function ipcInvoke<Key extends keyof EventPayloadMapping>(
    key: Key,
    ...args: any[]
): Promise<EventPayloadMapping[Key]> {
    return electron.ipcRenderer.invoke(key, ...args);
}

function ipcOn<Key extends keyof EventPayloadMapping>(
    key: Key,
    callback: (payload: EventPayloadMapping[Key]) => void,
) {
    //@ts-ignore
    electron.ipcRenderer.on(key, (_, payload) => callback(payload));
}