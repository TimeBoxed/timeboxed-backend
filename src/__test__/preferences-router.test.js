'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { createPreferencesMock, removePreferencesMock } from './lib/preference-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('PREFERENCE ROUTES', () => {
  beforeAll(startServer);
  afterEach(removePreferencesMock);
  afterAll(stopServer);

  describe('GET /preferences/:id', () => {
    test('should return 200 status code and preferences', () => {
      let preferencesToCompare = null;
      return createPreferencesMock()
        .then((preferencesMock) => {
          preferencesToCompare = preferencesMock.preferences;
          return superagent.get(`${apiURL}/preferences/${preferencesMock.preferences._id}`)
            .set('Authorization', `Bearer ${preferencesMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.taskLengthDefault).toEqual(30);
          expect(response.body.breatherTime).toEqual(15);
          expect(response.body.selectedCalendar).toEqual(preferencesToCompare.selectedCalendar);
          expect(response.body.profile.toString()).toEqual(preferencesToCompare.profile.toString());
        });
    });
  });

  describe('PUT /preferences/:id', () => {
    test('should return 200 status code and updated preferences', () => {
      let preferencesToUpdate = null;
      return createPreferencesMock()
        .then((preferencesMock) => {
          preferencesToUpdate = preferencesMock.preferences;
          return superagent.put(`${apiURL}/preferences/${preferencesMock.preferences._id}`)
            .set('Authorization', `Bearer ${preferencesMock.token}`)
            .send({ selectedCalendar: 'Personal' });
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.selectedCalendar).toEqual('Personal');
          expect(response.body._id.toString()).toEqual(preferencesToUpdate._id.toString());
          expect(response.body.taskLengthDefault).toEqual(preferencesToUpdate.taskLengthDefault);
        });
    });
  });
});
