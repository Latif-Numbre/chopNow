-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Vendors policies
CREATE POLICY "Anyone can view approved vendors" ON vendors
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Vendors can manage their own profile" ON vendors
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all vendors" ON vendors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Menu items policies
CREATE POLICY "Anyone can view available menu items" ON menu_items
    FOR SELECT USING (available = true);

CREATE POLICY "Vendors can manage their menu items" ON menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM vendors 
            WHERE vendors.id = menu_items.vendor_id 
            AND vendors.user_id = auth.uid()
        )
    );

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can view orders for their restaurant" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM vendors 
            WHERE vendors.id = orders.vendor_id 
            AND vendors.user_id = auth.uid()
        )
    );

CREATE POLICY "Vendors can update their orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM vendors 
            WHERE vendors.id = orders.vendor_id 
            AND vendors.user_id = auth.uid()
        )
    );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT TO authenticated;

CREATE POLICY "Users can create reviews for their orders" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);
