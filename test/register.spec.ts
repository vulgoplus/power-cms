import { ServiceBroker } from 'moleculer';
import * as request from 'supertest';
import { app, createServiceBroker } from './environment/service-broker';

describe('Registration flow', () => {
  let broker: ServiceBroker;

  beforeAll(async () => {
    broker = await createServiceBroker();
  });

  afterAll(async () => {
    await broker.stop();
  });

  it('Signs up successfully', async () => {
    const { body, status } = await request(app)
      .post('/api/auth/register')
      .send({ username: 'JohnDoe', email: 'john@doe.com', password: 'P@$$word' });

    expect(status).toBe(200);
    expect(body.id).toBeDefined();
    expect(body.username).toBe('JohnDoe');
    expect(body.email).toBe('john@doe.com');
    expect(body.password).not.toBeDefined();
    expect(Array.isArray(body.roles)).toBeTruthy();
    expect(body.avatar).toBeDefined();
  });

  it('Validates password in auth service', async () => {
    const { body, status } = await request(app)
      .post('/api/auth/register')
      .send({});

    expect(status).toBe(422);
    expect(body.data.length).toBe(1);
    expect(body.data[0].type).toBe('any.required');
  });

  it('Validates the rest in user service', async () => {
    const { body, status } = await request(app)
      .post('/api/auth/register')
      .send({ password: 'P@$$word' });

    expect(status).toBe(422);
    expect(body.data.map(({ path, type }: any) => ({ path: path.join('.'), type }))).toEqual([
      { path: 'username', type: 'any.required' },
      { path: 'email', type: 'any.required' },
    ]);
  });
});
