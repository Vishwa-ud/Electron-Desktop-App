const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

//process.env.NODE_ENV = 'production';//set to production uncoment to test in production

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;

// Main Window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'ImageResizer',
    width: isDev ? 1000 : 500,
    height: 600,

    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }

  });

  // Show devtools automatically if in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

    // mainWindow.loadURL(`file://${__dirname}/renderer/index.html`);
   mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

//Create About Window
function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: 'About Image Resizer',
    width: 300,
    height: 300,
  });

  aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

// When the app is ready, create the window
app.on('ready', () => {
  createMainWindow();

  //Implement Menu
  const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

  // Remove variable from memory
  mainWindow.on('closed', () => (mainWindow = null));
});


// Open a window if none are open (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

// Menu template
const menu = [
  ...(isMac ? [{ 
    label: app.name,
    submenu: [
      {
        label: 'About',
        click: createAboutWindow
      }
    ]
  
  }] : []),
  {
      role : 'fileMenu',     
  },
  {
      label: 'Help', // Add a Help menu item
      submenu: [
          {
              label: 'About',
              click: createAboutWindow // Assign createAboutWindow function to open About window
          }
      ]
  },
  ...(isMac ? [{
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: createAboutWindow
      }
    ]
  }] : [])
];

// Respond to ipcRenderer resize
ipcMain.on('image-resize', (e, options) => {
  options.dest = path.join(os.homedir(), 'imagesresizer');
  resizeImage(options);
});

// Resize the image
async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width : +width,
      height : +height
    });
    //create filename
    const filename = path.basename(imgPath);

    //create dest folder if no exists
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    // write file to dest folder
    fs.writeFileSync(path.join(dest, filename), newPath);

    // Send success message
    mainWindow.webContents.send('image:done');

    //open dest folder
    shell.openPath(dest);

  } catch (error) {
    console.log(error);
    
  }

}



// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if (!isMac) app.quit();
  });
