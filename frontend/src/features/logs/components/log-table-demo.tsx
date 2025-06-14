// Enhanced LogTable Demo - shows the new features

import type { Log } from '@competition-manager/core/schemas';
import { LogTable } from './log-table';

// Sample log data to demonstrate the enhanced features
const sampleLogs: Log[] = [
  {
    id: '1',
    level: 'http',
    message: 'Request completed',
    meta: JSON.stringify({
      method: 'GET',
      path: '/api/users',
      status: 200,
      duration: 45,
      userId: 'user_123abc',
    }),
    timestamp: new Date('2025-06-14T10:30:00Z'),
  },
  {
    id: '2',
    level: 'http',
    message: 'Request completed',
    meta: JSON.stringify({
      method: 'POST',
      path: '/api/auth/login',
      status: 401,
      duration: 120,
    }),
    timestamp: new Date('2025-06-14T10:29:45Z'),
  },
  {
    id: '3',
    level: 'error',
    message: 'Database connection failed',
    meta: JSON.stringify({
      userId: 'user_456def',
      error: 'Connection timeout',
      retries: 3,
    }),
    timestamp: new Date('2025-06-14T10:29:30Z'),
  },
  {
    id: '4',
    level: 'info',
    message: 'User logged in successfully',
    meta: JSON.stringify({
      userId: 'user_789ghi',
      sessionId: 'session_abc123',
    }),
    timestamp: new Date('2025-06-14T10:29:15Z'),
  },
  {
    id: '5',
    level: 'http',
    message: 'Request completed',
    meta: JSON.stringify({
      method: 'DELETE',
      path: '/api/competitions/123',
      status: 500,
      duration: 2350,
      userId: 'admin_001',
    }),
    timestamp: new Date('2025-06-14T10:29:00Z'),
  },
];

export function LogTableDemo() {
  return (
    <div className="p-4">
      <LogTable
        logs={sampleLogs}
        isLoading={false}
        error={null}
        onRefresh={() => console.log('Refresh logs')}
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
        pageSize={20}
        totalCount={5}
      />
    </div>
  );
}
