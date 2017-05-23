const url = require('url');
const path = require('path');

const {app, ipcMain, BrowserWindow, Tray, nativeImage} = require('electron');

var createWindow = (function () {

  let browserWindow = null;
  let icon = nativeImage.createFromPath(path.normalize(`${__dirname}/icon/icon.png`));

  return function CreateWindow() {
    if (!browserWindow) {
      // Creates the tray icon.
      let tray = new Tray(icon);

      // Creates the browser window. 
      let browserWindow = new BrowserWindow({
        icon: icon,
        width: 800,
        height: 600,
        center: true
      });

      // and load the index.html of the app.
      // browserWindow.loadURL(`file://${__dirname}/www/index.html`)

      browserWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'www/index.html'),
        protocol: 'file:',
        slashes: true
      }));

      // Open the DevTools.
      // browserWindow.webContents.openDevTools();

      browserWindow.webContents.on('did-finish-load', () => {
        browserWindow.webContents.send('window-resized', browserWindow.getContentSize());
      });
      
      browserWindow.on('resize',  () => {
        browserWindow.webContents.send('window-resized', browserWindow.getContentSize());
      });

      browserWindow.on('closed', () => {
        browserWindow = null;
      });
    };
  }

})();

app.on('ready', () => {
  createWindow();
});

app.on('activate',  () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Checking bi-directionnal messages from and to ui
ipcMain.on('message-from-ui', (event, data) => {
  setTimeout(() => {
    if (event.sender) {
      try {
        event.sender.send('message-from-electron', 'Hello WebKit !');
      } catch(e) {
        // BrowserWindow seems to be gone...
      };
    }
  }, 1000);
});
