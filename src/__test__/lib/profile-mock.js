'use strict';

import Profile from '../../model/profile';
import { createAccountMock, removeAccountMock } from './account-mock';

const createProfileMock = () => {
  let resultMock = {};

  return createAccountMock()
    .then((accountSetMock) => {
      resultMock = accountSetMock;

      return new Profile({
        username: resultMock.account.username,
        email: resultMock.account.email,
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
