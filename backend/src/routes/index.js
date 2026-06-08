import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './auth.routes.js';
import customerRoutes from './customer.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import emiRoutes from './emi.routes.js';
import loanRoutes from './loan.routes.js';
import paymentRoutes from './payment.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  const databaseStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const databaseState = databaseStates[mongoose.connection.readyState] || 'unknown';
  const databaseConnected = mongoose.connection.readyState === 1;

  res.json({
    status: 'success',
    message: databaseConnected
      ? 'Finora API and database are healthy'
      : 'Finora API is running, but database is not connected',
    database: {
      connected: databaseConnected,
      state: databaseState,
    },
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/customers', customerRoutes);
router.use('/loans', loanRoutes);
router.use('/emis', emiRoutes);
router.use('/payments', paymentRoutes);

export default router;
