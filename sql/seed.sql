INSERT INTO categories (name, slug, description) VALUES
  ('Roses', 'roses', 'Bouquets et compositions de roses fraîches'),
  ('Tulipes', 'tulipes', 'Tulipes de saison aux couleurs variées'),
  ('Fleurs séchées', 'fleurs-sechees', 'Compositions de fleurs séchées longue durée'),
  ('Plantes vertes', 'plantes-vertes', 'Plantes d''intérieur faciles d''entretien'),
  ('Bouquets mixtes', 'bouquets-mixtes', 'Bouquets composés de fleurs variées');

INSERT INTO products (name, description, price, image_url, stock, is_available, category_id) VALUES
  ('Bouquet Passion', 'Bouquet de 20 roses rouges longues tiges', 45.00, NULL, 25, true,
    (SELECT id FROM categories WHERE slug = 'roses')),
  ('Roses Éternelles', 'Coffret de 12 roses stabilisées', 59.90, NULL, 15, true,
    (SELECT id FROM categories WHERE slug = 'roses')),
  ('Tulipes Printanières', 'Botte de 30 tulipes multicolores', 29.90, NULL, 40, true,
    (SELECT id FROM categories WHERE slug = 'tulipes')),
  ('Tulipes Royales', 'Bouquet de 20 tulipes perroquet', 35.00, NULL, 20, true,
    (SELECT id FROM categories WHERE slug = 'tulipes')),
  ('Bohème Séché', 'Bouquet de fleurs séchées tons naturels', 38.50, NULL, 30, true,
    (SELECT id FROM categories WHERE slug = 'fleurs-sechees')),
  ('Pampa Doré', 'Composition pampa et eucalyptus séché', 42.00, NULL, 18, true,
    (SELECT id FROM categories WHERE slug = 'fleurs-sechees')),
  ('Monstera Deliciosa', 'Plante verte en pot céramique 30cm', 34.90, NULL, 12, true,
    (SELECT id FROM categories WHERE slug = 'plantes-vertes')),
  ('Ficus Lyrata', 'Figuier lyre en pot design 50cm', 55.00, NULL, 8, true,
    (SELECT id FROM categories WHERE slug = 'plantes-vertes')),
  ('Bouquet du Marché', 'Bouquet champêtre de saison', 32.00, NULL, 35, true,
    (SELECT id FROM categories WHERE slug = 'bouquets-mixtes')),
  ('Symphonie Florale', 'Grand bouquet premium roses, lys et pivoines', 65.00, NULL, 10, true,
    (SELECT id FROM categories WHERE slug = 'bouquets-mixtes'));

INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
  ('admin@florashop.fr', '$2a$10$xPBiGNwPFv5PdVFRmJ5hS.pG7VCr4U5X2VkpRpDjmq5F0w6HvqOPC', 'Admin', 'FloraShop', 'admin'),
  ('client@test.fr', '$2a$10$xPBiGNwPFv5PdVFRmJ5hS.pG7VCr4U5X2VkpRpDjmq5F0w6HvqOPC', 'Jean', 'Dupont', 'client');
