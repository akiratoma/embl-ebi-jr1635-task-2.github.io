-- Creating the VARIANT and HEALTH_CONDITION enums to only accept valid values
CREATE TYPE VARIANT AS ENUM ('B.1.1.7', 'B.1.351', 'P.1');
CREATE TYPE HEALTH_CONDITION AS ENUM (
	'Cardiovascular_system',
	'Connective_tissue',
	'Digestive_system',
	'Nerudevelopmental',
	'Respiratory_system',
	'Other',
	'None'
);

-- Adding an ID column as a primary key to identify each pacient
-- Making the stay_days column nullable so that the information will be recorded after the record is already created
CREATE TABLE pacients (
	id SERIAL PRIMARY KEY,
	age INTEGER NOT NULL,
	variant VARIANT NOT NULL,
	health_condition HEALTH_CONDITION NOT NULL,
	stay_days INTEGER
);

-- Creating the variant_index and health_condition_index indexes to increase query performance
CREATE INDEX variant_index ON pacients (variant);
CREATE INDEX health_condition_index ON pacients (health_condition);



INSERT INTO pacients (age, variant, health_condition, stay_days)
VALUES
	(10, 'B.1.1.7', 'Cardiovascular_system', NULL),
	(11, 'B.1.351', 'None', NULL),
	(12, 'P.1', 'Other', 2),
	(6, 'B.1.1.7', 'Cardiovascular_system', 5),
	(31, 'B.1.1.7', 'Nerudevelopmental', NULL),
	(17, 'P.1', 'Connective_tissue', 10);


-- Query 1:
SELECT age FROM pacients WHERE variant = 'B.1.1.7' ORDER BY age ASC LIMIT 1;

-- Query 2:
SELECT enums.health_condition, COUNT(pacients.id) as total_admissions
FROM (SELECT unnest(enum_range(NULL::HEALTH_CONDITION)) as health_condition) as enums
LEFT JOIN pacients ON pacients.health_condition = enums.health_condition
GROUP BY enums.health_condition
ORDER BY health_condition ASC;

-- Query 3:
SELECT enums.variant, SUM(COALESCE(pacients.stay_days, 0)) as total_days
FROM (SELECT unnest(enum_range(NULL::VARIANT)) as variant) as enums
LEFT JOIN pacients ON pacients.variant = enums.variant
GROUP BY enums.variant
ORDER BY variant ASC;

-- Query 4:
SELECT COUNT(*) FROM pacients WHERE health_condition = 'None';











