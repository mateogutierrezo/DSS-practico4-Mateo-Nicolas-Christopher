import knexConfig from './knexfile';
import knex from 'knex';

const db = knex(knexConfig.development);

export default db;
