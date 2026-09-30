import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { db } from '@ajaia/db';
import { SEED_USERS } from '@ajaia/schema';
import { createApp } from '../app';

interface ApiErrorBody {
  error: { code: string; message: string };
}

interface UserDto {
  id: string;
  email: string;
  name: string;
}

interface DocDto {
  id: string;
  ownerId: string;
  title: string;
  content: unknown;
}

interface SharePerson {
  id: string;
  email: string;
  name: string;
  role: string;
}

function asData<T>(body: unknown): T {
  return (body as { data: T }).data;
}

function asError(body: unknown): ApiErrorBody {
  return body as ApiErrorBody;
}

const ALICE = SEED_USERS[0];
const BOB = SEED_USERS[1];
const TEST_TITLE = 'Sharing Auth Test Doc';

describe('sharing authorization', () => {
  let app: Application;
  let alice: ReturnType<typeof request.agent>;
  let bob: ReturnType<typeof request.agent>;
  let docId = '';

  beforeAll(async () => {
    app = createApp();
    alice = request.agent(app);
    bob = request.agent(app);
    for (const u of SEED_USERS) {
      await db('users')
        .insert({ id: u.id, email: u.email, name: u.name })
        .onConflict('id')
        .merge();
    }
    await db('documents').where('title', 'like', TEST_TITLE + '%').del();
  });

  afterAll(async () => {
    if (docId.length > 0) {
      await db('documents').where({ id: docId }).del();
    }
    await db('documents').where('title', 'like', TEST_TITLE + '%').del();
    await db.destroy();
  });

  it('rejects unauthenticated document access with the spec error shape', async () => {
    const res = await request(app).get('/api/v1/documents/some-id');
    expect(res.status).toBe(401);
    expect(asError(res.body).error.code).toBe('UNAUTHORIZED');
  });

  it('Alice logs in and receives her user', async () => {
    const res = await alice.post('/api/v1/auth/login').send({ email: ALICE.email });
    expect(res.status).toBe(200);
    expect(asData<UserDto>(res.body).email).toBe(ALICE.email);
  });

  it('Bob logs in and receives his user', async () => {
    const res = await bob.post('/api/v1/auth/login').send({ email: BOB.email });
    expect(res.status).toBe(200);
    expect(asData<UserDto>(res.body).email).toBe(BOB.email);
  });

  it('Alice creates a document', async () => {
    const res = await alice.post('/api/v1/documents').send({ title: TEST_TITLE });
    expect(res.status).toBe(201);
    const doc = asData<DocDto>(res.body);
    expect(doc.title).toBe(TEST_TITLE);
    docId = doc.id;
    expect(docId.length).toBeGreaterThan(0);
  });

  it('Bob cannot read the unshared document', async () => {
    const res = await bob.get('/api/v1/documents/' + docId);
    expect(res.status).toBe(403);
    expect(asError(res.body).error.code).toBe('FORBIDDEN');
  });

  it('Bob cannot edit the unshared document', async () => {
    const res = await bob.patch('/api/v1/documents/' + docId).send({ title: 'Hacked' });
    expect(res.status).toBe(403);
    expect(asError(res.body).error.code).toBe('FORBIDDEN');
  });

  it('non-owner cannot share the document', async () => {
    const res = await bob.post('/api/v1/documents/' + docId + '/shares').send({ userId: BOB.id });
    expect(res.status).toBe(403);
    expect(asError(res.body).error.code).toBe('FORBIDDEN');
  });

  it('Alice shares the document with Bob', async () => {
    const res = await alice
      .post('/api/v1/documents/' + docId + '/shares')
      .send({ userId: BOB.id });
    expect(res.status).toBe(201);
    expect(asData<SharePerson>(res.body).id).toBe(BOB.id);
  });

  it('Bob reads the shared document', async () => {
    const res = await bob.get('/api/v1/documents/' + docId);
    expect(res.status).toBe(200);
    expect(asData<DocDto>(res.body).id).toBe(docId);
  });

  it('Bob edits the shared document and Alice sees the change', async () => {
    const updated = await bob
      .patch('/api/v1/documents/' + docId)
      .send({ title: TEST_TITLE + ' edited by Bob' });
    expect(updated.status).toBe(200);
    expect(asData<DocDto>(updated.body).title).toBe(TEST_TITLE + ' edited by Bob');
    const reopened = await alice.get('/api/v1/documents/' + docId);
    expect(reopened.status).toBe(200);
    expect(asData<DocDto>(reopened.body).title).toBe(TEST_TITLE + ' edited by Bob');
  });

  it('self-share is rejected', async () => {
    const res = await alice
      .post('/api/v1/documents/' + docId + '/shares')
      .send({ userId: ALICE.id });
    expect(res.status).toBe(400);
    expect(asError(res.body).error).toBeDefined();
  });

  it('duplicate share is rejected', async () => {
    const res = await alice
      .post('/api/v1/documents/' + docId + '/shares')
      .send({ userId: BOB.id });
    expect([400, 409]).toContain(res.status);
    expect(asError(res.body).error).toBeDefined();
  });

  it('share with an unknown user returns 404 with the spec shape', async () => {
    const res = await alice
      .post('/api/v1/documents/' + docId + '/shares')
      .send({ userId: '00000000-0000-4000-8000-000000000000' });
    expect(res.status).toBe(404);
    expect(asError(res.body).error.code).toBe('USER_NOT_FOUND');
  });

  it('Alice unshares Bob and Bob is locked out again', async () => {
    const del = await alice.delete('/api/v1/documents/' + docId + '/shares/' + BOB.id);
    expect(del.status).toBe(200);
    const locked = await bob.get('/api/v1/documents/' + docId);
    expect(locked.status).toBe(403);
    expect(asError(locked.body).error.code).toBe('FORBIDDEN');
  });

  it('unknown document returns 404 with the spec shape', async () => {
    const res = await alice.get('/api/v1/documents/00000000-0000-4000-8000-000000000000');
    expect(res.status).toBe(404);
    expect(asError(res.body).error.code).toBe('DOCUMENT_NOT_FOUND');
  });
});