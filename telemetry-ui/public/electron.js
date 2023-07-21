/****************
  MAIN PROCESS
*****************/



/**
 * Module dependencies
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { join } = require("path");
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

//Developer shit maje, not for mechatronics jsjs
const isDev = require('electron-is-dev');


/**
 * Creates the main Electron window.
 */
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow(
  {
      width: 1500, 
      height: 680,
      minHeight: 650,
      minWidth: 900,
      show:false,
      webPreferences: {
          preload: join(__dirname, "./preload.js"),
      },
  });

  /*  Conectivity to React  */
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  /*  ready to show the window  */
  mainWindow.on("ready-to-show", mainWindow.show);
  if (isDev) { mainWindow.webContents.openDevTools(); }
  mainWindow.on('closed', () => mainWindow = null);
}

/**
 * Handles the 'ready' event of the Electron app.
 * Creates the main window and starts checking the port status.
 */
app.on('ready', () => {
    createWindow();
    checkPort(portParser); // Start checking the port status when ready
});


/**
 * Handles the 'window-all-closed' event of the Electron app.
 * Quits the app when all windows are closed, except on macOS.
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


/**
 * Handles the 'activate' event of the Electron app.
 * Creates the main window if it's null.
 */
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});


/**
 * Handles the 'before-quit' event of the Electron app. (Event before closing the app)
 * Logs a message before the app closes.
 */
app.on('before-quit', () => {
    console.log('Adios maje.......Ines.estuvo.aqui.jsjs.....')
});



/* Serial Comunication functionality, the dificult shit ......................................

  Serial Comunication functions:
    - readMyPort(callback)
    - writeToPort(data)
    - checkPortConnection()
    - onPortConnectionStatus(callback)
    - getFriendlyName(callback)

*/

let serialPath = "";
let friendlyName = "";
let portParser = { port: null, parser: null };
let pathDetected = false;


/**
 * Lists available serial ports.
 * @returns {Promise<Array>} A promise that resolves to an array of available serial ports.
*/
async function listSerialPorts() {
  return new Promise((resolve, reject) => {
    SerialPort.list()
      .then((ports, err) => {
        if (err) {
          console.log("Error ports:", err);
          reject(err);
        } else {
          if (ports.length === 0) {
            console.log("No ports available");
            resolve([]); 
          } else {
            resolve(ports);
          }
        }
      })
      .catch((err) => {
        console.log("Error ports:", err);
        reject(err);
      });
  });
}


/**
 * Sets up the serial port connection.
 * @param {string} portPath - The path of the serial port.
 * @param {number} baudRate - The baud rate for communication.
 * @returns {Array} An array containing the SerialPort instance and the parser.
 */
function setPort(portPath, baudRate){
  let port = new SerialPort({ path: portPath, baudRate: baudRate, autoOpen: true});
  let parser = port.pipe(new ReadlineParser({ delimiter: '\n' }))
  console.log("Conected to" + port.path);
  return [port, parser]
}


/**
 * Checks the availability of the serial port.
 * @param {Object} portParser - The object containing the SerialPort instance and the parser.
 */
function checkPort(portParser) {
  listSerialPorts()
    .then((ports) => {
      let path = "";
      let name = "";
      if(ports.length !== 0){
        path = ports[0].path;
        name = ports[0].friendlyName;
      } else {
        path = "";
        name = "";
        pathDetected = false;
      }
      if (!pathDetected && path !== serialPath) {
        serialPath = path;
        friendlyName = name;
        console.log("New port detected:", serialPath);
        [portParser.port, portParser.parser] = setPort(serialPath, 9600);
        mainWindow.webContents.send("portStatus", true); // Send port status to the renderer process (boolean)
        mainWindow.webContents.send("getFriendlyName", friendlyName); // Send port name to the renderer process (str)
        pathDetected = true;
      }
      console.log("Current Port Path:", serialPath);
    })
    .catch((error) => {
      console.error("Error:", error);
      mainWindow.webContents.send("portStatus", false); // Send port status to the renderer process (boolean)
      mainWindow.webContents.send("getFriendlyName", ""); // Send port name to the renderer process (str)
    })
    .finally(() => {
      if (!pathDetected) {
        setTimeout(() => checkPort(portParser), 12000); //Try connection every 12000 milis if not pathDetected
        mainWindow.webContents.send("portStatus", false); // Send port status to the renderer process (boolean)
        mainWindow.webContents.send("getFriendlyName", ""); // Send port name to the renderer process (str)
      } else {
        startListening(portParser.parser);  //If port connected start listening port
        mainWindow.webContents.send("portStatus", true); // Send port status to the renderer process (boolean)
        mainWindow.webContents.send("getFriendlyName", friendlyName); // Send port name to the renderer process (str)
      }
    });
}


/**
 * Starts listening to the serial port.
 * @param {Object} parser - The parser object for the serial port.
 */
function startListening(parser) {
  let portSerialData = "";
  parser.on('data', (data) => {
    portSerialData = data;
    console.log(portSerialData);
    mainWindow.webContents.send("dataSerial", portSerialData);  //When data available on port, sends to renderProcess
  });
  parser.on('error', (error) => {
    console.error("Serial port error:", error);
  });
}


/**
 * Writes data to the serial port.
 * @param {string} data - The data to be written.
 */
function writeToPort(data) {
  if (portParser.port && portParser.port.isOpen) {
    portParser.port.write(data, (error) => {
      if (error) {
        console.error("Error writing to serial port:", error);
      } else {
        console.log("Data written to serial port:", data);
        mainWindow.webContents.send("dataWritten", data); // Send a message to the renderer process when written 
      }
    });
  } else {
    console.error("Serial port is not open");
  }
}


/**
 * Listens for the "writeToPort" event from the renderer process.
 * Writes the provided data to the serial port.
 * @param {Electron.IpcMainEvent} event - The event object.
 * @param {string} data - The data to be written to the serial port.
 */
ipcMain.on("writeToPort", (event, data) => {
  writeToPort(data);
});


/**
 * Listens for the "checkPortConnection" event from the renderer process.
 * Initiates the process of checking the connection status of the serial port.
 */
ipcMain.on("checkPortConnection", () => {
  checkPort(portParser);
});


/**
 * Listens for the 'request-port-friendly-name' event from the renderer process.
 * Replies to the event with the friendly name of the port.
 * @param {Electron.IpcMainEvent} event - The event object.
 */
ipcMain.on('request-port-friendly-name', (event) => {
  event.reply('port-friendly-name', friendlyName);
});