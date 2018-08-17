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

const removeTaskMock = () => {
  return Promise.all([
    Task.remove(),
    removeProfileMock(),
  ]);
};

export { createTaskMock, removeTaskMock };
