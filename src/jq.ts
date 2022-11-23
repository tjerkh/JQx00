import * as mqtt from 'mqtt';
import { EventEmitter } from 'events';


//const SEQ_TYPES = [ null, null, null, null, 'temp', 'hum', 'PM2.5', 'HCHO', 'TVOC', 'eCO2' ];
//const SEQ_UNITS = [ null, null, null, null, 'C', '%', 'ug/m^3', 'mg/m^3', 'mg/m^3', 'ppm' ];

const SERVER = 'mqtt://mq.youpinyuntai.com:55450';
const OPTIONS = {keepalive: 60, protocolId: 'MQTT'};

export class JQAirQualityData extends EventEmitter {

  public active = false;
  public quality = 0;
  public temp = 0;
  public humidity = 0;
  public hcho = 0;
  public tvoc = 0;
  public co2 =0;
  public co2Peak =0;
  public co2Detected = 0;
  public pm25 = 0;

  constructor() {
    super();
  }

  connect(topic: string){

    const client : mqtt.MqttClient = mqtt.connect(SERVER, OPTIONS);

    client.on('connect', () => {
      client.subscribe(topic);
      this.log('Connected');
    });

    client.on('message', this.onMessageArrived.bind(this));
  }

  private onMessageArrived(topic: string, message: string){

    const jsondata = JSON.parse(message);
    switch(jsondata.type) {
      case 'C':
        this.log('message: connection status: ' + JSON.stringify(jsondata));
        break;
      case 'V':
        this.decode_sensor_message(JSON.parse(jsondata.content));
        this.active = true;
        this.emit('update');
        break;
      default:
        this.log('message: unknown: ' + JSON.stringify(jsondata));
    }
  }



  private decode_sensor_message(content){
    for (const value of content){
      switch(value.seq) {
        case 4: //temp
          this.temp = value.content;
          break;
        case 5: //humidity
          this.humidity = value.content;
          break;
        case 6: //PM2.5
          this.pm25 = value.content;
          break;
        case 7: //HCHO
          this.hcho = value.content;
          this.quality = determineAirQuality(this.hcho);
          break;
        case 8: //TVOC
          this.tvoc = value.content * 1000;
          break;
        case 9: //CO2
          this.co2 = value.content;
          if (this.co2 > this.co2Peak){
            this.co2Peak = this.co2;
          }
          this.co2Detected = (this.co2 > 800) ? 1 : 0;
      }
    }

    function determineAirQuality(hcho: number): number{
      if (hcho < 0){
        return 0;
      } else if (hcho < 0.06){
        return 1;
      } else if (hcho < 0.1){
        return 2;
      } else if (hcho < 0.37){
        return 3;
      } else if (hcho < 0.775){
        return 4;
      } else {
        return 5;
      }

    }

  }

  private log(message: string){
    this.emit('log', 'JQAirQualityData: ' + message);
  }

}