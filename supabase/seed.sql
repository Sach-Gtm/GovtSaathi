-- Seed reference data — states & a few districts
insert into states (code, name, region) values
  ('MH', 'Maharashtra', 'West'),
  ('DL', 'Delhi', 'North'),
  ('KA', 'Karnataka', 'South'),
  ('TN', 'Tamil Nadu', 'South'),
  ('GJ', 'Gujarat', 'West'),
  ('UP', 'Uttar Pradesh', 'North'),
  ('WB', 'West Bengal', 'East'),
  ('RJ', 'Rajasthan', 'North'),
  ('PB', 'Punjab', 'North'),
  ('KL', 'Kerala', 'South')
on conflict (code) do nothing;

insert into districts (state_code, name) values
  ('MH','Mumbai City'), ('MH','Pune'), ('MH','Nagpur'), ('MH','Nashik'),
  ('DL','New Delhi'), ('DL','South Delhi'), ('DL','North Delhi'),
  ('KA','Bengaluru Urban'), ('KA','Mysuru'),
  ('TN','Chennai'), ('TN','Coimbatore'),
  ('GJ','Ahmedabad'), ('GJ','Surat'),
  ('UP','Lucknow'), ('UP','Kanpur Nagar'),
  ('WB','Kolkata'),
  ('RJ','Jaipur'),
  ('PB','Ludhiana'),
  ('KL','Ernakulam')
on conflict (state_code, name) do nothing;
