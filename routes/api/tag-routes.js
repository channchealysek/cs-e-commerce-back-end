const router = require('express').Router();
const { Tag, Product } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const dataTags = await Tag.findAll({
      include: [{ model: Product }],

    });
    if (dataTags) {
      return res.status(200).json({ dataTags });
    }
    return res.status(404).send("doesn't exists");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const { id } = req.params;
    const dataTag = await Tag.findOne({
      where: { id },
      include: [{ model: Product }],
    });
    if (dataTag) {
      return res.status(200).json({ dataTag });
    }
    return res.status(404).send("Tag with the specified ID doesn't exists");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  try {
    const dataTag = await Tag.create({
      tag_name: req.body.tag_name,
    });
    return res.status(200).json(dataTag);
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  try {
    const { id } = req.params;
    const [updated] = await Tag.update(req.body, {
      where: { id },
    });
    if (updated) {
      const updatedTag = await Tag.findOne({ where: { id } });
      return res.status(200).json({ tag: updatedTag });
    }
    return res.status(404).send("Tag with the specified ID doesn't exists");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const { id } = req.params;
    const deleted = await Tag.destroy({
      where: { id },
    });
    if (deleted) {
      return res.status(200).send('Tag deleted');
    }
    return res.status(404).send("Tag with the specified ID doesn't exists");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = router;
