'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { createPreferencesMock } from './lib/preference-mock';
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

  describe('GET /profiles/calendars/:id', () => {
    test('should return 200 status code and profiles calendars', () => {
      let profileToCompare = null;
      return createProfileMock()
        .then((profileMock) => {
          profileToCompare = profileMock.profile;
          return superagent.get(`${apiURL}/profile/calendars/${profileMock.profile._id}`)
            .set('Authorization', `Bearer ${profileMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body).toHaveLength(3);
          expect(response.body[0]).toEqual(profileToCompare.calendars[0]);
        });
    });
  });

  describe('PUT /profile', () => {
    test('should return 200 status code and updated profile', () => {
      let profileToUpdate = null;
      return createProfileMock()
        .then((profileMock) => {
          profileToUpdate = profileMock.profile;
          return superagent.put(`${apiURL}/profile`)
            .set('Authorization', `Bearer ${profileMock.token}`)
            .send({ privacySigned: true });
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.privacySigned).toEqual(true);
          expect(response.body._id.toString()).toEqual(profileToUpdate._id.toString());
        });
    });
  });

  describe('PUT /profile/reset', () => {
    test('should return 200 status code and reset preferences', () => {
      let preferencesToCompare = null;
      return createPreferencesMock(true)
        .then((resultMock) => {
          preferencesToCompare = resultMock.preferences;
          expect(resultMock.preferences.breatherTime).toEqual(30);
          return superagent.put(`${apiURL}/profile/reset`)
            .set('Authorization', `Bearer ${resultMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body._id.toString()).toEqual(preferencesToCompare._id.toString());
          expect(response.body.selectedCalendar.name).toEqual(preferencesToCompare.email);
          expect(response.body.breatherTime).toEqual(15);
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
