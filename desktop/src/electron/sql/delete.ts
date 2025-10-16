import { prisma } from '../lib/prisma.js';

export const deleteCompetition = async (competitionId: number) => {
    await prisma.competitions.delete({
        where: { id: competitionId },
    });
    console.log(`Deleted competition with ID ${competitionId}`);
}

export const deleteEvent = async (eventName: string, competitionId: number) => {
    const event = await prisma.events.findFirst({
        where: { name: eventName, competition: competitionId },
    });
    if (event) {
        await prisma.events.delete({
            where: { id: event.id },
        });
        console.log(`Deleted event with name ${eventName} from competition ID ${competitionId}`);
        return;
    }
    throw new Error(`Event with name ${eventName} not found in competition ID ${competitionId} when trying to delete.`);
}
