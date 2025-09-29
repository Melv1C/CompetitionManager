import { Competition } from '@repo/core/schemas';
import { dbLocal } from '../connect-am.js';

export const getResults = async () => {
  try {
    const result = await dbLocal.query('SELECT * FROM results');
    return result.rows as string[];
  } catch (err: any) {
    console.error(err);
    return [];
  }
};

export const importCompetition = (competition: Competition) => {
  console.log('Importing competition:', competition);
};

export const exportCompetition = async () => {
  return {name: "Test"} as Competition;
}
