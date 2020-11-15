const request = require('supertest');
const buildApp = require('../../app');
const UserRepo = require('../../repos/user-repo');
const Context = require('../context');

let context;
beforeAll(async () => {
  console.log('test:', process.env.DB_PORT);
  context = await Context.build();
});

it('create a user', async () => {
  const startingCount = await UserRepo.count();
  expect(startingCount).toEqual(0);

  await request(buildApp())
    .post('/users')
    .send({ username: 'testuser', bio: 'test bio' })
    .expect(200);

  const finishCount = await UserRepo.count();
  expect(finishCount).toEqual(1);
});

afterAll(() => {
  return context.close();
});
