'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('SERVER', () => {
  beforeAll(startServer);
  afterAll(stopServer);

  test('should return 404 if route does not exist', () => {
    return superagent.get(`${apiURL}/fakeroute`)
      .then(Promise.reject)
      .catch((err) => {
        expect(err.status).toEqual(404);
      });
  });
});
