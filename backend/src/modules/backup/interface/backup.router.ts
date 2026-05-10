import { Router } from 'express';
import * as backupController from './backup.controller.js';

export const backupRouter = Router({ mergeParams: true });

backupRouter.get('/', backupController.list);
backupRouter.post('/', backupController.create);
backupRouter.delete('/:backupId', backupController.remove);
backupRouter.post('/:backupId/restore', backupController.restore);
