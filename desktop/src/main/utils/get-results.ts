import { dbLocal } from '../connect-am'

export const getResults = async () => {
  try {
    const result = await dbLocal.query('SELECT * FROM results')
    return result.rows
  } catch (err: any) {
    console.error(err)
    return { error: err.message }
  }
}
