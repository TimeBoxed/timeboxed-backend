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
    test('GET /profiles/me - should return a 200 status code and profile', () => {
      let profileMock = null;

      return createProfileMock()
        .then((profileSetMock) => {
          profileMock = profileSetMock;

          return superagent.get(`${apiURL}/profiles/me`)
            .set('Authorization', `Bearer ${profileMock.token}`)
            .then((response) => {
              expect(response.status).toEqual(200);
              expect(response.body.username).toEqual(profileMock.profile.username);
              expect(response.body.privacySigned).toEqual(false);
              expect(response.body.account).toEqual(profileMock.profile.account.toString());
            });
        });
    });
    test('GET /profiles/me - should return a 400 for no token being passed.', () => {
      return createProfileMock()
        .then(() => {
          return superagent.get(`${apiURL}/profiles/me`)
            .catch((error) => {
              expect(error.status).toEqual(400);
            });
        });
    });
  });

  describe('GET /profiles/:id', () => {
    test('GET /profiles/:id - should return a 200 status and profile', () => {
      let profileMock = null;

      return createProfileMock()
        .then((profileSetMock) => {
          profileMock = profileSetMock;
          return superagent.get(`${apiURL}/profiles/${profileMock.profile._id}`)
            .set('Authorization', `Bearer ${profileMock.token}`)
            .then((response) => {
              expect(response.status).toEqual(200);
            });
        });
    });
  });

  describe('DELETE - /profiles/:id', () => {
    test('DELETE - should return a 204 upon a successful Profile deletion.', () => {
      let deleteProfileMock = null;

      return createProfileMock()
        .then((profileToDelete) => {
          deleteProfileMock = profileToDelete;
          return superagent.delete(`${apiURL}/profile/${deleteProfileMock.profile._id}`)
            .set('Authorization', `Bearer ${deleteProfileMock.token}`)
            .then((response) => {
              expect(response.status).toEqual(204);
            });
        });
    });
    test('DELETE - should return a 400 if no profile exists', () => {
      return superagent.delete(`${apiURL}/profile/invalidID`)
        .then(Promise.reject)
        .catch((error) => {
          expect(error.status).toEqual(400);
        });
    });
  });
});
