import pg from 'pg';

const client = new pg.Client({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: '123456',
  database: 'original',
});

client.connect();

export async function query(query: string, params?: string[] | number[]) {
  const { rows } = await client.query(query, params);

  return rows;
}
