'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';

import { createProfileMock, removeProfileMock } from './lib/profile-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('PROFILE ROUTES', () => {
  beforeAll(startServer);
  afterEach(removeProfileMock);
  afterAll(stopServer);

  describe('GET /profiles/me', () => { 
    test('GET - should return a 200 status code and profile', () => {
      let profileMock = null;

      return createProfileMock()
        .then((profileSetMock) => {
          profileMock = profileSetMock;

          return superagent.get(`${apiURL}/profiles/me`)
            .set('Authorization', `Bearer ${profileMock.googleToken}`)
            .then((response) => {
              expect(response.status).toEqual(200);
              expect(response.body.username).toEqual(profileMock.profile.username);
              expect(response.body.privacySigned).toEqual(false);
              expect(response.body.account).toEqual(profileMock.profile.account.toString());
            });
        });
    });
  });
});
