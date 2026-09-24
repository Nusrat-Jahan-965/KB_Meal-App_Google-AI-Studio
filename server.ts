import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as dbOps from './src/db/operations.ts';
import { createPool } from './src/db/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Health check route for Cloud Run
  app.get('/healthz', (_req, res) => {
    res.status(200).json({ status: 'ok', database: 'connected' });
  });

  // REST API Routes backed by PostgreSQL
  // 1. Users
  app.get('/api/users', async (_req, res) => {
    try {
      const users = await dbOps.getUsers();
      res.json(users);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.get('/api/users/:gpfNo', async (req, res) => {
    try {
      const user = await dbOps.getUserByGpf(req.params.gpfNo);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err: any) {
      console.error('Error fetching user:', err);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const user = await dbOps.upsertUser(req.body);
      res.json(user);
    } catch (err: any) {
      console.error('Error saving user:', err);
      res.status(500).json({ error: 'Failed to save user' });
    }
  });

  // 2. Meal Calls
  app.get('/api/meal-calls/latest', async (_req, res) => {
    try {
      const call = await dbOps.getLatestMealCall();
      res.json(call);
    } catch (err: any) {
      console.error('Error fetching latest meal call:', err);
      res.status(500).json({ error: 'Failed to fetch meal call' });
    }
  });

  app.post('/api/meal-calls', async (req, res) => {
    try {
      const call = await dbOps.saveMealCall(req.body);
      res.json(call);
    } catch (err: any) {
      console.error('Error saving meal call:', err);
      res.status(500).json({ error: 'Failed to save meal call' });
    }
  });

  // 3. Meal Bookings
  app.get('/api/bookings/:gpfNo', async (req, res) => {
    try {
      const bookings = await dbOps.getBookingsByGpf(req.params.gpfNo);
      res.json(bookings);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  app.post('/api/bookings', async (req, res) => {
    try {
      const booking = await dbOps.saveMealBooking(req.body);
      res.json(booking);
    } catch (err: any) {
      console.error('Error saving booking:', err);
      res.status(500).json({ error: 'Failed to save booking' });
    }
  });

  // 4. Payments
  app.get('/api/payments', async (req, res) => {
    try {
      const gpfNo = req.query.gpfNo as string | undefined;
      const payments = await dbOps.getPayments(gpfNo);
      res.json(payments);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  });

  app.post('/api/payments', async (req, res) => {
    try {
      const payment = await dbOps.createPayment(req.body);
      res.json(payment);
    } catch (err: any) {
      console.error('Error saving payment:', err);
      res.status(500).json({ error: 'Failed to record payment' });
    }
  });

  // 5. Bazaar Expenses
  app.get('/api/bazaar', async (_req, res) => {
    try {
      const expenses = await dbOps.getBazaarExpenses();
      res.json(expenses);
    } catch (err: any) {
      console.error('Error fetching bazaar expenses:', err);
      res.status(500).json({ error: 'Failed to fetch bazaar expenses' });
    }
  });

  app.post('/api/bazaar', async (req, res) => {
    try {
      const expense = await dbOps.createBazaarExpense(req.body);
      res.json(expense);
    } catch (err: any) {
      console.error('Error saving bazaar expense:', err);
      res.status(500).json({ error: 'Failed to save bazaar expense' });
    }
  });

  // 6. Notices
  app.get('/api/notices', async (_req, res) => {
    try {
      const notices = await dbOps.getNotices();
      res.json(notices);
    } catch (err: any) {
      console.error('Error fetching notices:', err);
      res.status(500).json({ error: 'Failed to fetch notices' });
    }
  });

  app.post('/api/notices', async (req, res) => {
    try {
      const notice = await dbOps.createNotice(req.body);
      res.json(notice);
    } catch (err: any) {
      console.error('Error saving notice:', err);
      res.status(500).json({ error: 'Failed to save notice' });
    }
  });

  // 7. phpMyAdmin / Cloud SQL Studio style DB Inspector Routes
  app.get('/api/db/overview', async (_req, res) => {
    try {
      const pool = createPool();
      // Get all tables in public schema
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);

      const tables = [];
      for (const row of tablesResult.rows) {
        const tableName = row.table_name;
        // Count rows
        const countRes = await pool.query(`SELECT count(*)::int as count FROM "${tableName}";`);
        // Columns
        const colRes = await pool.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `, [tableName]);

        tables.push({
          name: tableName,
          rowCount: countRes.rows[0]?.count || 0,
          columns: colRes.rows,
        });
      }

      res.json({
        database: process.env.SQL_DB_NAME || 'cloud_sql_development_database',
        host: process.env.SQL_HOST,
        engine: 'PostgreSQL 18.6 (Cloud SQL Developer Edition)',
        region: 'asia-southeast1',
        instance: 'ai-studio-9cabea6f',
        tables,
      });
    } catch (err: any) {
      console.error('Error in DB overview:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/db/table/:tableName', async (req, res) => {
    try {
      const tableName = req.params.tableName;
      // Sanitize table name against known allowed tables
      const allowed = ['users', 'meal_bookings', 'meal_calls', 'payments', 'bazaar_expenses', 'notices'];
      if (!allowed.includes(tableName)) {
        return res.status(400).json({ error: 'Invalid table name' });
      }

      const pool = createPool();
      const colRes = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      const dataRes = await pool.query(`SELECT * FROM "${tableName}" ORDER BY 1 DESC LIMIT 100;`);
      res.json({
        tableName,
        columns: colRes.rows,
        rows: dataRes.rows,
        rowCount: dataRes.rowCount,
      });
    } catch (err: any) {
      console.error('Error fetching table data:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/db/query', async (req, res) => {
    try {
      const sql = req.body?.sql?.trim();
      if (!sql) {
        return res.status(400).json({ error: 'SQL query string required' });
      }

      const start = Date.now();
      const pool = createPool();
      const result = await pool.query(sql);
      const executionTime = Date.now() - start;

      res.json({
        command: result.command,
        rowCount: result.rowCount,
        fields: result.fields?.map(f => f.name) || [],
        rows: result.rows || [],
        executionTimeMs: executionTime,
      });
    } catch (err: any) {
      console.error('SQL query execution error:', err);
      res.status(400).json({ error: err.message });
    }
  });

  // Static files or Vite middleware
  const distPath = path.resolve(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next();
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Application build not found.');
      }
    });
  } else {
    // If running in development without prebuilt dist
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on 0.0.0.0:${PORT}`);
  });
}

startServer();
