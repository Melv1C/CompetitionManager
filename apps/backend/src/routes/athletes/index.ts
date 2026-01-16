import { Hono } from 'hono';
import { deletePerformanceCacheRouter } from './delete-perf-cache';
import { getAthletesRouter } from './get-athletes';
import { getBestPerformancesRouter } from './get-best-performances';

export const athletesRoutes = new Hono()
  .route('/', getAthletesRouter)
  .route('/', getBestPerformancesRouter)
  .route('/', deletePerformanceCacheRouter);
