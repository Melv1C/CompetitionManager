export const getNextSeqno = async <
  T extends { findMany: (args: any) => Promise<Array<{ seqno: number | null }>> },
>(
  modelDelegate: T,
  where: Record<string, unknown> = {},
): Promise<number> => {
  console.log('start get next seqno');
  const result = await modelDelegate.findMany({
    where,
    orderBy: {
      seqno: 'desc',
    },
    take: 1,
    select: {
      seqno: true,
    },
  });
  if (result.length === 0) {
    return 1;
  }
  return result[0].seqno ? result[0].seqno + 1 : 1;
};
