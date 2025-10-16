import { Pool } from 'pg';
import 'dotenv/config';


export const dbLocal = new Pool({
  host: process.env.DB_LOCAL_HOST,
  user: process.env.DB_LOCAL_USER,
  password: process.env.DB_LOCAL_PASSWORD,
  database: process.env.DB_LOCAL_NAME,
  port: parseInt(process.env.DB_LOCAL_PORT || '5432')
})

export const connectAmDb = async () => {
  try {
    await dbLocal.connect()
    console.log('Connected to local database')
    return { success: true }
  } catch (err: any) {
    console.error(err)
    return { success: false, error: err.message }
  }
}