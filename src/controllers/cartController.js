const supabase = require('../utils/supabase');

const getCart = async (req, res, next) => {
  try {
    const { data: items, error } = await supabase
      .from('cart_items')
      .select('*, products(id, name, price, image_url, stock)')
      .eq('user_id', req.user.userId)
      .order('added_at', { ascending: false });

    if (error) throw error;

    const total = +(items.reduce((sum, item) => sum + item.quantity * item.products.price, 0)).toFixed(2);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({ items, total, itemCount });
  } catch (err) {
    next(err);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, stock, is_available')
      .eq('id', productId)
      .single();

    if (productError || !product || !product.is_available) {
      return res.status(404).json({ error: 'Produit non trouvé ou indisponible' });
    }

    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', req.user.userId)
      .eq('product_id', productId)
      .single();

    const newQuantity = existing ? existing.quantity + quantity : quantity;

    if (newQuantity > product.stock) {
      return res.status(400).json({ error: 'Stock insuffisant' });
    }

    let data, error;

    if (existing) {
      ({ data, error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existing.id)
        .select('*, products(id, name, price, image_url, stock)')
        .single());
    } else {
      ({ data, error } = await supabase
        .from('cart_items')
        .insert({ user_id: req.user.userId, product_id: productId, quantity })
        .select('*, products(id, name, price, image_url, stock)')
        .single());
    }

    if (error) throw error;

    res.status(201).json({ item: data });
  } catch (err) {
    next(err);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', req.user.userId);

      if (error) throw error;

      return res.status(204).send();
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .eq('user_id', req.user.userId)
      .select('*, products(id, name, price, image_url, stock)')
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Item non trouvé' });
    }

    res.json({ item: data });
  } catch (err) {
    next(err);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', req.params.itemId)
      .eq('user_id', req.user.userId);

    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.userId);

    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
