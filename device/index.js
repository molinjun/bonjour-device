/**
 * This is misc device like a phone or a fridge.
 */
const net = require('net');
const mdns = require('mdns');
const config = require('./config');

const DEVICE_INIT = 0;
const DEVICE_ON = 1;
const DEVICE_OFF = 2;
class Device {
  constructor(name, type) {
    this.name = name;
    this.type = type || 'http';
    this.state = DEVICE_INIT;
    this.panel = {};
  }

  initClient() {
    // init a bonjour client to search devices up/down
    const browser = mdns.createBrowser(mdns.tcp(this.type));

    browser.on('serviceUp', service => {
      const host = service.addresses.find(ip => net.isIPv4(ip));
      const port = service.port;
      this.panel = { name: service.name, host, port };
      console.log('Found a panel up', { name: service.name, host, port });
    });
    browser.on('serviceDown', service => {
      console.log('Found panel down', {
        name: service.name
      });
      if (this.panel.name && this.panel.name === service.name) {
        this.panel = {};
      }
    });

    browser.start();
  }

  initConnection() {}

  init() {
    // init socket io connection
    console.log(`Device ${this.name} is on, finding near panel ...`);
    this.initConnection();
    // init mdns browser
    this.initClient();
  }
}

const device = new Device(process.env.DEVNAME || config.name);
device.init();