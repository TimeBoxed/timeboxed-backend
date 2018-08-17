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
  });

  describe('DELETE /tasks/:taskId', () => {

  })
});
