import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
  Logging,
  Service,
  APIEvent,
} from 'homebridge';

import { ACCESSORY_NAME } from './settings';

let hap: HAP;

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  hap = api.hap;
  api.registerAccessory(ACCESSORY_NAME, JQAirQualitySensor);
};

class JQAirQualitySensor implements AccessoryPlugin {

  private readonly log: Logging;
  private readonly name: string;
  private readonly api: API;

  private readonly airQualitySensor: Service;

  constructor(log, config, api) {
    this.log = log;
    this.name = config.name;
    this.api = api;

    this.airQualitySensor = new hap.Service.AirQualitySensor(this.name);
    //this.airQualitySensor.getCharacteristic(hap.Characteristic.VOCDensity).onGet(this.)

    log.info('JQAirQualitySensor finished initializing!');

    /*
     * When this event is fired, homebridge restored all cached accessories from disk and did call their respective
     * `configureAccessory` method for all of them. Dynamic Platform plugins should only register new accessories
     * after this event was fired, in order to ensure they weren't added to homebridge already.
     * This event can also be used to start discovery of new accessories.
     */
    api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
      log.info('JQAirQualitySensor \'didFinishLaunching\'');

    });
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [
      this.airQualitySensor,
    ];
  }
}