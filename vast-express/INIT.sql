drop table if EXISTS MobileSensorReadings;
drop table if EXISTS StaticSensorLocations;
drop table if EXISTS StaticSensorReadings;
drop table if EXISTS features;
drop table if EXISTS features_h;



create table MobileSensorReadings(Timestamp text, "Sensor-id" integer, Long real, Lat real, Value real, Units text, "User-id" integer);
.separator ","
.import MobileSensorReadings.csv MobileSensorReadings



create table StaticSensorLocations("Sensor-id" integer, Lat real, Long real);
.separator ","
.import StaticSensorLocations.csv StaticSensorLocations


create table StaticSensorReadings(Timestamp text, "Sensor-id" integer, Value real, Units text);
.separator ","
.import StaticSensorReadings.csv StaticSensorReadings

delete from StaticSensorLocations where Long = 'Long';
delete from StaticSensorReadings where Units = 'Units';
delete from MobileSensorReadings where Units = 'Units';

create table features as
select 
'' as UserId, 
sl.Lat as Latitude, 
sl.Long as Longitude, 
'S_' || sl."Sensor-id" as SensorId,
datetime(sr.Timestamp) as 'Timestamp', 
sr.Units as Units,
'static' as SensorType,
sr.Value as Radiation
from StaticSensorLocations sl
join StaticSensorReadings sr on sr."Sensor-id" = sl."Sensor-id"
union
select 
ml."User-id" as UserId, 
ml.Lat as Latitude, 
ml.Long as Longitude, 
'M_'|| ml."Sensor-id" as SensorId,
datetime(ml.Timestamp) as 'Timestamp', 
ml.Units as Units,
'mobile' as SensorType,
ml.Value as Radiation
from MobileSensorReadings ml;

delete from features where Units = 'Units';

create table features_h as
SELECT feat.SensorId as SensorId,
  strftime('%Y-%m-%d %H', datetime(feat.Timestamp)) || ':00:00' as Timestamp,
  max(feat.UserId) as UserId, 
  max(Units) as Units, 
  max("SensorType") as SensorType,
  REPLACE(CAST(AVG(CAST(feat.Latitude as REAL))as REAL),',','.') as Latitude, 
  REPLACE(CAST(AVG(CAST(feat.Longitude as REAL))as REAL),',','.') as Longitude, 
  REPLACE(CAST(AVG(CAST(feat.Radiation as REAL))as REAL),',','.') as Radiation
FROM features feat
group by feat.SensorId, strftime('%Y-%m-%d %H', feat.Timestamp) || ':00:00'
order by Timestamp, SensorType desc, SensorId;
