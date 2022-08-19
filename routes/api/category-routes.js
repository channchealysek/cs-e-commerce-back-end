const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  try {
    const dataCategorys = await Category.findAll({
      include: [{ model: Product }],
    });
    if (dataCategorys) {
      return res.status(200).json({ dataCategorys });
    }
    return res.status(404).send("doesn't exists");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  try {
    const { id } = req.params;
    const dataCategory = await Category.findOne({
      where: { id },
      include: [{ model: Product }],
    });
    if (dataCategory) {
      return res.status(200).json({ dataCategory });
    }
    return res.status(404).send("Category with the specified ID doesn't exists");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

router.post('/', async (req, res) => {
  // create a new category
  try {
    const dataCategory = await Category.create({
      category_name: req.body.category_name,
    });
    return res.status(200).json(dataCategory);
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  try {
    const { id } = req.params;
    const [updated] = await Category.update(req.body, {
      where: { id },
    });
    if (updated) {
      const updateCategory = await Category.findOne({ where: { id } });
      return res.status(200).json({ category: updateCategory });
    }
    return res.status(404).send("Category with the specified ID doesn't exists");
  } catch (err) {
    return (
      Category.findOne({
        where: {
          id: req.body.category_id,
        },
      })
        .then((dbfindOneCategoryId) => {
          if (!dbfindOneCategoryId) {
            res.status(400).json({ message: `No found with category_id = ${req.body.category_id}` });
          }
        }));
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const { id } = req.params;
    const deleted = await Category.destroy({
      where: { id },
    });
    if (deleted) {
      return res.status(200).send(`Category with ID ${id} was delete!`);
    }
    return res.status(404).send("Category with the specified ID doesn't exists");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = router;
