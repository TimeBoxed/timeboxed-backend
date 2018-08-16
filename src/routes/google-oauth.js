import superagent from 'superagent';
import { Router } from 'express';
import Account from '../model/account';
import Profile from '../model/profile';
import logger from '../lib/logger';

require('dotenv').config();

const GOOGLE_OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token';
const GOOGLE_OPENID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
const GOOGLE_CALENDAR_URL = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';

const googleRouter = new Router();

const createProfile = (user) => {
  return new Profile({
    username: user.username,
    email: user.email,
    account: user.id,
    calendars: user.calendars,
  }).save();
};

const getCalendars = (user) => {
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

const accountFindOrCreate = (user, response) => {
  return Account.findOne({ email: user.email })
    .then((account) => {
      if (!account) {
        return Account.create(user.email, user.username, user.googleToken)
          .then((newAccount) => {
            user.id = newAccount._id;
            return newAccount.pCreateLoginToken();
          })
          .then((token) => {
            return createProfile(user)
              .then(() => {
                return token;
              })
              .then(() => {
                return response
                  .cookie('GT1234567890', token, { maxAge: 900000 })
                  .redirect(`${process.env.CLIENT_URL}/privacy`);
              });
          });
      }
      return account.pCreateLoginToken()
        .then((token) => {
          return token;
        })
        .then((token) => {
          return response
            .cookie('GT1234567890', token, { maxAge: 900000 })
            .redirect(`${process.env.CLIENT_URL}/dashboard`);
        });
    });
};

googleRouter.get('/welcome', (request, response) => {
  const user = {};
  if (!request.query.code) {
    response.redirect(process.env.CLIENT_URL);
  } else {
    return superagent.post(GOOGLE_OAUTH_URL)
      .type('form')
      .send({
        code: request.query.code,
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_SECRET,
        redirect_uri: `${process.env.API_URL}/welcome`,
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
        return getCalendars(user);
      })
      .then((calendars) => {
        user.calendars = calendars;
        return accountFindOrCreate(user, response);
      })
      .then((token) => {
        return response
          .cookie('GT1234567890', token, { maxAge: 900000 })
          .redirect(`${process.env.CLIENT_URL}/dashboard`);
      })
      .catch(err => console.log(err.message));
  }
  return response.redirect(process.env.CLIENT_URL);
});

// googleRouter.get('/calendars', (request, response) => {
//   return response.send(calendars);
// });

export default googleRouter;
