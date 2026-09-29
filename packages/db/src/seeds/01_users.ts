import { SEED_USERS } from '@ajaia/schema';
import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  for (const user of SEED_USERS) {
    await knex('users')
      .insert({ id: user.id, email: user.email, name: user.name })
      .onConflict('id')
      .merge();
  }
}