/****************************
  MIDDLE FILE (MAIN, RENDER)
*****************************/



/**
 * Module dependencies
 */
const { contextBridge, ipcRenderer } = require("electron");

/**
 * Exposes functions for interacting with the serial port in the renderer process.
     - mySerialPort
        - readMyPort(callback)
        - writeToPort(data)
        - checkPortConnection()
        - onPortConnectionStatus(callback)
        - getFriendlyName(callback)
 */
contextBridge.exposeInMainWorld("mySerialPort", {

    /**
     * Reads data from the serial port and invokes the callback with the received data.
     * @param {Function} callback - The callback function to be invoked with the received data.
     */
    readMyPort: (callback) => {
        ipcRenderer.on("dataSerial", (event, args) => {
        callback(args);
        });
    },

    /**
     * Writes data to the serial port.
     * @param {string} data - The data to be written to the serial port.
     */
    writeToPort: (data) => {
        ipcRenderer.send('writeToPort', data);
        
        ipcRenderer.on('dataWritten', (_, data) => {
        console.log('Data written:', data); // Handle the event when data is written by the main process
        });
        
        ipcRenderer.on('lineSent', () => {
        sendNextLine(); // The main process acknowledges that a line has been sent
        });
    },

    /**
     * Checks the connection status of the serial port.
     */
    checkPortConnection: () => {
        ipcRenderer.send('checkPortConnection');  //Render request port connection
    },

    /**
     * Listens for changes in the port connection status and invokes the callback with the status.
     * @param {Function} callback - The callback function to be invoked with the port connection status.
     */
    onPortConnectionStatus: (callback) => {
        ipcRenderer.on('portStatus', (_, isConnected) => {  //sent port status
        callback(isConnected);
        });
    },

    /**
     * Retrieves the friendly name of the port.
     * @param {Function} callback - The callback function to be invoked with the friendly name.
     */
    getFriendlyName: (callback) => {
        ipcRenderer.on('getFriendlyName', (_, friendlyName) => {
        callback(friendlyName);
        });
    },
});


/**
 * Handles the 'beforeunload' event when the window is about to be unloaded.
 * Removes all listeners related to serial port data, port status, and port friendly name.
 */
window.addEventListener('beforeunload', () => {
  ipcRenderer.removeAllListeners('dataSerial');
  ipcRenderer.removeAllListeners('portStatus');
  ipcRenderer.removeAllListeners('port-friendly-name');
});


/**
 * Sends a request to the main process for the current port connection status.
 */
ipcRenderer.send('request-port-connection-status');


/**
 * Sends a request to the main process for the friendly name of the port.
 */
ipcRenderer.send('request-port-friendly-name');








