const Koa = require('koa');
const agent = require('supertest-koa-agent');
const sslify = require('../index.js');
const enforce = sslify.default;

describe('Azure-style proxy SSL flag', () => {

  describe('flag is not set', () => {
    const app = new Koa();

    app.use(enforce());

    app.use((ctx) => {
      ctx.response.status = 200;
    });

    const subject = agent(app);

    it('should ignore x-arr-ssl if not activated', (done) => {
      subject
        .get('/ssl')
        .set('x-arr-ssl', 'https')
        .expect(301)
        .expect('location', new RegExp('^https://[\\S]*/ssl$'), done);
    });
  });

  describe('flag is set', () => {
    const app = new Koa();

    app.use(enforce({ resolver: sslify.azureResolver }));

    app.use((ctx) => {
      ctx.response.status = 200;
    });

    const subject = agent(app);

    it('should accept request if flag set and activated', (done) => {
      subject
        .get('/ssl')
        .set('x-arr-ssl', 'https')
        .expect(200, 'OK', done);
    });

    it('should redirect if activated but flag not set', (done) => {
      subject
        .get('/ssl')
        .expect(301)
        .expect('location', new RegExp('^https://[\\S]*/ssl$'), done);
    });

    it('should redirect if activated but wrong flag set', (done) => {
      subject
        .get('/ssl')
        .set('x-forwarded-proto', 'https')
        .expect(301)
        .expect('location', new RegExp('^https://[\\S]*/ssl$'), done);
    });
  });
});
