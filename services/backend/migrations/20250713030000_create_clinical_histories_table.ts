// migrations/20250713030000_create_clinical_histories_table.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  /*
  await knex.schema.createTable('clinical_histories', table => {
    table.increments('id').primary();
    table.uuid('user_id')
         .notNullable()
         .references('id')
         .inTable('users')
         .onDelete('CASCADE');
    table.string('doctor_name').notNullable();
    table.text('diagnose').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
  */
}

export async function down(knex: Knex): Promise<void> {
  // await knex.schema.dropTableIfExists('clinical_histories');
}
