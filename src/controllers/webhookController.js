const supabase = require('../utils/supabase');
const stripe = require('../services/stripeService');

const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Signature invalide' });
  }

  if (event.type === 'payment_intent.succeeded') {
    const { orderId, userId } = event.data.object.metadata;

    try {
      await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', orderId);

      const { data: items } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);

      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        await supabase
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', item.product_id);
      }

      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);
    } catch (err) {
      console.error('Webhook processing error:', err.message);
    }
  }

  res.json({ received: true });
};

module.exports = { stripeWebhook };
