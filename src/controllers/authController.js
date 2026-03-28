const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabase');

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        first_name: firstName,
        last_name: lastName,
        phone,
      })
      .select('id, email, first_name, last_name, role')
      .single();

    if (error) throw error;

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, first_name, last_name, role')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash, ...userWithoutPassword } = user;

    res.status(200).json({ user: userWithoutPassword, token });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, role, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error) throw error;

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
