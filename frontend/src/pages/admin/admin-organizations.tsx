export function AdminOrganizations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Organization Management
          </h1>
          <p className="text-muted-foreground">
            Approve organization requests and manage existing organizations.
          </p>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          Create Organization
        </button>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border">
          <div className="p-4">
            <h3 className="font-semibold">Pending Requests</h3>
            <p className="text-sm text-muted-foreground">
              Review and approve organization creation requests.
            </p>
          </div>
          <div className="border-t p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3">
                <div>
                  <h4 className="font-medium">Sports Club Association</h4>
                  <p className="text-sm text-muted-foreground">
                    Requested by: John Doe (john@example.com)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted 2 days ago
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-md bg-green-600 px-3 py-1 text-sm text-white">
                    Approve
                  </button>
                  <button className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-600">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="p-4">
            <h3 className="font-semibold">Active Organizations</h3>
            <p className="text-sm text-muted-foreground">
              Manage existing organizations and their settings.
            </p>
          </div>
          <div className="border-t p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <h4 className="font-medium">Elite Athletics Club</h4>
                  <p className="text-sm text-muted-foreground">
                    Owner: Jane Smith • 45 members • 12 competitions
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-md border px-3 py-1 text-sm">
                    View
                  </button>
                  <button className="rounded-md border px-3 py-1 text-sm">
                    Edit
                  </button>
                  <button className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-600">
                    Suspend
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
