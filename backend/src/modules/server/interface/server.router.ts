import { Router } from 'express';
import * as serverController from './server.controller.js';

export const serverRouter = Router();

serverRouter.get('/', serverController.list);
serverRouter.post('/', serverController.create);
serverRouter.get('/:id', serverController.get);
serverRouter.patch('/:id', serverController.update);
serverRouter.delete('/:id', serverController.remove);
serverRouter.post('/:id/start', serverController.start);
serverRouter.post('/:id/stop', serverController.stop);
serverRouter.post('/:id/restart', serverController.restart);
