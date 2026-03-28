const supabase = require('../utils/supabase');
const stripe = require('../services/stripeService');

const checkout = async (req, res, next) => {
  try {
    const { deliveryAddress, deliveryCity, deliveryZip, deliveryDate } = req.body;

    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*, products(id, name, price, stock)')
      .eq('user_id', req.user.userId);

    if (cartError) throw cartError;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Votre panier est vide' });
    }

    for (const item of cartItems) {
      if (item.quantity > item.products.stock) {
        return res.status(400).json({
          error: `Stock insuffisant pour "${item.products.name}" (disponible: ${item.products.stock}, demandé: ${item.quantity})`,
        });
      }
    }

    const totalAmount = +(cartItems.reduce((sum, item) => sum + item.quantity * item.products.price, 0)).toFixed(2);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.userId,
        status: 'pending',
        total_amount: totalAmount,
        delivery_address: deliveryAddress,
        delivery_city: deliveryCity,
        delivery_zip: deliveryZip,
        delivery_date: deliveryDate,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.products.id,
      quantity: item.quantity,
      unit_price: item.products.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'eur',
      metadata: { orderId: order.id, userId: req.user.userId },
    });

    const { error: updateError } = await supabase
      .from('orders')
      .update({ stripe_payment_id: paymentIntent.id })
      .eq('id', order.id);

    if (updateError) throw updateError;

    order.stripe_payment_id = paymentIntent.id;

    res.status(201).json({ order, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ orders: data });
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(id, name, price, image_url))')
      .eq('id', req.params.id)
      .eq('user_id', req.user.userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json({ order: data });
  } catch (err) {
    next(err);
  }
};

module.exports = { checkout, getMyOrders, getOrderById };
