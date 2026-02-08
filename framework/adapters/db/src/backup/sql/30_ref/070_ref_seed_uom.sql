/* ============================================================================
   Athyper — REF Seed: Units of Measure (UN/ECE Rec 20)
   PostgreSQL 16+

   Curated set of commonly used UN/ECE Recommendation 20 units.
   Depends on: 010_ref_master_tables.sql
   ============================================================================ */

-- ============================================================================
-- Count / Quantity
-- ============================================================================
insert into ref.uom (code, name, symbol, quantity_type, created_by)
values
  ('C62','One (unit)','1','count','seed'),
  ('EA','Each','ea','count','seed'),
  ('PR','Pair','pr','count','seed'),
  ('DZN','Dozen','doz','count','seed'),
  ('GRO','Gross','gr','count','seed'),
  ('SET','Set',null,'count','seed'),
  ('PK','Pack',null,'count','seed'),
  ('BX','Box',null,'count','seed'),
  ('CT','Carton',null,'count','seed'),
  ('CS','Case',null,'count','seed'),
  ('PL','Pallet',null,'count','seed'),
  ('RL','Roll',null,'count','seed'),
  ('SH','Sheet',null,'count','seed'),
  ('BA','Barrel',null,'count','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Mass / Weight
-- ============================================================================
insert into ref.uom (code, name, symbol, quantity_type, created_by)
values
  ('MGM','Milligram','mg','mass','seed'),
  ('GRM','Gram','g','mass','seed'),
  ('KGM','Kilogram','kg','mass','seed'),
  ('TNE','Metric Ton (Tonne)','t','mass','seed'),
  ('LBR','Pound','lb','mass','seed'),
  ('ONZ','Ounce','oz','mass','seed'),
  ('CWA','Hundredweight (US)','cwt','mass','seed'),
  ('STN','Short Ton (US)','ton','mass','seed'),
  ('LTN','Long Ton (UK)','long tn','mass','seed'),
  ('MC','Microgram','µg','mass','seed'),
  ('DTN','Decitonne','dt','mass','seed'),
  ('APZ','Troy Ounce','oz t','mass','seed'),
  ('CGM','Centigram','cg','mass','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Length / Distance
-- ============================================================================
insert into ref.uom (code, name, symbol, quantity_type, created_by)
values
  ('MMT','Millimetre','mm','length','seed'),
  ('CMT','Centimetre','cm','length','seed'),
  ('MTR','Metre','m','length','seed'),
  ('KMT','Kilometre','km','length','seed'),
  ('INH','Inch','in','length','seed'),
  ('FOT','Foot','ft','length','seed'),
  ('YRD','Yard','yd','length','seed'),
  ('SMI','Statute Mile','mi','length','seed'),
  ('NMI','Nautical Mile','nmi','length','seed'),
  ('DMT','Decimetre','dm','length','seed'),
  ('A11','Micrometre','µm','length','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Area
-- ============================================================================
insert into ref.uom (code, name, symbol, quantity_type, created_by)
values
  ('CMK','Square Centimetre','cm²','area','seed'),
  ('MTK','Square Metre','m²','area','seed'),
  ('KMK','Square Kilometre','km²','area','seed'),
  ('HAR','Hectare','ha','area','seed'),
  ('ACR','Acre','ac','area','seed'),
  ('FTK','Square Foot','ft²','area','seed'),
  ('INK','Square Inch','in²','area','seed'),
  ('YDK','Square Yard','yd²','area','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Volume / Capacity
-- ============================================================================
insert into ref.uom (code, name, symbol, quantity_type, created_by)
values
  ('MLT','Millilitre','mL','volume','seed'),
  ('CLT','Centilitre','cL','volume','seed'),
  ('DLT','Decilitre','dL','volume','seed'),
  ('LTR','Litre','L','volume','seed'),
  ('HLT','Hectolitre','hL','volume','seed'),
  ('CMQ','Cubic Centimetre','cm³','volume','seed'),
  ('DMQ','Cubic Decimetre','dm³','volume','seed'),
  ('MTQ','Cubic Metre','m³','volume','seed'),
  ('INQ','Cubic Inch','in³','volume','seed'),
  ('FTQ','Cubic Foot','ft³','volume','seed'),
  ('YDQ','Cubic Yard','yd³','volume','seed'),
  ('GLL','Gallon (US)','gal','volume','seed'),
  ('GLI','Gallon (UK)','gal','volume','seed'),
  ('QTI','Quart (US)','qt','volume','seed'),
  ('PTI','Pint (US)','pt','volume','seed'),
  ('OZA','Fluid Ounce (US)','fl oz','volume','seed'),
  ('BLL','Barrel (US petroleum)','bbl','volume','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Time
-- ============================================================================
insert into ref.uom (code, name, symbol, quantity_type, created_by)
values
  ('SEC','Second','s','time','seed'),
  ('MIN','Minute','min','time','seed'),
  ('HUR','Hour','h','time','seed'),
  ('DAY','Day','d','time','seed'),
  ('WEE','Week','wk','time','seed'),
  ('MON','Month','mo','time','seed'),
  ('ANN','Year','a','time','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Temperature
-- ============================================================================
insert into ref.uom (code, name, symbol, quantity_type, created_by)
values
  ('CEL','Degree Celsius','°C','temperature','seed'),
  ('FAH','Degree Fahrenheit','°F','temperature','seed'),
  ('KEL','Kelvin','K','temperature','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Speed / Velocity
-- ============================================================================
insert into ref.uom (code, name, symbol, quantity_type, created_by)
values
  ('KMH','Kilometre per Hour','km/h','speed','seed'),
  ('MTS','Metre per Second','m/s','speed','seed'),
  ('KNT','Knot','kn','speed','seed'),
  ('HM','Mile per Hour','mph','speed','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Force / Pressure
-- ============================================================================
insert into ref.uom (code, name, symbol, quantity_type, created_by)
values
  ('NEW','Newton','N','force','seed'),
  ('KGF','Kilogram-force','kgf','force','seed'),
  ('PAL','Pascal','Pa','pressure','seed'),
  ('KPA','Kilopascal','kPa','pressure','seed'),
  ('MPA','Megapascal','MPa','pressure','seed'),
  ('BAR','Bar','bar','pressure','seed'),
  ('ATM','Standard Atmosphere','atm','pressure','seed'),
  ('PS','Pound per Square Inch','psi','pressure','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Energy / Power
-- ============================================================================
insert into ref.uom (code, name, symbol, quantity_type, created_by)
values
  ('JOU','Joule','J','energy','seed'),
  ('KJO','Kilojoule','kJ','energy','seed'),
  ('WHR','Watt-hour','Wh','energy','seed'),
  ('KWH','Kilowatt-hour','kWh','energy','seed'),
  ('MWH','Megawatt-hour','MWh','energy','seed'),
  ('WTT','Watt','W','energy','seed'),
  ('KWT','Kilowatt','kW','energy','seed'),
  ('MAW','Megawatt','MW','energy','seed'),
  ('BTU','British Thermal Unit','BTU','energy','seed'),
  ('A53','Electronvolt','eV','energy','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Electric
-- ============================================================================
insert into ref.uom (code, name, symbol, quantity_type, created_by)
values
  ('AMP','Ampere','A','electric','seed'),
  ('B22','Kiloampere','kA','electric','seed'),
  ('VLT','Volt','V','electric','seed'),
  ('KVT','Kilovolt','kV','electric','seed'),
  ('OHM','Ohm','Ω','electric','seed'),
  ('FAR','Farad','F','electric','seed'),
  ('B69','Microfarad','µF','electric','seed'),
  ('D10','Siemens','S','electric','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Frequency
-- ============================================================================
insert into ref.uom (code, name, symbol, quantity_type, created_by)
values
  ('HTZ','Hertz','Hz','frequency','seed'),
  ('KHZ','Kilohertz','kHz','frequency','seed'),
  ('MHZ','Megahertz','MHz','frequency','seed'),
  ('A86','Gigahertz','GHz','frequency','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Data
-- ============================================================================
insert into ref.uom (code, name, symbol, quantity_type, created_by)
values
  ('AD','Byte','B','data','seed'),
  ('E36','Kilobyte','KB','data','seed'),
  ('4L','Megabyte','MB','data','seed'),
  ('E34','Gigabyte','GB','data','seed'),
  ('E35','Terabyte','TB','data','seed'),
  ('E68','Bit','bit','data','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Angle
-- ============================================================================
insert into ref.uom (code, name, symbol, quantity_type, created_by)
values
  ('DD','Degree (angle)','°','angle','seed'),
  ('RAD','Radian','rad','angle','seed'),
  ('D61','Minute (angle)','''','angle','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Density
-- ============================================================================
insert into ref.uom (code, name, symbol, quantity_type, created_by)
values
  ('KMQ','Kilogram per Cubic Metre','kg/m³','density','seed'),
  ('GL','Gram per Litre','g/L','density','seed')
on conflict (code) do nothing;
