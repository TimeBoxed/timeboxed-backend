'use strict';

import { startServer, stopServer } from '../lib/server';

describe('Google OAuth router', () => {
  beforeAll(startServer);
  afterAll(stopServer);
});
