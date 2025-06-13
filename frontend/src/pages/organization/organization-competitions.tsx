export function OrganizationCompetitions() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
          <p className="text-muted-foreground">
            Manage your organization's competitions and events.
          </p>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          Create Competition
        </button>
      </div>

      <div className="rounded-lg border">
        <div className="p-4">
          <h3 className="font-semibold">Competition List</h3>
          <p className="text-sm text-muted-foreground">
            Manage competitions with their inscriptions, confirmations, results,
            and analytics.
          </p>
        </div>
        <div className="border-t p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <h4 className="font-medium">Spring Championship 2025</h4>
                <p className="text-sm text-muted-foreground">
                  March 15-20, 2025 • 45 participants
                </p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md border px-3 py-1 text-sm">
                  View
                </button>
                <button className="rounded-md border px-3 py-1 text-sm">
                  Edit
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <h4 className="font-medium">Youth Tournament</h4>
                <p className="text-sm text-muted-foreground">
                  Planning • Expected 30 participants
                </p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md border px-3 py-1 text-sm">
                  View
                </button>
                <button className="rounded-md border px-3 py-1 text-sm">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
