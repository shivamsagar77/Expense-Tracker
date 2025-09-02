const Category = require('../model/Category');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ where: { deleted_at: null } });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories', error: err.message });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    const existing = await Category.findOne({ where: { name } });
    if (existing) return res.status(409).json({ message: 'Category already exists' });
    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error adding category', error: err.message });
  }
};
