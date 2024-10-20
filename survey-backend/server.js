require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

// Get all surveys
app.get('/api/surveys', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM surveys');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific survey
app.get('/api/surveys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM surveys WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new survey
app.post('/api/surveys', async (req, res) => {
  try {
    const { title, json, creator_wallet_address } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO surveys (title, json, creator_wallet_address) VALUES ($1, $2, $3) RETURNING *',
      [title, json, creator_wallet_address]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a survey
app.put('/api/surveys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, json } = req.body;
    const { rows } = await pool.query(
      'UPDATE surveys SET title = $1, json = $2 WHERE id = $3 RETURNING *',
      [title, json, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a survey
app.delete('/api/surveys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM surveys WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
