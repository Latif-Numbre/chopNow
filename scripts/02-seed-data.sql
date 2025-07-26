-- Insert sample users
INSERT INTO users (id, name, email, role, phone) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'John Doe', 'john@example.com', 'user', '+233201234567'),
('550e8400-e29b-41d4-a716-446655440002', 'Mama Akosua', 'akosua@vendor.com', 'vendor', '+233207654321'),
('550e8400-e29b-41d4-a716-446655440003', 'Kwame Asante', 'kwame@vendor.com', 'vendor', '+233209876543'),
('550e8400-e29b-41d4-a716-446655440004', 'Admin User', 'admin@chopnow.com', 'admin', '+233200000000');

-- Insert sample vendors
INSERT INTO vendors (id, user_id, vendor_name, description, status, address, phone) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Mama Akosua Kitchen', 'Authentic Ghanaian dishes made with love', 'approved', 'Osu, Accra', '+233207654321'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Kwame''s Waakye Spot', 'Best waakye in town with fresh ingredients', 'approved', 'Madina, Accra', '+233209876543');

-- Insert sample menu items
INSERT INTO menu_items (vendor_id, name, description, price, category, available) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Jollof Rice', 'Spicy Ghanaian jollof rice with chicken', 25.00, 'Rice Dishes', true),
('660e8400-e29b-41d4-a716-446655440001', 'Banku with Tilapia', 'Fresh tilapia with banku and pepper sauce', 35.00, 'Traditional', true),
('660e8400-e29b-41d4-a716-446655440001', 'Kelewele', 'Spiced fried plantain cubes', 10.00, 'Snacks', true),
('660e8400-e29b-41d4-a716-446655440002', 'Waakye', 'Rice and beans with stew and sides', 20.00, 'Rice Dishes', true),
('660e8400-e29b-41d4-a716-446655440002', 'Red Red', 'Black-eyed peas stew with fried plantain', 18.00, 'Traditional', true),
('660e8400-e29b-41d4-a716-446655440002', 'Kenkey with Fish', 'Fermented corn dough with grilled fish', 30.00, 'Traditional', true);
