export function OrganizationMembers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">
            Manage volunteers, helpers, and organization members.
          </p>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          Invite Member
        </button>
      </div>

      <div className="rounded-lg border">
        <div className="p-4">
          <h3 className="font-semibold">Member Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage roles and permissions for your organization members.
          </p>
        </div>
        <div className="border-t p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">JD</span>
                </div>
                <div>
                  <h4 className="font-medium">John Doe</h4>
                  <p className="text-sm text-muted-foreground">Administrator</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md border px-3 py-1 text-sm">
                  Edit Role
                </button>
                <button className="rounded-md border px-3 py-1 text-sm">
                  Remove
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">JS</span>
                </div>
                <div>
                  <h4 className="font-medium">Jane Smith</h4>
                  <p className="text-sm text-muted-foreground">Volunteer</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md border px-3 py-1 text-sm">
                  Edit Role
                </button>
                <button className="rounded-md border px-3 py-1 text-sm">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
