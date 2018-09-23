'use strict';

import faker from 'faker';
import Task from '../../model/task';
import { createProfileMock, removeProfileMock } from './profile-mock';

const createTaskMock = () => {
  let resultMock = {};

  return createProfileMock()
    .then((profileMock) => {
      resultMock = profileMock;

      return new Task({
        title: faker.lorem.words(5),
        profile: resultMock.profile._id,
      }).save();
    })
    .then((task) => {
      resultMock.task = task;
      return resultMock;
    });
};

const createManyTaskMocks = (num) => {
  let resultMock = {};

  return createProfileMock()
    .then((mock) => {
      resultMock = mock;
      resultMock.manyTasks = [];
      return Promise.all(new Array(num)
        .fill(0)
        .map(() => {
          return new Task({
            title: faker.lorem.words(5),
            profile: mock.profile._id,
          }).save()
            .then(task => resultMock.manyTasks.push(task));
        }));
    })
    .then(() => {
      return resultMock;
    });
};

const removeTaskMock = () => {
  return Promise.all([
    Task.remove(),
    removeProfileMock(),
  ]);
};

export { createTaskMock, createManyTaskMocks ,removeTaskMock };
