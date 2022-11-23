import {
  //AccessoryConfig,
  AccessoryPlugin,
  API,
  //CharacteristicEventTypes,
  //CharacteristicGetCallback,
  //CharacteristicSetCallback,
  //CharacteristicValue,
  HAP,
  Logging,
  Service,
  APIEvent,
} from 'homebridge';

import { ACCESSORY_NAME } from './settings';
import { JQAirQualityData } from './jq';

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
  private readonly topic: string;
  private readonly model: string;

  private readonly airQualitySensor: Service;
  private readonly temperatureSensor: Service;
  private readonly humiditySensor: Service;
  private readonly carbonDioxideSensor: Service;
  private readonly informationService: Service;

  private jqdata: JQAirQualityData;

  constructor(log, config, api) {
    this.log = log;
    this.name = config.name;
    this.api = api;
    this.topic = config.topic;
    this.model = config.model;

    this.airQualitySensor = new hap.Service.AirQualitySensor(this.name + ' AirQualitySensor');
    this.temperatureSensor = new hap.Service.TemperatureSensor(this.name + ' TemperatureSensor');
    this.humiditySensor = new hap.Service.HumiditySensor(this.name + ' HumiditySensor');
    this.carbonDioxideSensor = new hap.Service.CarbonDioxideSensor(this.name + ' CarbonDioxideSensor');

    this.jqdata = new JQAirQualityData();
    this.jqdata.on('update', this.onUpdate.bind(this));
    this.jqdata.on('log', (message) => {
      this.log.info(message);
    });

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, 'KKMOON')
      .setCharacteristic(hap.Characteristic.Model, this.model)
      .setCharacteristic(hap.Characteristic.SerialNumber, this.topic);



    //AirQualitySensor
    /*this.airQualitySensor.getCharacteristic(hap.Characteristic.StatusActive)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(null, this.jqdata.active);
      });

    this.airQualitySensor.getCharacteristic(hap.Characteristic.AirQuality)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(null, this.jqdata.quality);
      });

    this.airQualitySensor.getCharacteristic(hap.Characteristic.VOCDensity)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(null, this.jqdata.tvoc);
      });


    //TemperatureSensor
    this.temperatureSensor.getCharacteristic(hap.Characteristic.StatusActive)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(null, this.jqdata.active);
      });

    this.temperatureSensor.getCharacteristic(hap.Characteristic.CurrentTemperature)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(null, this.jqdata.temp);
      });


    //HumiditySensor
    this.humiditySensor.getCharacteristic(hap.Characteristic.StatusActive)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(null, this.jqdata.active);
      });

    this.humiditySensor.getCharacteristic(hap.Characteristic.CurrentRelativeHumidity)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(null, this.jqdata.humidity);
      });

    //CarbonDioxideSensor
    this.carbonDioxideSensor.getCharacteristic(hap.Characteristic.StatusActive)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(null, this.jqdata.active);
      });

    this.carbonDioxideSensor.getCharacteristic(hap.Characteristic.CarbonDioxideDetected)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(null, this.jqdata.co2Detected);
      });

    this.carbonDioxideSensor.getCharacteristic(hap.Characteristic.CarbonDioxideLevel)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(null, this.jqdata.co2);
      });*/


    log.info('JQAirQualitySensor finished initializing!');


    /*
     * When this event is fired, homebridge restored all cached accessories from disk and did call their respective
     * `configureAccessory` method for all of them. Dynamic Platform plugins should only register new accessories
     * after this event was fired, in order to ensure they weren't added to homebridge already.
     * This event can also be used to start discovery of new accessories.
     */
    api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
      log.info('JQAirQualitySensor Finished Launching');
      this.jqdata.connect(this.topic);
    });
  }

  private onUpdate(){

    //AirQualitySensor
    this.airQualitySensor.getCharacteristic(hap.Characteristic.AirQuality).updateValue(this.jqdata.quality);
    this.airQualitySensor.getCharacteristic(hap.Characteristic.VOCDensity).updateValue(this.jqdata.tvoc);
    if (this.model === 'JQ300'){
      this.airQualitySensor.getCharacteristic(hap.Characteristic.PM2_5Density).updateValue(this.jqdata.pm25);
    }
    this.airQualitySensor.getCharacteristic(hap.Characteristic.StatusActive).updateValue(this.jqdata.active);

    //TemperatureSensor
    this.temperatureSensor.getCharacteristic(hap.Characteristic.CurrentTemperature).updateValue(this.jqdata.temp);
    this.temperatureSensor.getCharacteristic(hap.Characteristic.StatusActive).updateValue(this.jqdata.active);

    //HumiditySensor
    this.humiditySensor.getCharacteristic(hap.Characteristic.CurrentRelativeHumidity).updateValue(this.jqdata.humidity);
    this.humiditySensor.getCharacteristic(hap.Characteristic.StatusActive).updateValue(this.jqdata.active);

    //CarbonDioxideSensor
    this.carbonDioxideSensor.getCharacteristic(hap.Characteristic.CarbonDioxideDetected).updateValue(this.jqdata.co2Detected);
    this.carbonDioxideSensor.getCharacteristic(hap.Characteristic.CarbonDioxideLevel).updateValue(this.jqdata.co2);
    this.carbonDioxideSensor.getCharacteristic(hap.Characteristic.CarbonDioxidePeakLevel).updateValue(this.jqdata.co2Peak);
    this.carbonDioxideSensor.getCharacteristic(hap.Characteristic.StatusActive).updateValue(this.jqdata.active);

  }

  onLog(message: string){
    this.log.info(message);
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [
      this.airQualitySensor,
      this.temperatureSensor,
      this.humiditySensor,
      this.carbonDioxideSensor,
      this.informationService,
    ];
  }
}