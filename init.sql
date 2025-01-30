CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image VARCHAR(255),
  category VARCHAR(255),
  quantity INT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);