import superagent from 'superagent';
import { Router } from 'express';
import HttpError from 'http-errors';
import Account from '../model/account';
import Profile from '../model/profile';
import Preferences from '../model/preferences';
import logger from '../lib/logger';

require('dotenv').config();

const GOOGLE_OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token';
const GOOGLE_OPENID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
const GOOGLE_CALENDAR_URL = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';
const TOKEN_EXPIRATION_TIME = 18000000;

const googleRouter = new Router();

const createPreferences = (profile) => {
  const selectedCalendar = profile.calendars.filter(item => item.name === profile.email);
  return new Preferences({
    email: profile.email,
    selectedCalendar: selectedCalendar[0],
    profile: profile._id,
  }).save()
    .then((preferences) => {
      const options = { runValidators: true, new: true };
      return Profile.findByIdAndUpdate(profile._id, { preferences: preferences._id }, options);
    });
};

const createProfile = (user) => {
  return new Profile({
    username: user.username,
    email: user.email,
    account: user.id,
    calendars: user.calendars,
  }).save()
    .then((profile) => {
      return createPreferences(profile);
    });
};

const getCalendarsInitial = (user) => {
  const calendars = [];
  return superagent.get(GOOGLE_CALENDAR_URL)
    .set('Authorization', `Bearer ${user.googleToken}`)
    .then((calendarResponse) => {
      user.nextSyncToken = calendarResponse.body.nextSyncToken;
      calendarResponse.body.items.forEach((item) => {
        const calendar = {
          name: item.summary,
          id: item.id,
          reminders: item.defaultReminders,
          conferenceProperties: item.conferenceProperties,
        };
        calendars.push(calendar);
      });
      return calendars;
    })
    .catch((err) => {
      logger.log(logger.ERROR, 'GOOGLE ROUTER - CANNOT GET CALENDARS');
      logger.log(logger.ERROR, err);
    });
};

const getCalendars = (user) => {
  const calendars = [];
  return superagent.post(GOOGLE_OAUTH_URL)
    .type('form')
    .send({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_SECRET,
      refresh_token: user.refreshToken,
      grant_type: 'refresh_token',
    })
    .then((refreshResponse) => {
      user.googleToken = refreshResponse.body.access_token;
      return user;
    })
    .then(() => {
      return superagent.get(GOOGLE_CALENDAR_URL)
        .set('Authorization', `Bearer ${user.googleToken}`)
        .then((calendarResponse) => {
          user.nextSyncToken = calendarResponse.body.nextSyncToken;
          calendarResponse.body.items.forEach((item) => {
            const calendar = {
              name: item.summary,
              id: item.id,
              reminders: item.defaultReminders,
              conferenceProperties: item.conferenceProperties,
            };
            calendars.push(calendar);
          });
          return calendars;
        });
    })
    .catch((err) => {
      logger.log(logger.ERROR, 'GOOGLE ROUTER - CANNOT GET CALENDARS');
      logger.log(logger.ERROR, err);
    });
};

const accountFindOrCreate = (user) => {
  return Account.findOne({ email: user.email })
    .then((account) => {
      if (!account) {
        return Account.create(user.email, user.username, user.googleToken, user.refreshToken)
          .then((newAccount) => {
            user.id = newAccount._id;
            return newAccount.pCreateLoginToken();
          })
          .then((token) => {
            return createProfile(user)
              .then(() => {
                return token;
              });
          });
      }
      throw new HttpError(400, 'ACCOUNT FIND OR CREATE - Account already exists');
    });
};

// ------ New User ----------
googleRouter.get('/welcome', (request, response) => {
  const user = {};
  if (!request.query.code) {
    return response.redirect(process.env.CLIENT_URL);
  }
  return superagent.post(GOOGLE_OAUTH_URL)
    .type('form')
    .send({
      code: request.query.code,
      grant_type: 'authorization_code',
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_SECRET,
      redirect_uri: `${process.env.API_URL}/welcome`,
      access_type: 'offline',
    })
    .then((tokenResponse) => {
      if (!tokenResponse.body.access_token) {
        return response.redirect(process.env.CLIENT_URL);
      }
      user.googleToken = tokenResponse.body.access_token;
      if (tokenResponse.body.refresh_token) user.refreshToken = tokenResponse.body.refresh_token;
      return superagent.get(GOOGLE_OPENID_URL)
        .set('Authorization', `Bearer ${user.googleToken}`);
    })
    .then((openIdResponse) => {
      user.username = openIdResponse.body.name;
      user.email = openIdResponse.body.email;
      return getCalendarsInitial(user);
    })
    .then((calendars) => {
      user.calendars = calendars;
      return accountFindOrCreate(user);
    })
    .then((token) => {
      return response
        .cookie('GT1234567890', token, {
          secure: false,
          maxAge: TOKEN_EXPIRATION_TIME,
          domain: process.env.DOMAIN,
          path: '/',
          signed: false,
          httpOnly: false,
        })
        .redirect(`${process.env.CLIENT_URL}/privacy`);
    })
    .catch((err) => {
      logger.log(logger.ERROR, err.message);
      return response.redirect(process.env.CLIENT_URL);
    });
});

// ------ Returning User ----------
googleRouter.get('/oauth/signin', (request, response) => {
  const user = {};
  if (!request.query.code) {
    return response.redirect(process.env.CLIENT_URL);
  }
  return superagent.post(GOOGLE_OAUTH_URL)
    .type('form')
    .send({
      code: request.query.code,
      grant_type: 'authorization_code',
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_SECRET,
      redirect_uri: `${process.env.API_URL}/oauth/signin`,
    })
    .then((tokenResponse) => {
      if (!tokenResponse.body.access_token) {
        return response.redirect(process.env.CLIENT_URL);
      }
      user.googleToken = tokenResponse.body.access_token;
      return superagent.get(GOOGLE_OPENID_URL)
        .set('Authorization', `Bearer ${user.googleToken}`);
    })
    .then((openIdResponse) => {
      user.username = openIdResponse.body.name;
      user.email = openIdResponse.body.email;
      return Account.findOne({ email: user.email });
    })
    .then((userAccount) => {
      return getCalendars(userAccount);
    })
    .then((calendars) => {
      user.calendars = calendars;
      return Account.findOne({ email: user.email });
    })
    .then((account) => {
      if (!account) {
        return response.redirect(`${process.env.CLIENT_URL}/signup`);
      }
      const options = { runValidators: true, new: true };
      return Profile.findByIdAndUpdate(account.profile, { calendars: user.calendars }, options)
        .then(() => {
          return account.pCreateLoginToken()
            .then((token) => {
              return response
                .cookie('GT1234567890', token, {
                  secure: false,
                  maxAge: TOKEN_EXPIRATION_TIME,
                  domain: process.env.DOMAIN,
                  path: '/',
                  signed: false,
                  httpOnly: false,
                })
                .redirect(`${process.env.CLIENT_URL}/dashboard`);
            });
        });
    })
    .catch((err) => {
      logger.log(logger.ERROR, err.message);
      return response.redirect(process.env.CLIENT_URL);
    });
});

export default googleRouter;
