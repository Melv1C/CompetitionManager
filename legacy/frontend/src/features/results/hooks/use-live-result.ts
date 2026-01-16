import { useSocket } from '@/features/socket';
import { ACTIVE_ORGANIZATION_QUERY_KEY, RESULTS_QUERY_KEY } from '@/lib/query-keys';
import type { Cuid, Result } from '@repo/core/schemas';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useLiveResult = (competitionEid: Cuid) => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Listen to socket events for real-time updates
  useEffect(() => {
    console.log('Setting up socket listeners for competitionEid:', competitionEid);
    socket.emit('joinCompetition', competitionEid);

    const handleResultUpsert = (data: Result) => {
      console.log('Received upsertResult event:', data);
      // Update the result in cache
      queryClient.setQueryData<Result[]>([RESULTS_QUERY_KEY, competitionEid], oldData => {
        if (!oldData) return;
        if (!oldData.find(r => r.id === data.id)) {
          return [...oldData, data];
        }
        return oldData.map(result => (result.id === data.id ? data : result));
      });
      queryClient.setQueryData<Result[]>(
        [RESULTS_QUERY_KEY, ACTIVE_ORGANIZATION_QUERY_KEY, competitionEid],
        oldData => {
          if (!oldData) return;
          if (!oldData.find(r => r.id === data.id)) {
            return [...oldData, data];
          }
          return oldData.map(result => (result.id === data.id ? data : result));
        },
      );
    };

    const handleResultDeleted = (id: Result['id']) => {
      console.log('Received resultDeleted event:', id);
      // Remove the result from cache
      queryClient.setQueryData<Result[]>([RESULTS_QUERY_KEY, competitionEid], oldData => {
        if (!oldData) return;
        return oldData.filter(result => result.id !== id);
      });
      queryClient.setQueryData<Result[]>(
        [RESULTS_QUERY_KEY, ACTIVE_ORGANIZATION_QUERY_KEY, competitionEid],
        oldData => {
          if (!oldData) return;
          return oldData.filter(result => result.id !== id);
        },
      );
    };

    socket.on('upsertResult', handleResultUpsert);
    socket.on('resultDeleted', handleResultDeleted);

    return () => {
      socket.emit('leaveCompetition', competitionEid);
      socket.off('upsertResult', handleResultUpsert);
      socket.off('resultDeleted', handleResultDeleted);
    };
  }, [competitionEid, queryClient, socket]);
};
