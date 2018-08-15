'use strict';

import faker from 'faker';
import Account from '../../model/account';

const createAccountMock = () => {
  const mock = {};
  mock.request = {
    username: faker.lorem.word(),
    email: faker.internet.email(),
    tokenSeed: faker.lorem.words(),
  };

  return Account.create(
    mock.request.username,
    mock.request.email,
    mock.request.accessToken,
  )
    .then((account) => {
      mock.account = account;
      return account.pCreateLoginToken();
    })
    .then((token) => {
      mock.token = token;
      return Account.findById(mock.account._id);
    })
    .then((account) => {
      mock.account = account;
      return mock;
    });
};

const removeAccountMock = () => Account.remove({});

export { createAccountMock, removeAccountMock };
