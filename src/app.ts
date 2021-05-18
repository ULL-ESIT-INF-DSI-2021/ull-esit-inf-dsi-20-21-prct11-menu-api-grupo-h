import * as express from 'express';
import './db/mongoose';
import {Ingredient} from './models/ingredients';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Post

app.post('/ingredient', (req, res) => {
  const ingredient = new Ingredient(req.body);

  ingredient.save().then((ingredient) => {
    res.status(201).send(ingredient);
  }).catch((error) => {
    res.status(400).send(error);
  });
});

// Get

app.get('/ingredient', (req, res) => {
  const filter = req.query.name?{name: req.query.name.toString()}:{};

  Ingredient.find(filter).then((ingredient) => {
    if (ingredient.length !== 0) {
      res.send(ingredient);
    } else {
      res.status(404).send();
    }
  }).catch(() => {
    res.status(500).send();
  });
});

// Get id

app.get('/ingredient/:id', (req, res) => {
  Ingredient.findById(req.params.id).then((ingredient) => {
    if (!ingredient) {
      res.status(404).send();
    } else {
      res.send(ingredient);
    }
  }).catch(() => {
    res.status(500).send();
  });
});


// Patch

app.patch('/ingredient', (req, res) => {
  if (!req.query.name) {
    res.status(400).send({
      error: 'A name must be provided',
    });
  } else {
    const allowedUpdates = ['name', 'location', 'carboHydrates', 'proteins', 'lipids', 'price', 'type'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      res.status(400).send({
        error: 'Update is not permitted',
      });
    } else {
      Ingredient.findOneAndUpdate({name: req.query.name.toString()}, req.body, {
        new: true,
        runValidators: true,
      }).then((ingredient) => {
        if (!ingredient) {
          res.status(404).send();
        } else {
          res.send(ingredient);
        }
      }).catch((error) => {
        res.status(400).send(error);
      });
    }
  }
});

// Patch id

app.patch('/ingredient/:id', (req, res) => {
  const allowedUpdates = ['name', 'location', 'carboHydrates', 'proteins', 'lipids', 'price', 'type'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    res.status(400).send({
      error: 'Update is not permitted',
    });
  } else {
    Ingredient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).then((ingredient) => {
      if (!ingredient) {
        res.status(404).send();
      } else {
        res.send(ingredient);
      }
    }).catch((error) => {
      res.status(400).send(error);
    });
  }
});

// Delete

app.delete('/ingredient', (req, res) => {
  if (!req.query.name) {
    res.status(400).send({
      error: 'A name must be provided',
    });
  } else {
    Ingredient.findOneAndDelete({name: req.query.name.toString()}).then((ingredient) => {
      if (!ingredient) {
        res.status(404).send();
      } else {
        res.send(ingredient);
      }
    }).catch(() => {
      res.status(400).send();
    });
  }
});

// Delete id

app.delete('/ingredient/:id', (req, res) => {
  Ingredient.findByIdAndDelete(req.params.id).then((ingredient) => {
    if (!ingredient) {
      res.status(404).send();
    } else {
      res.send(ingredient);
    }
  }).catch(() => {
    res.status(400).send();
  });
});

app.all('*', (_, res) => {
  res.status(501).send();
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
