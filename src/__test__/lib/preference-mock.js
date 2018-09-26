'use strict';

import faker from 'faker';
import Preferences from '../../model/preferences';
import { createProfileMock, removeProfileMock } from './profile-mock';

const createPreferencesMock = (testReset) => {
  let resultMock = {};
  return createProfileMock()
    .then((profileSetMock) => {
      resultMock = profileSetMock;
      return new Preferences({
        email: profileSetMock.profile.email,
        selectedCalendar: faker.lorem.words(),
        profile: profileSetMock.profile._id,
        breatherTime: testReset ? 30 : 15,
      }).save();
    })
    .then((preferences) => {
      resultMock.preferences = preferences;
      return resultMock;
    });
};

const removePreferencesMock = () => {
  return Promise.all([
    Preferences.remove({}),
    removeProfileMock(),
  ]);
};

export { createPreferencesMock, removePreferencesMock };
