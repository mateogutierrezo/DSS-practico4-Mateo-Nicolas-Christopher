// migrations/20250713050000_create_invoices_table.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('invoices', table => {
    table.increments('id').primary();
    table.integer('userId')
         .notNullable()
         .references('id')
         .inTable('users')
         .onDelete('CASCADE');
    table.decimal('amount', 10, 2).notNullable();
    table.date('dueDate').notNullable();
    table.string('status').notNullable().defaultTo('unpaid');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('invoices');
}
