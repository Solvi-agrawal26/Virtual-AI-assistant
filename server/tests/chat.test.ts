import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Chat & Ask API Tests', () => {
  const app = createApp();

  it('POST /api/ask should validate empty question', async () => {
    const res = await request(app)
      .post('/api/ask')
      .send({ question: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/ask should return answer and sources for valid question', async () => {
    const res = await request(app)
      .post('/api/ask')
      .send({ question: 'What is the capital of France?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.answer).toBe('string');
    expect(Array.isArray(res.body.sources)).toBe(true);
  }, 10000);

  it('404 for unknown endpoint should return structured json', async () => {
    const res = await request(app).get('/api/v1/unknown-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
