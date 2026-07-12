SELECT
  v.id AS vehicle_id,
  v.registration_number,
  v.acquisition_cost,
  COALESCE(sum(t.revenue), (0) :: numeric) AS total_revenue,
  (
    SELECT
      COALESCE(sum(maintenance_logs.cost), (0) :: numeric) AS "coalesce"
    FROM
      maintenance_logs
    WHERE
      (maintenance_logs.vehicle_id = v.id)
  ) AS total_maintenance_cost,
  (
    SELECT
      COALESCE(sum(fuel_logs.cost), (0) :: numeric) AS "coalesce"
    FROM
      fuel_logs
    WHERE
      (fuel_logs.vehicle_id = v.id)
  ) AS total_fuel_cost,
  (
    SELECT
      COALESCE(sum(fuel_logs.liters), (0) :: numeric) AS "coalesce"
    FROM
      fuel_logs
    WHERE
      (fuel_logs.vehicle_id = v.id)
  ) AS total_fuel_liters,
  (
    SELECT
      COALESCE(sum(trips.planned_distance), (0) :: numeric) AS "coalesce"
    FROM
      trips
    WHERE
      (
        (trips.vehicle_id = v.id)
        AND (trips.status = 'completed' :: trip_status)
      )
  ) AS total_distance,
  CASE
    WHEN (v.acquisition_cost > (0) :: numeric) THEN round(
      (
        (
          COALESCE(sum(t.revenue), (0) :: numeric) - (
            (
              SELECT
                COALESCE(sum(maintenance_logs.cost), (0) :: numeric) AS "coalesce"
              FROM
                maintenance_logs
              WHERE
                (maintenance_logs.vehicle_id = v.id)
            ) + (
              SELECT
                COALESCE(sum(fuel_logs.cost), (0) :: numeric) AS "coalesce"
              FROM
                fuel_logs
              WHERE
                (fuel_logs.vehicle_id = v.id)
            )
          )
        ) / v.acquisition_cost
      ),
      4
    )
    ELSE (0) :: numeric
  END AS vehicle_roi
FROM
  (
    vehicles v
    LEFT JOIN trips t ON (
      (
        (v.id = t.vehicle_id)
        AND (t.status = 'completed' :: trip_status)
      )
    )
  )
GROUP BY
  v.id;