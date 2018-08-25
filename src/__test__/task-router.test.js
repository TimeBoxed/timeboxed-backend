'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { createProfileMock } from './lib/profile-mock';
import { createTaskMock, removeTaskMock } from './lib/task-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('TASK ROUTES', () => {
  beforeAll(startServer);
  afterEach(removeTaskMock);
  afterAll(stopServer);

  describe('POST /tasks', () => {
    test('should return new task and 200 status code', () => {
      let profileToCompare = null;
      return createProfileMock()
        .then((profileMock) => {
          profileToCompare = profileMock.profile;
          return superagent.post(`${apiURL}/tasks`)
            .set('Authorization', `Bearer ${profileMock.token}`)
            .send({ title: 'New Task', profile: profileMock.profile._id });
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.title).toEqual('New Task');
          expect(response.body.timeEstimate).toEqual(30);
          expect(response.body.completed).toBe(false);
          expect(response.body.profile.toString()).toEqual(profileToCompare._id.toString());
        });
    });
    test('should throw 404 error if profile is not passed', () => {
      return createProfileMock()
        .then((profileMock) => {
          return superagent.post(`${apiURL}/tasks`)
            .set('Authorization', `Bearer ${profileMock.token}`)
            .send({ title: 'Task without profile' });
        })
        .then(Promise.reject)
        .catch((err) => {
          expect(err.status).toEqual(404);
        });
    });
    test('should throw 400 error if title is not passed', () => {
      return createProfileMock()
        .then((profileMock) => {
          return superagent.post(`${apiURL}/tasks`)
            .set('Authorization', `Bearer ${profileMock.token}`)
            .send({ profile: profileMock.profile._id });
        })
        .then(Promise.reject)
        .catch((err) => {
          expect(err.status).toEqual(400);
        });
    });
  });

  describe('GET /tasks/:profileId', () => {
    test('should return task and 200 status code', () => {
      let taskToCompare = null;
      return createTaskMock()
        .then((taskMock) => {
          taskToCompare = taskMock.task;
          return superagent.get(`${apiURL}/tasks/${taskMock.profile._id}`)
            .set('Authorization', `Bearer ${taskMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body).toHaveLength(1);
          expect(response.body[0].title).toEqual(taskToCompare.title);
          expect(response.body[0].profile.toString()).toEqual(taskToCompare.profile.toString());
        });
    });

    test('should throw 500 error if invalid profile id is passed', () => {
      return createTaskMock()
        .then((taskMock) => {
          return superagent.get(`${apiURL}/tasks/INVALIDPROFILE`)
            .set('Authorization', `Bearer ${taskMock.token}`);
        })
        .then(Promise.reject)
        .catch((err) => {
          expect(err.status).toEqual(500);
        });
    });
  });

  describe('DELETE /tasks/:taskId', () => {
    test('should return 204 status code', () => {
      return createTaskMock()
        .then((taskMock) => {
          return superagent.del(`${apiURL}/tasks/${taskMock.task._id}`)
            .set('Authorization', `Bearer ${taskMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(204);
        });
    });

    test('should return 500 if task id is invalid', () => {
      return createProfileMock()
        .then((taskMock) => {
          return superagent.del(`${apiURL}/tasks/INVALIDTASKID`)
            .set('Authorization', `Bearer ${taskMock.token}`);
        })
        .then(Promise.reject)
        .catch((err) => {
          expect(err.status).toEqual(500);
        });
    });
  });

  describe('PUT /tasks/:taskId', () => {
    test('should return updated task and 200 status code', () => {
      let taskToUpdate = null;
      return createTaskMock()
        .then((taskMock) => {
          taskToUpdate = taskMock.task;
          return superagent.put(`${apiURL}/tasks/${taskMock.task._id}`)
            .set('Authorization', `Bearer ${taskMock.token}`)
            .send({ title: 'UPDATED TITLE' });
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.title).toEqual('UPDATED TITLE');
          expect(response.body._id.toString()).toEqual(taskToUpdate._id.toString());
        });
    });
  });
});
