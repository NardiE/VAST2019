# INSTALLATION STEPS
## 1) Open new terminal in the folder that will contain the project
## 2) Clone this GITHUB repository
`git clone https://github.com/NardiE/VAST2019.git`
## 3) Go to the Vue.js project directory
`cd VAST2019`
## 4) Install Vue.js modules
`npm install`
## 5) Go to the Express.js project directory
`cd .\vast-express\`
## 6) Install Express.js modules
`npm install`
## 7) Go Express.js data directory
`mkdir data`
## 8) Download VAST Challenge 2019 MC-2 data and extract these
## 9) Copy file ‘StaticSensorLocations.csv’ to data folder
## 10) Copy file ‘StaticSensorReadings.csv’ to data folder
## 11) Copy file ‘MobileSensorReadings.csv’ to data folder
## 12) Download SQLite from https://www.sqlite.org/2020/sqlite-tools-win32-x86-3320100.zip
## 13) Copy all extracted file in data folder, the data folter should appears like this: 
## 14) Open SQLite 
`./sqlite3 vast.db`
## 15) Execute these following steps.
`drop table if EXISTS MobileSensorReadings;`
`drop table if EXISTS StaticSensorLocations;`
`drop table if EXISTS StaticSensorReadings;`
`drop table if EXISTS features;`
`drop table if EXISTS features_h;`
`create table MobileSensorReadings(Timestamp text, "Sensor-id" integer, Long real, Lat real, Value real, Units text, "User-id" integer);`
`.separator ","`
`.import MobileSensorReadings.csv MobileSensorReadings`
`create table StaticSensorLocations("Sensor-id" integer, Lat real, Long real);`
`.separator ","`
`.import StaticSensorLocations.csv StaticSensorLocations`
`create table StaticSensorReadings(Timestamp text, "Sensor-id" integer, Value real, Units text);`
`.separator ","`
`.import StaticSensorReadings.csv StaticSensorReadings`
`delete from StaticSensorLocations where Long = 'Long';`
`delete from StaticSensorReadings where Units = 'Units';`
`delete from MobileSensorReadings where Units = 'Units';`
`create table features as`
`select `
`'' as UserId, `
`sl.Lat as Latitude, `
`sl.Long as Longitude, `
`'S_' || sl."Sensor-id" as SensorId,`
`datetime(sr.Timestamp) as 'Timestamp', `
`sr.Units as Units,`
`'static' as SensorType,`
`sr.Value as Radiation`
`from StaticSensorLocations sl`
`join StaticSensorReadings sr on sr."Sensor-id" = sl."Sensor-id"`
`union`
`select `
`ml."User-id" as UserId, `
`ml.Lat as Latitude, `
`ml.Long as Longitude, `
`'M_'|| ml."Sensor-id" as SensorId,`
`datetime(ml.Timestamp) as 'Timestamp', `
`ml.Units as Units,`
`'mobile' as SensorType,`
`ml.Value as Radiation`
`from MobileSensorReadings ml;`
`delete from features where Units = 'Units';`
`create table features_h as`
`SELECT feat.SensorId as SensorId,`
  `strftime('%Y-%m-%d %H', datetime(feat.Timestamp)) || ':00:00' as Timestamp,`
  `max(feat.UserId) as UserId, `
  `max(Units) as Units, `
  `max("SensorType") as SensorType,`
  `REPLACE(CAST(AVG(CAST(feat.Latitude as REAL))as REAL),',','.') as Latitude, `
  `REPLACE(CAST(AVG(CAST(feat.Longitude as REAL))as REAL),',','.') as Longitude, `
  `REPLACE(CAST(AVG(CAST(feat.Radiation as REAL))as REAL),',','.') as Radiation`
`FROM features feat`
`group by feat.SensorId, strftime('%Y-%m-%d %H', feat.Timestamp) || ':00:00'`
`order by Timestamp, SensorType desc, SensorId;`
`.q`
## 16) From data folder launch a new terminal
`start cmd.exe`
## 17) From new terminal launch Vue.js server executing these following steps:
`cd ..`
`cd ..`
`npm run serve`
## 18) From old terminal launch the Express.js server executing these following steps:
`cd ..`
`node server.js`
## 19) Open a Browser and go to http://localhost:8080
