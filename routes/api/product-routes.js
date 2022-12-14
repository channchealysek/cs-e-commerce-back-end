const router = require('express').Router();
const {
  Product, Category, Tag, ProductTag,
} = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  try {
    const dataProducts = await Product.findAll({
      include: [
        {
          model: Category,
          attributes: ['category_name'],
        },
        {
          model: Tag,
          attributes: ['tag_name'],
        },
      ],
    });
    if (dataProducts) {
      return res.status(200).json({ dataProducts });
    }
    return res.status(404).send("doesn't exists");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  try {
    const { id } = req.params;
    const dataProduct = await Product.findOne({
      where: { id },
      include: [
        {
          model: Category,
          attributes: ['category_name'],
        },
        {
          model: Tag,
          attributes: ['tag_name'],
        },
      ],
    });
    if (dataProduct) {
      return res.status(200).json({ dataProduct });
    }
    return res.status(404).send("Product with the specified ID doesn't exists");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// create new product
router.post('/', (req, res) => {
  const arrTagId = [];
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => ({
          product_id: product.id,
          tag_id,
        }));
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      return res.status(200).json(product);
    })
    .then((productTagIds) => {
      if (productTagIds) {
        Product.findAll({
          include: [
            {
              model: Category,
              attributes: ['category_name'],
            },
            {
              model: Tag,
              attributes: ['tag_name'],
            },
          ],
          limit: 1,
          order: [['id', 'DESC']],
        })
          .then((dataProduct) => res.status(200).json(dataProduct));
      }
    })
    .catch(() => {
      Category.findOne({
        where: {
          id: req.body.category_id,
        },
      })
        .then((dbfindOneCategeyid) => {
          if (!dbfindOneCategeyid) {
            res.status(400).json({ message: `No found with category_id = ${req.body.category_id}` });
          } else {
            const tagIdCounts = req.body.tagIds.length;
            for (let i = 0; i < tagIdCounts; i++) {
              Tag.findOne({
                where: {
                  id: req.body.tagIds[i],
                },
              })
                .then((dbfindOndTag) => {
                  if (!dbfindOndTag) {
                    arrTagId.push(req.body.tagIds[i]);
                    if (i === tagIdCounts - 1) { res.status(400).json({ message: `No found with tag_id = ${arrTagId}` }); }
                  }
                });
            }
          }
        });
    });
});

// update product
router.put('/:id', (req, res) => {
  const arrTagId = [];
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then(() =>
      // find all associated tags from ProductTag
      ProductTag.findAll({ where: { product_id: req.params.id } }))
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => ({
          product_id: req.params.id,
          tag_id,
        }));
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => {
      if (updatedProductTags) {
        Product.findOne({
          where: {
            id: req.params.id,
          },
          include: [
            {
              model: Category,
              attributes: ['category_name'],
            },
            {
              model: Tag,
              attributes: ['tag_name'],
            },
          ],
        })
          .then((dataProduct) => res.status(200).json(dataProduct));
      }
    })
    .catch(() => {
      Product.findOne({
        where: {
          id: req.params.id,
        },
      })
        .then((dbfindOne) => {
          if (!dbfindOne) {
            // console.log(err);
            res.status(400).json({ message: `No found with product_id = ${req.params.id}` });
          } else {
            Category.findOne({
              where: {
                id: req.body.category_id,
              },
            })
              .then((dbfindOneCategeyid) => {
                if (!dbfindOneCategeyid) {
                  res.status(400).json({ message: `No found with category_id = ${req.body.category_id}` });
                } else {
                  const tagIdCounts = req.body.tagIds.length;
                  for (let i = 0; i < tagIdCounts; i++) {
                    Tag.findOne({
                      where: {
                        id: req.body.tagIds[i],
                      },
                    })
                      .then((dbfindOndTag) => {
                        if (!dbfindOndTag) {
                          arrTagId.push(req.body.tagIds[i]);
                          if (i === tagIdCounts - 1) { res.status(400).json({ message: `No found with tag_id = ${arrTagId}` }); }
                        }
                      });
                  }
                }
              });
          }
        });
    });
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const { id } = req.params;
    const deleted = await Product.destroy({
      where: { id },
    });
    if (deleted) {
      return res.status(200).send('Product deleted');
    }
    return res.status(404).send("Product with the specified ID doesn't exists")
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = router;
