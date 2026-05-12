import { Router } from 'express';
import * as consoleController from './console.controller.js';

export const consoleRouter = Router({ mergeParams: true });

consoleRouter.get('/logs', consoleController.logs);
consoleRouter.post('/command', consoleController.command);
