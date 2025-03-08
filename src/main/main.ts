/* eslint global-require: off, no-console: off, promise/always-return: off */

import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Database from 'better-sqlite3'; // Correct import
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
const dbPath = path.join(__dirname, 'services.db');

const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS persons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS service_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type_name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS service_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER,
  text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS service_persons (
  service_id INTEGER,
  person_id INTEGER,
  PRIMARY KEY (service_id, person_id),
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS service_service_types (
  service_id INTEGER,
  service_type_id INTEGER,
  PRIMARY KEY (service_id, service_type_id),
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE CASCADE
);
`);

ipcMain.handle('get-services', (): Promise<any[]> => {
  const stmt = db.prepare(`
    SELECT services.id, services.name, services.description, services.created_at, services.status,
           GROUP_CONCAT(DISTINCT persons.name) AS persons,
           GROUP_CONCAT(DISTINCT service_types.type_name) AS types
    FROM services
    LEFT JOIN service_persons ON services.id = service_persons.service_id
    LEFT JOIN persons ON service_persons.person_id = persons.id
    LEFT JOIN service_service_types ON services.id = service_service_types.service_id
    LEFT JOIN service_types ON service_service_types.service_type_id = service_types.id
    GROUP BY services.id
  `);
  return Promise.resolve(stmt.all());
});

ipcMain.handle('get-service', async (_event, id) => {
  const serviceStmt = db.prepare('SELECT * FROM services WHERE id = ?');
  const personsStmt = db.prepare(`
    SELECT p.id, p.name FROM persons p
    JOIN service_persons sp ON p.id = sp.person_id
    WHERE sp.service_id = ?
  `);
  const serviceTypesStmt = db.prepare(`
    SELECT st.id, st.type_name FROM service_types st
    JOIN service_service_types sst ON st.id = sst.service_type_id
    WHERE sst.service_id = ?
  `);

  const service = serviceStmt.get(id);
  if (!service) return null;

  const persons = personsStmt.all(id);
  const serviceTypes = serviceTypesStmt.all(id);

  return { ...service, persons, serviceTypes };
});

ipcMain.handle(
  'add-service',
  async (event, serviceName, description, serviceTypeIds, personIds) => {
    const transaction = db.transaction(() => {
      const insertService = db.prepare(
        "INSERT INTO services (name, description, status) VALUES (?, ?, 'PENDIENTE')",
      );
      const insertServicePerson = db.prepare(
        'INSERT INTO service_persons (service_id, person_id) VALUES (?, ?)',
      );
      const insertServiceType = db.prepare(
        'INSERT INTO service_service_types (service_id, service_type_id) VALUES (?, ?)',
      );

      const serviceResult = insertService.run(serviceName, description);
      const serviceId = serviceResult.lastInsertRowid;

      personIds.forEach((personId) =>
        insertServicePerson.run(serviceId, personId),
      );
      serviceTypeIds.forEach((typeId) =>
        insertServiceType.run(serviceId, typeId),
      );

      return { id: serviceId, name: serviceName, description };
    });

    return transaction();
  },
);

ipcMain.handle(
  'update-service',
  async (
    event,
    serviceId,
    serviceName,
    description,
    status,
    personIds,
    serviceTypeIds,
  ) => {
    const transaction = db.transaction(() => {
      const updateService = db.prepare(
        'UPDATE services SET name = ?, description = ?, status = ? WHERE id = ?',
      );
      const deleteServicePersons = db.prepare(
        'DELETE FROM service_persons WHERE service_id = ?',
      );
      const insertServicePerson = db.prepare(
        'INSERT INTO service_persons (service_id, person_id) VALUES (?, ?)',
      );
      const deleteServiceTypes = db.prepare(
        'DELETE FROM service_service_types WHERE service_id = ?',
      );
      const insertServiceType = db.prepare(
        'INSERT INTO service_service_types (service_id, service_type_id) VALUES (?, ?)',
      );

      updateService.run(serviceName, description, status, serviceId);
      deleteServicePersons.run(serviceId);
      personIds.forEach((personId) =>
        insertServicePerson.run(serviceId, personId),
      );

      deleteServiceTypes.run(serviceId);
      serviceTypeIds.forEach((typeId) =>
        insertServiceType.run(serviceId, typeId),
      );

      return { serviceId, serviceName, description, serviceTypeIds, personIds };
    });
    return transaction();
  },
);

ipcMain.handle('get-persons', (): Promise<any[]> => {
  const stmt = db.prepare('SELECT * FROM persons');
  return Promise.resolve(stmt.all());
});

ipcMain.handle('add-person', (event, personName): Promise<any> => {
  const stmt = db.prepare('INSERT INTO persons (name) VALUES (?)');
  const result = stmt.run(personName);
  return { id: result.lastInsertRowid, name: personName };
});

ipcMain.handle('get-service-types', (): Promise<any[]> => {
  const stmt = db.prepare('SELECT * FROM service_types');
  return Promise.resolve(stmt.all());
});

ipcMain.handle('add-service-type', (event, serviceTypeName): Promise<any> => {
  const stmt = db.prepare('INSERT INTO service_types (type_name) VALUES (?)');
  const result = stmt.run(serviceTypeName);
  return { id: result.lastInsertRowid, name: serviceTypeName };
});

ipcMain.handle(
  'add-service-message',
  (event, text, serviceId): Promise<any> => {
    const stmt = db.prepare(
      'INSERT INTO service_messages (text, service_id) VALUES (?, ?)',
    );
    const result = stmt.run(text, serviceId);
    return { id: result.lastInsertRowid, text, serviceId };
  },
);

ipcMain.handle('get-service-messages', async (_event, id): Promise<any[]> => {
  const stmt = db.prepare(
    `SELECT * FROM service_messages WHERE service_messages.service_id = ?`,
  );
  return stmt.all(id);
});

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
