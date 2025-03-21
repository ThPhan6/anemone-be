#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "E-Startup";
const char* password = "Enablestartup2021";

// AWS IoT Core endpoint
const char* awsEndpoint = "a3qxjyy5rvjbjh-ats.iot.ap-southeast-1.amazonaws.com";

const char* rootCACertificate = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIBtjCCAVugAwIBAgITBmyf1XSXNmY/Owua2eiedgPySjAKBggqhkjOPQQDAjA5\n" \
"MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6b24g\n" \
"Um9vdCBDQSAzMB4XDTE1MDUyNjAwMDAwMFoXDTQwMDUyNjAwMDAwMFowOTELMAkG\n" \
"A1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJvb3Qg\n" \
"Q0EgMzBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABCmXp8ZBf8ANm+gBG1bG8lKl\n" \
"ui2yEujSLtf6ycXYqm0fc4E7O5hrOXwzpcVOho6AF2hiRVd9RFgdszflZwjrZt6j\n" \
"QjBAMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgGGMB0GA1UdDgQWBBSr\n" \
"ttvXBp43rDCGB5Fwx5zEGbF4wDAKBggqhkjOPQQDAgNJADBGAiEA4IWSoxe3jfkr\n" \
"BqWTrBqYaGFy+uGh0PsceGCmQ5nFuMQCIQCcAu/xlJyzlvnrxir4tiz+OpAUFteM\n" \
"YyRIHN8wfdVoOw==\n" \
"-----END CERTIFICATE-----\n";

const char* deviceCertificate = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIDWTCCAkGgAwIBAgIULZ7f0uHyvdzsQs+MrzVXeAoV0p4wDQYJKoZIhvcNAQEL\n" \
"BQAwTTFLMEkGA1UECwxCQW1hem9uIFdlYiBTZXJ2aWNlcyBPPUFtYXpvbi5jb20g\n" \
"SW5jLiBMPVNlYXR0bGUgU1Q9V2FzaGluZ3RvbiBDPVVTMB4XDTI1MDMyMDA5MDg0\n" \
"OFoXDTQ5MTIzMTIzNTk1OVowHjEcMBoGA1UEAwwTQVdTIElvVCBDZXJ0aWZpY2F0\n" \
"ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANYObr5DZuL1DrK4N8H8\n" \
"JiggZl5Pf42vx8NPqApAnBacNyyWmceCujOlIG07ag2y8cdUeP3jd8WNqFwG8jVp\n" \
"RGB2UJDOAw9WLiY4uTraPttX5lrk+z8h7toPnKKboN1bkYwpjBsWDecE++5ZxsHo\n" \
"XGJeD92OaFhzF2LxWEFkvmsn0yPfao9hI+uWUSm/6pU2VYoORdvmky5nx3qNvjVc\n" \
"SMuoJx+Ex30tl3SxrGzDo+Uo4e2Fp9NwhqZP8hmffpBqlU99wRu39iTLDvNXRGDh\n" \
"5nhG1BKyt61LWPAcS17e3dmIVJw2JBKGraYmQKiM944E6/Qp66OQ7dYD/qfJC2DM\n" \
"WYsCAwEAAaNgMF4wHwYDVR0jBBgwFoAUdPoIN/UpxR4tlzJWwdzLvcf0Of8wHQYD\n" \
"VR0OBBYEFAt5om7LTQJbQQDIBePC+IkJBq8YMAwGA1UdEwEB/wQCMAAwDgYDVR0P\n" \
"AQH/BAQDAgeAMA0GCSqGSIb3DQEBCwUAA4IBAQCDm6NLhT1LZ72QtvEBr0R8dxWT\n" \
"LlqwcEzL8mN5f/uVuZPj+ewyL6qW5kbZ0sqAqfKlvcnF2czKCOqQsaqZm1ss9yGm\n" \
"eh/JE8Iv+tFwdNJ4ldv6r+ABNvNMVEelYmelKxO2aovCXbG8/m0X65KDkbICc1j+\n" \
"PlPnBaMqz6/FfnIXzwdgkMcEV3y+KzuozTZuI4oRTLy9TfLeE2d4nqWOrSeTvzPo\n" \
"uhNPp1It+6/55tmrMW3kFLDyvfcPlr9fooHbWn5FuUEel6D+3VhBkGba6x7sQ/p3\n" \
"gde09iFxe2WcjXcwnOPtxqjveK7wiQtEfXIloMMJ4GASQvIABtFbZIRA4RoO\n" \
"-----END CERTIFICATE-----\n";

