SELECT	max(feat."User") as UserId, AVG(CONVERT(FLOAT, Latitude)) as Latitude, AVG(CONVERT(FLOAT, Longitude)) as Longitude, 
		case when max("SensorType") = 'mobile' then 'M_' + "Sensor-id" else 'S_' + "Sensor-id" end  as SensorId, 
		CONVERT(VARCHAR(10), CAST(Timestamp as DATE)) + ' ' + RIGHT('0' + CONVERT(VARCHAR(2), DATEPART(HOUR, Timestamp)), 2) + ':00:00' AS Timestamp, 
		max(Units) as Units, avg(CONVERT(FLOAT, Radiation)) as Radiation
FROM [EDW].[dbo].[features] feat
group by [Sensor-id],CAST(Timestamp as DATE), DATEPART(hour,Timestamp)
order by Timestamp;