const supabase = require('../utils/supabase');

const getAll = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select('*, categories(name, slug)', { count: 'exact' })
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (cat) {
        query = query.eq('category_id', cat.id);
      } else {
        return res.json({ products: [], pagination: { page: +page, limit: +limit, total: 0, totalPages: 0 } });
      }
    }

    if (minPrice) query = query.gte('price', minPrice);
    if (maxPrice) query = query.lte('price', maxPrice);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, count, error } = await query;

    if (error) throw error;

    res.json({
      products: data,
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

const getById = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json({ product: data });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, price, categoryId, stock, isAvailable } = req.body;

    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price,
        category_id: categoryId,
        stock,
        is_available: isAvailable,
      })
      .select('*, categories(name, slug)')
      .single();

    if (error) throw error;

    res.status(201).json({ product: data });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { categoryId, isAvailable, imageUrl, ...rest } = req.body;
    const updates = { ...rest };

    if (categoryId !== undefined) updates.category_id = categoryId;
    if (isAvailable !== undefined) updates.is_available = isAvailable;
    if (imageUrl !== undefined) updates.image_url = imageUrl;

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, categories(name, slug)')
      .single();

    if (error) throw error;

    res.json({ product: data });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
