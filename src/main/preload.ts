import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'get-services' | 'add-service' | 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    // Send message to main process
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },

    // Listen for messages from the main process
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },

    // Listen for a message from the main process only once
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    getServices: () => ipcRenderer.invoke('get-services'),
    getServiceById: (serviceId: number) =>
      ipcRenderer.invoke('get-service', serviceId),
    addService: (
      name: string,
      description: string,
      personIds: number[],
      serviceTypeIds: number[],
    ) =>
      ipcRenderer.invoke(
        'add-service',
        name,
        description,
        personIds,
        serviceTypeIds,
      ),
    updateService: (
      serviceId: number,
      name: string,
      description: string,
      status: string,
      personIds: number[],
      serviceTypeIds: number[],
    ) =>
      ipcRenderer.invoke(
        'update-service',
        serviceId,
        name,
        description,
        status,
        personIds,
        serviceTypeIds,
      ),
    getPersons: () => ipcRenderer.invoke('get-persons'),
    getServiceTypes: () => ipcRenderer.invoke('get-service-types'),
    addPerson: (name: string) => ipcRenderer.invoke('add-person', name),
    addServiceType: (name: string) =>
      ipcRenderer.invoke('add-service-type', name),
    addServiceMessage: (text: string, serviceId: number) =>
      ipcRenderer.invoke('add-service-message', text, serviceId),
    getServiceMessages: (serviceId: number) =>
      ipcRenderer.invoke('get-service-messages', serviceId),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
