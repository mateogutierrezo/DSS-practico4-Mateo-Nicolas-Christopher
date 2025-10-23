// migrations/20250713040000_create_clinical_history_files_table.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  /*
  await knex.schema.createTable('clinical_history_files', table => {
    table.increments('id').primary();
    table.uuid('history_id')
         .notNullable()
         .references('id')
         .inTable('clinical_histories')
         .onDelete('CASCADE');
    table.string('filename').notNullable();
    table.string('path').notNullable();
    table.string('original_name').notNullable();
    table.string('mime_type').notNullable();
    table.integer('size').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });
    */
}

export async function down(knex: Knex): Promise<void> {
 // await knex.schema.dropTableIfExists('clinical_history_files');
}
