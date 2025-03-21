#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "your-SSID";
const char* password = "your-PASSWORD";

// AWS IoT Core endpoint
const char* awsEndpoint = "a3qxjyy5rvjbjh-ats.iot.ap-southeast-1.amazonaws.com";

// Paths to your certificates
const char* rootCACertificate = "-----BEGIN CERTIFICATE-----\nYOUR_ROOT_CA_CERTIFICATE_HERE\n-----END CERTIFICATE-----\n";
const char* deviceCertificate = "-----BEGIN CERTIFICATE-----\nYOUR_DEVICE_CERTIFICATE_HERE\n-----END CERTIFICATE-----\n";
const char* privateKey = "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n";

WiFiClientSecure client;

void setup() {
  Serial.begin(115200);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Configure the secure client
  client.setCACert(rootCACertificate);
  client.setCertificate(deviceCertificate);
  client.setPrivateKey(privateKey);

  // Connect to AWS IoT Core
  if (!client.connect(awsEndpoint, 443)) {
    Serial.println("Connection to AWS IoT Core failed!");
    return;
  }
  Serial.println("Connected to AWS IoT Core");

  // Send an HTTP request
  client.println("GET /iot-devices/auth HTTP/1.1");
  client.println("Host: a3qxjyy5rvjbjh-ats.iot.ap-southeast-1.amazonaws.com");
  client.println("Content-Type: application/json");
  client.println("Connection: close");
  client.println();

  // Read the response
  String response = "";
  while (client.connected()) {
    String line = client.readStringUntil('\n');
    if (line == "\r") {
      break;
    }
    response += line;
  }

  // Parse JSON response
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, response);

  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.f_str());
    return;
  }

  const char* key = doc["key"];
  Serial.println(key);

  // Close the connection
  client.stop();
}

void loop() {
  // Your loop code here
}