const supabase = require('../utils/supabase');

const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped'],
  shipped: ['delivered'],
};

const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('orders')
      .select('*, users(first_name, last_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);

    const { data, count, error } = await query;

    if (error) throw error;

    res.json({
      orders: data,
      pagination: {
        page: +page,
        limit: +limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(newStatus)) {
      return res.status(400).json({ error: 'Transition de statut invalide' });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ order: data });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [allOrders, todayOrdersRes, orderItems] = await Promise.all([
      supabase.from('orders').select('total_amount, status'),
      supabase.from('orders').select('total_amount, status').gte('created_at', todayStart.toISOString()),
      supabase.from('order_items').select('product_id, quantity, products(name)'),
    ]);

    if (allOrders.error) throw allOrders.error;
    if (todayOrdersRes.error) throw todayOrdersRes.error;
    if (orderItems.error) throw orderItems.error;

    const totalRevenue = allOrders.data
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

    const totalOrders = allOrders.data.length;

    const todayOrders = todayOrdersRes.data.length;
    const todayRevenue = todayOrdersRes.data
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

    const ordersByStatus = {};
    for (const o of allOrders.data) {
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    }

    const productQuantities = {};
    for (const item of orderItems.data) {
      if (!productQuantities[item.product_id]) {
        productQuantities[item.product_id] = { name: item.products.name, totalQuantity: 0 };
      }
      productQuantities[item.product_id].totalQuantity += item.quantity;
    }

    const topProducts = Object.entries(productQuantities)
      .map(([id, { name, totalQuantity }]) => ({ id, name, totalQuantity }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    res.json({
      todayOrders,
      todayRevenue: +todayRevenue.toFixed(2),
      totalRevenue: +totalRevenue.toFixed(2),
      totalOrders,
      ordersByStatus,
      topProducts,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllOrders, updateOrderStatus, getStats };