const char* privateKey = \
"-----BEGIN PRIVATE KEY-----\n" \
"MIIEpAIBAAKCAQEA1g5uvkNm4vUOsrg3wfwmKCBmXk9/ja/Hw0+oCkCcFpw3LJaZ\n" \
"x4K6M6UgbTtqDbLxx1R4/eN3xY2oXAbyNWlEYHZQkM4DD1YuJji5Oto+21fmWuT7\n" \
"PyHu2g+copug3VuRjCmMGxYN5wT77lnGwehcYl4P3Y5oWHMXYvFYQWS+ayfTI99q\n" \
"j2Ej65ZRKb/qlTZVig5F2+aTLmfHeo2+NVxIy6gnH4THfS2XdLGsbMOj5Sjh7YWn\n" \
"03CGpk/yGZ9+kGqVT33BG7f2JMsO81dEYOHmeEbUErK3rUtY8BxLXt7d2YhUnDYk\n" \
"EoatpiZAqIz3jgTr9Cnro5Dt1gP+p8kLYMxZiwIDAQABAoIBAQCB+mOOjrkD6VAS\n" \
"f8ADv8ufpATlEZrfezRuyYi9KPxe0l7CaXRZbG0KfSNSkLhWNymPIyEQ8bXBtMHd\n" \
"l64tdo05kb5cH2xGPMtrFBiNvwZaBGbxHIffjwhNSxuOtbeZkkev926G5/5rIGCm\n" \
"G8eP6Ttn07wIibectc4mm2w+0SC7SWcuTT9l/z4jCVWlxRQSbTil7aeEuyJzwOIE\n" \
"UIsRuFfdYro6E3MfoC8lE19R/mOGZVOiuYZqmg60flPV12S4mFCP0vQ29cUMGezY\n" \
"KrxOqpBBsoSPEof9FMDn9gtXc3KyGe6+YbFwXw4Chw0BHWiAtjyqGECAimMmS+t/\n" \
"Z29E7utxAoGBAP4/siNgJJ7RR4sjfXeEY8W5nTvSwKd/SRzqoLphO+PXu+rYf/et\n" \
"srKVUt5+hotr2GYl0QlXtGPzNBTsMiQ13iJcgKHeWMenio19az3E17ChN6S8CvsK\n" \
"6EQOOrLT+jpyr3sYv3XsqDPXa3JjOg3ut82j6qyqVgyqu2vB4nmQ9GSTAoGBANeH\n" \
"3hB9ZjezEYIKSC0DjKXVVCOxwit7BFtdWkhr8smKXEL8/yfo1JV+lT58ZXI/Unb0\n" \
"faemReiRWtczPBKh8qr6vLcDaS2qqz3rmLc/9Y32sRGlhDNjsWcuYECtiTfqieyw\n" \
"LSVqLXUU/X4vighgpVMqI4DQ+siQpBI+NoBWa4opAoGAaIBTvtiQlLqeNmFS+6Ht\n" \
"xGJjbyhTyUS3D2ycvZ6jmCWe9osgJfQ+A8r+cbb9pCainnGitr1WxtI6sPLYNSvy\n" \
"7pqowF98jCuf9kH7pzrWEKJjFZG4zbCRAQ/8Lm6UZhunZugoIdcw14YOgsioHvvk\n" \
"jmB2X5vvnGs8d7EMXj0nRoMCgYEAhdETrQVOm7KQYj7kBR65CpVjAi5xsfFVCSzy\n" \
"yxhKy5seIXFXMn46zv6ixwMRMVfjaXvvMFHqAbWNwyNKXv8x3bqDxNVXTkUywOUw\n" \
"EkahvRy3X492fzmcgcWneUDFe3QhYlUYEqzTwGfh46C8gOsQeowlMuuNaU10sObz\n" \
"i8ccSdECgYBW1Qb+eMR1o/RW+U4TncJ4BkecDrIaNdDRasiVo86twSWcEtOFvQXm\n" \
"8J/ehtpQu5G0c7BAXFpdv4D/PVwJ8H/+XgzhosHXHpwIMa+N/BozCvnygl0pLgI1\n" \
"f2jJw/i0DYxOxxymgs0JNjK+8jfG50m8UPEGUTaVSj95qDaUqZGLvQ==\n" \
"-----END PRIVATE KEY-----\n";

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

  // // Send an HTTP request
  // client.println("GET /iot-devices/auth HTTP/1.1");
  // client.println("Host: a3qxjyy5rvjbjh-ats.iot.ap-southeast-1.amazonaws.com");
  // client.println("Content-Type: application/json");
  // client.println("Connection: close");
  // client.println();

  // Send a POST request
  client.println("POST /iot-devices/auth HTTP/1.1");
  client.println("Host: a3qxjyy5rvjbjh-ats.iot.ap-southeast-1.amazonaws.com");
  client.println("x-device-id: device-001");
  client.println("Content-Type: application/x-www-form-urlencoded");
  client.println("Content-Length: 0");
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