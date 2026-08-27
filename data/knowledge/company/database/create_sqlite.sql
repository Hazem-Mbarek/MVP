-- ============================================================
-- NordRoute Logistics GmbH
-- Relational Database - MVP
-- SQLite Version
-- ============================================================

CREATE TABLE company (
    company_id INTEGER PRIMARY KEY AUTOINCREMENT,
    legal_name VARCHAR(200) NOT NULL,
    trading_name VARCHAR(200),
    legal_form VARCHAR(100),
    founded_year INTEGER,
    headquarters_city VARCHAR(100),
    headquarters_country VARCHAR(100),
    employee_count INTEGER,
    primary_currency CHAR(3) DEFAULT 'EUR',
    timezone VARCHAR(100)
);


-- ============================================================
-- DEPARTMENTS
-- ============================================================

CREATE TABLE departments (
    department_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    employee_count INTEGER,
    UNIQUE(company_id, name),
    FOREIGN KEY (company_id) REFERENCES company(company_id)
);


-- ============================================================
-- EMPLOYEES
-- ============================================================

CREATE TABLE employees (
    employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    department_id INTEGER,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(50),
    employment_status VARCHAR(30) NOT NULL DEFAULT 'active',
    manager_id INTEGER,
    hire_date DATE,
    can_approve_discounts BOOLEAN DEFAULT 0,
    can_approve_claims BOOLEAN DEFAULT 0,
    can_approve_shipments BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES company(company_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
);


-- ============================================================
-- COUNTRIES
-- ============================================================

CREATE TABLE countries (
    country_id INTEGER PRIMARY KEY AUTOINCREMENT,
    country_code CHAR(2) UNIQUE NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    is_home_market BOOLEAN DEFAULT 0,
    is_active_market BOOLEAN DEFAULT 1
);


-- ============================================================
-- SERVICES
-- ============================================================

CREATE TABLE services (
    service_id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_code VARCHAR(50) UNIQUE NOT NULL,
    service_name VARCHAR(150) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT 1
);


-- ============================================================
-- COUNTRY SERVICE AVAILABILITY
-- ============================================================

CREATE TABLE country_services (
    country_service_id INTEGER PRIMARY KEY AUTOINCREMENT,
    country_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    availability_status VARCHAR(30) NOT NULL,
    notes TEXT,
    UNIQUE(country_id, service_id),
    FOREIGN KEY (country_id) REFERENCES countries(country_id),
    FOREIGN KEY (service_id) REFERENCES services(service_id)
);


-- ============================================================
-- WAREHOUSES
-- ============================================================

CREATE TABLE warehouses (
    warehouse_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    warehouse_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    facility_role VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    area_sqm INTEGER,
    pallet_capacity INTEGER,
    loading_docks INTEGER,
    forklift_count INTEGER,
    temperature_controlled BOOLEAN DEFAULT 0,
    hazardous_goods_storage BOOLEAN DEFAULT 0,
    cross_docking BOOLEAN DEFAULT 0,
    short_term_storage BOOLEAN DEFAULT 0,
    medium_term_storage BOOLEAN DEFAULT 0,
    cctv BOOLEAN DEFAULT 0,
    operating_hours TEXT,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (company_id) REFERENCES company(company_id)
);


-- ============================================================
-- WAREHOUSE CAPABILITIES
-- ============================================================

CREATE TABLE warehouse_capabilities (
    warehouse_capability_id INTEGER PRIMARY KEY AUTOINCREMENT,
    warehouse_id INTEGER NOT NULL,
    capability_code VARCHAR(100) NOT NULL,
    capability_name VARCHAR(150) NOT NULL,
    availability_status VARCHAR(30) DEFAULT 'available',
    notes TEXT,
    UNIQUE(warehouse_id, capability_code),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id)
);


-- ============================================================
-- VEHICLES
-- ============================================================

CREATE TABLE vehicles (
    vehicle_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    vehicle_code VARCHAR(30) UNIQUE NOT NULL,
    vehicle_type VARCHAR(100) NOT NULL,
    registration_country CHAR(2),
    payload_kg INTEGER,
    volume_m3 DECIMAL(10,2),
    pallet_capacity INTEGER,
    has_tail_lift BOOLEAN DEFAULT 0,
    has_gps BOOLEAN DEFAULT 1,
    side_loading BOOLEAN DEFAULT 0,
    rear_loading BOOLEAN DEFAULT 1,
    temperature_controlled BOOLEAN DEFAULT 0,
    adr_capable BOOLEAN DEFAULT 0,
    current_status VARCHAR(50) NOT NULL DEFAULT 'available',
    current_location VARCHAR(150),
    notes TEXT,
    FOREIGN KEY (company_id) REFERENCES company(company_id)
);
