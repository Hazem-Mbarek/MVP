PRAGMA foreign_keys = ON;

-- ============================================================
-- COMMERCIAL: CLIENTS
-- ============================================================

CREATE TABLE clients (
    client_id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_code VARCHAR(30) UNIQUE NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(200),
    email VARCHAR(200),
    phone VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    client_type VARCHAR(50),
    status VARCHAR(30) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);


-- ============================================================
-- COMMERCIAL: PRICING MODELS
-- ============================================================

CREATE TABLE pricing_models (
    pricing_model_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    pricing_method VARCHAR(50) NOT NULL,
    currency CHAR(3) DEFAULT 'EUR',
    is_active BOOLEAN DEFAULT 1
);


-- ============================================================
-- COMMERCIAL: JOBS
-- ============================================================

CREATE TABLE jobs (
    job_id INTEGER PRIMARY KEY AUTOINCREMENT,

    client_id INTEGER NOT NULL,
    service_id INTEGER,

    job_code VARCHAR(30) UNIQUE NOT NULL,

    shipment_type VARCHAR(100),
    content_description TEXT,
    weight_kg DECIMAL(10,2),

    origin_city VARCHAR(100),
    origin_country VARCHAR(100),

    destination_city VARCHAR(100),
    destination_country VARCHAR(100),

    departure_date DATE,
    arrival_date DATE,
    return_to_warehouse_date DATE,

    vehicle_id INTEGER,
    driver_employee_id INTEGER,

    pricing_model_id INTEGER,
    price DECIMAL(12,2),
    currency CHAR(3) DEFAULT 'EUR',

    voyage_length_km DECIMAL(10,2),

    status VARCHAR(50) DEFAULT 'planned',

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id)
        REFERENCES clients(client_id),

    FOREIGN KEY (service_id)
        REFERENCES services(service_id),

    FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(vehicle_id),

    FOREIGN KEY (driver_employee_id)
        REFERENCES employees(employee_id),

    FOREIGN KEY (pricing_model_id)
        REFERENCES pricing_models(pricing_model_id)
);


-- ============================================================
-- COMMERCIAL: ISSUES
-- ============================================================

CREATE TABLE issues (
    issue_id INTEGER PRIMARY KEY AUTOINCREMENT,

    job_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,

    issue_type VARCHAR(50) NOT NULL,
    severity VARCHAR(30) DEFAULT 'medium',
    status VARCHAR(30) DEFAULT 'open',

    reported_date DATE DEFAULT CURRENT_DATE,

    description TEXT,

    responsible_employee_id INTEGER,

    company_decision TEXT,
    resolution TEXT,

    resolved_date DATE,

    cost DECIMAL(12,2) DEFAULT 0,
    client_compensation DECIMAL(12,2) DEFAULT 0,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (job_id)
        REFERENCES jobs(job_id),

    FOREIGN KEY (client_id)
        REFERENCES clients(client_id),

    FOREIGN KEY (responsible_employee_id)
        REFERENCES employees(employee_id)
);