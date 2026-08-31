-- Seed test clients for external agent role-play demo
-- These match the frontend contact selectors

INSERT INTO clients (client_code, company_name, contact_name, email, phone, country, city, client_type, status)
VALUES
  ('GCD-001', 'Groupe Chartier Distribution SAS', 'Véronique Chartier', 'veronique.chartier@groupe.example', '+33 338 9478454', 'France', 'Paris', 'corporate', 'active'),
  ('NPT-002', 'Nord-Pas Textiles SARL', 'Antoine Rousseau', 'antoine.rousseau@nordpas.example', '+33 716 1445199', 'France', 'Lille', 'corporate', 'active'),
  ('RIM-003', 'Ruhrmetall Industrieteile GmbH', 'Bettina Arnold', 'bettina.arnold@ruhrmetall.example', '+49 754 2867825', 'Germany', 'Dortmund', 'corporate', 'active'),
  ('REH-004', 'Rheinland Elektronik Handels AG', 'Sabine Thiel', 'sabine.thiel@rheinland.example', '+49 350 4744854', 'Germany', 'Cologne', 'corporate', 'active')
ON CONFLICT(client_code) DO NOTHING;
