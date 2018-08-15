'use strict';

import faker from 'faker';
import Profile from '../../model/profile';
import { createAccountMock, removeAccountMock } from './account-mock';

const createProfileMock = () => {
  let resultMock = {};

  return createAccountMock()
    .then((accountSetMock) => {
      resultMock = accountSetMock;

      return new Profile({
        username: faker.lorem.word(),
        email: faker.internet.email(),
        privacySigned: false,
        account: resultMock.account._id,
      }).save();
    })
    .then((profile) => {
      resultMock.profile = profile;
      return resultMock;
    });
};

const removeProfileMock = () => {
  return Promise.all([
    Profile.remove({}),
    removeAccountMock(),
  ]);
};

export { createProfileMock, removeProfileMock };
