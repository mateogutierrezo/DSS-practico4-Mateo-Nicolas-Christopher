import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('username').notNullable().unique();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.boolean('activated').notNullable();
    table.string('reset_password_token');
    table.timestamp('reset_password_expires');
    table.string('invite_token');
    table.timestamp('invite_token_expires');
    table.string('picture_path');
  });
}
  
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
