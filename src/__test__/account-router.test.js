'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { createAccountMock, removeAccountMock } from './lib/account-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('ACCOUNT ROUTES', () => {
  beforeAll(startServer);
  afterEach(removeAccountMock);
  afterAll(stopServer);

  describe('DELETE /account', () => {
    test('should return 204 status code', () => {
      return createAccountMock()
        .then((accountMock) => {
          return superagent.del(`${apiURL}/account`)
            .set('Authorization', `Bearer ${accountMock.token}`)
            .then((response) => {
              expect(response.status).toEqual(204);
            });
        });
    });
  });
});
