SELECT	max(feat."User") as UserId, 
		REPLACE(CONVERT(VARCHAR,AVG(CONVERT(FLOAT, Latitude))),',','.') as Latitude, 
		REPLACE(CONVERT(VARCHAR,AVG(CONVERT(FLOAT, Longitude))),',','.') as Longitude, 
		case when "SensorType" = 'mobile' then 'M_' + "Sensor-id" else 'S_' + "Sensor-id" end  as SensorId, 
		CONVERT(VARCHAR(10), CAST(Timestamp as DATE)) + ' ' + RIGHT('0' + CONVERT(VARCHAR(2), DATEPART(HOUR, Timestamp)), 2) + ':00:00' AS Timestamp, 
		max(Units) as Units, 
		max("SensorType") as SensorType,
		REPLACE(CONVERT(VARCHAR,avg(CONVERT(FLOAT, Radiation))),',','.') as Radiation
FROM [EDW].[dbo].[features] feat
group by case when "SensorType" = 'mobile' then 'M_' + "Sensor-id" else 'S_' + "Sensor-id" ,CAST(Timestamp as DATE), DATEPART(hour,Timestamp)
order by Timestamp;