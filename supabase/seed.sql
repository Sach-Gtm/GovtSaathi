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

-- ============================================================
-- GATC centres (Government Approved Test Centres) — sample registry
-- ============================================================
insert into gatc_centres (name, registration_no, accreditation_scope, valid_from, valid_until, state_code, contact_person, contact_phone, contact_email, address, is_active) values
  ('Western India Test & Calibration Centre', 'GATC-MH-001',
   array['weighing_scale','beam_scale','platform_scale','weighbridge'],
   '2024-04-01', '2027-03-31', 'MH', 'S. Kulkarni', '+91 20 2555 0100', 'gatc.mh001@example.gov.in', 'MIDC Bhosari, Pune', true),
  ('Bengaluru Metrology Test House', 'GATC-KA-004',
   array['weighing_scale','fuel_dispenser','flow_meter','volume_measure'],
   '2024-07-01', '2027-06-30', 'KA', 'R. Iyer', '+91 80 2345 0177', 'gatc.ka004@example.gov.in', 'Peenya Industrial Area, Bengaluru', true),
  ('Capital Calibration Services', 'GATC-DL-002',
   array['weighing_scale','length_measure','capacity_measure'],
   '2022-01-01', '2025-12-31', 'DL', 'A. Verma', '+91 11 2999 0043', 'gatc.dl002@example.gov.in', 'Okhla Phase II, New Delhi', true)
on conflict (registration_no) do nothing;

-- ============================================================
-- Tolerances / MPE reference (simplified percent-of-load; see 0008 note)
-- ============================================================
insert into tolerances (category, accuracy_class, mpe_value, mpe_unit, mpe_is_percent, basis, reference) values
  -- weighing family, class-specific
  ('weighing_scale','II',   0.05, '%', true, 'in-service', 'LM (General) Rules 2011, Sch. — Class II (simplified)'),
  ('weighing_scale','III',  0.10, '%', true, 'in-service', 'LM (General) Rules 2011, Sch. — Class III (simplified)'),
  ('weighing_scale','IIII', 0.20, '%', true, 'in-service', 'LM (General) Rules 2011, Sch. — Class IIII (simplified)'),
  ('weighing_scale', null,  0.10, '%', true, 'in-service', 'default'),
  ('beam_scale', null,      0.10, '%', true, 'in-service', 'default'),
  ('platform_scale','III',  0.10, '%', true, 'in-service', 'Class III (simplified)'),
  ('platform_scale', null,  0.10, '%', true, 'in-service', 'default'),
  ('crane_scale', null,     0.20, '%', true, 'in-service', 'default'),
  ('weighbridge','III',     0.10, '%', true, 'in-service', 'Class III (simplified)'),
  ('weighbridge', null,     0.10, '%', true, 'in-service', 'default'),
  ('fuel_dispenser', null,  0.50, '%', true, 'in-service', 'Fuel dispenser (simplified)'),
  ('flow_meter', null,      1.00, '%', true, 'in-service', 'Flow meter (simplified)'),
  ('length_measure', null,  0.20, '%', true, 'in-service', 'Length measure (simplified)'),
  ('volume_measure', null,  0.50, '%', true, 'in-service', 'Volume measure (simplified)'),
  ('capacity_measure', null,0.50, '%', true, 'in-service', 'Capacity measure (simplified)'),
  ('other', null,           0.50, '%', true, 'in-service', 'default')
on conflict do nothing;
