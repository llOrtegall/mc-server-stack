import { Router } from 'express'
import * as backupsController from './backups.controller.js'

export const backupsRouter = Router({ mergeParams: true })

backupsRouter.get('/', backupsController.list)
backupsRouter.post('/', backupsController.create)
backupsRouter.delete('/:backupId', backupsController.remove)
backupsRouter.post('/:backupId/restore', backupsController.restore)
