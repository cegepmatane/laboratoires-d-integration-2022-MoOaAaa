// Dependencies
const awsIot = require('aws-iot-device-sdk');
//const sensor = require("node-dht-sensor");

const useDummyData = true
const today = new Date();
const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
const dateTime = date + ' ' + time;

const device = awsIot.device({
    clientId: 'RasperryMQTTClient',
    host: 'a7xh5u61cnv2w-ats.iot.us-east-1.amazonaws.com',
    port: 8883,
    keyPath: './AWS_Rasperry_secrets/d86edbfabb4afa82af13b5353c9e6a6d9bd3413053042853bd4fe104062a3cce-private.pem.key',
    certPath: './AWS_Rasperry_secrets/d86edbfabb4afa82af13b5353c9e6a6d9bd3413053042853bd4fe104062a3cce-certificate.pem.crt',
    caPath: './AWS_Rasperry_secrets/AmazonRootCA1.pem',
});


// Telemetry data
const IoTDevice = {
    serialNumber: "SN-D7F3C8947867",
    dateTime,
    activated: true,
    device: "MyRaspperry-01",
    type: "MySmartIoTDevice",
    payload: {}
}

/** TOPICS
 * "core/broadcast":  The device will subscribe to a broadcast topic, this will be used to send out messages from the cloud to all IoT devices connected.
 * "topicHouse1:: This topic is used for a specific home and for an specific purpose. In this case, we can use it for send temperature data.
 */

const topicCoreBroadcast = "core/broadcast"
const topicHouse1 = "house/1/temperature"
const topicRepublish = "core/republish"

const getSensorData = (cb) => getDummySensorData(cb)

/*
    useDummyData ? getDummySensorData(cb) : sensor.read(11, 2, function (err, temperature, humidity) {
        if (!err) {
            const temperatureData = { temp: `${temperature}°C`, humidity: `${humidity}%` }
            console.log(`STEP - Sending data to AWS  IoT Core'`, temperatureData)
            console.log(`---------------------------------------------------------------------------------`)
            return cb(temperatureData)
        }
        console.log(err)
    });
*/

const getDummySensorData = (cb) => {
    const temperatureData = { temp: '100°C', humidity: '52%' }
    return cb(temperatureData)

}

const sendData = (data) => {
    const telemetryData = {
        ...IoTDevice,
        payload: data
    }
    console.log(`STEP - Sending data to AWS  IoT Core'`, telemetryData)
    console.log(`---------------------------------------------------------------------------------`)
    return device.publish(topicHouse1, JSON.stringify(telemetryData))
}

// We connect our client to AWS  IoT core.
device
    .on('connect', function () {
        console.log('STEP - Connecting to AWS  IoT Core');
        console.log(`---------------------------------------------------------------------------------`);
        device.subscribe(topicCoreBroadcast);
        setInterval(() => getSensorData(sendData), 3000)

    });


// Set handler for the device, it will get the messages from subscribers topics.
device
    .on('message', function (topic, payload) {
        console.log('message', topic, payload.toString());
    });

device
    .on('error', function (topic, payload) {
        console.log('Error:', topic, payload.toString());
    });


