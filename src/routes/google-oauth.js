import superagent from 'superagent';
import { Router } from 'express';

require('dotenv').config();

const GOOGLE_OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token';
const GOOGLE_OPENID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
const GOOGLE_CALENDAR_URL = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';

const googleRouter = new Router();
const calendars = [];

// VANILLA LOGIN
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
        user.accessToken = tokenResponse.body.access_token;
        return superagent.get(GOOGLE_OPENID_URL)
          .set('Authorization', `Bearer ${user.accessToken}`);
      })
      .then((openIdResponse) => {
        user.username = openIdResponse.body.name;
        user.email = openIdResponse.body.email;
        return superagent.get(GOOGLE_CALENDAR_URL)
          .set('Authorization', `Bearer ${user.accessToken}`);
      })
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
        console.log('the user', user);
        return response
          .cookie('GT1234567890', user.accessToken, { maxAge: 900000 })
          .redirect(`${process.env.CLIENT_URL}/setup`);
      })
      .catch(err => console.log(err.message));
  }
  return response.redirect(process.env.CLIENT_URL);
});

googleRouter.get('/calendars', (request, response) => {
  return response.send(calendars);
});

export default googleRouter;
