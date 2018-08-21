'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import HttpError from 'http-errors';
import logger from '../lib/logger';
import bearerAuthMiddleware from '../lib/bearer-auth-middleware';
import Task from '../model/task';

const jsonParser = bodyParser.json();
const taskRouter = new Router();

taskRouter.post('/tasks', bearerAuthMiddleware, jsonParser, (request, response, next) => {
  if (!request.body.profile) {
    return next(new HttpError(404, 'TASK ROUTER ERROR: profile not found'));
  }
  if (!request.body.title) {
    logger.log(logger.ERROR, 'TASK_ROUTER - POST - Responding with 400 code - title is required');
    return next(new HttpError(400, 'TASK title is required'));
  }
  
  return new Task(request.body).save()
    .then((task) => {
      logger.log(logger.INFO, 'TASK ROUTER - POST - responding with a 200 status code');
      response.json(task);
    })
    .catch(next);
});

taskRouter.get('/tasks/:profileId', bearerAuthMiddleware, (request, response, next) => {
  return Task.find({ profile: request.params.profileId })
    .then((tasks) => {
      logger.log(logger.INFO, '200 - TASK ROUTER - GET ALL');
      return response.json(tasks);
    })
    .catch(next);
});

taskRouter.put('/tasks/:taskId', bearerAuthMiddleware, jsonParser, (request, response, next) => {
  console.log(request.body, 'request body', request.params.taskId);
  const options = { runValidators: true, new: true };
  return Task.findByIdAndUpdate(request.params.taskId, request.body, options)
    .then((task) => {
      console.log(task, 'task after updating');
      logger.log(logger.INFO, '200 - TASK Updated');
      return response.json(task);
    })
    .catch(next);
});

taskRouter.delete('/tasks/:taskId', bearerAuthMiddleware, (request, response, next) => {
  return Task.findById(request.params.taskId)
    .then((task) => {
      logger.log(logger.INFO, `TASK ROUTER - REMOVING TASK FOUND AT ${request.params.taskId}`);
      return task.remove();
    })
    .then(() => {
      logger.log(logger.INFO, '204 - TASK DELETED');
      return response.sendStatus(204);
    })
    .catch(next);
});

export default taskRouter;
