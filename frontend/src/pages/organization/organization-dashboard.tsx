export function OrganizationDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Organization Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your organization, competitions, and members.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Total Competitions</h3>
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs text-muted-foreground">+2 from last month</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Active Members</h3>
          <p className="text-2xl font-bold">45</p>
          <p className="text-xs text-muted-foreground">+5 from last month</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Total Participants</h3>
          <p className="text-2xl font-bold">328</p>
          <p className="text-xs text-muted-foreground">+23 from last month</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Revenue</h3>
          <p className="text-2xl font-bold">€2,450</p>
          <p className="text-xs text-muted-foreground">+12% from last month</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 font-semibold">Recent Competitions</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Spring Championship</span>
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <div className="flex justify-between">
              <span>Winter Cup</span>
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <div className="flex justify-between">
              <span>Youth Tournament</span>
              <span className="text-sm text-muted-foreground">Planning</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 font-semibold">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">
              Create New Competition
            </button>
            <button className="w-full rounded-md border px-3 py-2 text-sm">
              Invite Members
            </button>
            <button className="w-full rounded-md border px-3 py-2 text-sm">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
