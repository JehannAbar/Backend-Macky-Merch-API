CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    stock INT NOT NULL,
    category VARCHAR(50) NOT NULL,                 
    isAvailable BOOLEAN DEFAULT TRUE,      
    description VARCHAR(255)
);