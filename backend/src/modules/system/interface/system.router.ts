import { Router } from 'express';
import * as systemController from './system.controller.js';

export const systemRouter = Router();

systemRouter.get('/resources', systemController.getResources);
