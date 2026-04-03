import { Router } from 'express'
import * as serversController from './servers.controller.js'

export const serversRouter = Router()

serversRouter.get('/', serversController.list)
serversRouter.post('/', serversController.create)
serversRouter.get('/:id', serversController.get)
serversRouter.delete('/:id', serversController.remove)
serversRouter.post('/:id/start', serversController.start)
serversRouter.post('/:id/stop', serversController.stop)
serversRouter.post('/:id/restart', serversController.restart)
