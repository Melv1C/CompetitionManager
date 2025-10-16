import { Competition } from "@repo/core/schemas";
import { competitionExists } from "../sql/exist";

export const getSatus = (competition: Competition) => {
  competitionExists(competition.id);

  //get all events already existing 
  //TODO continue

}