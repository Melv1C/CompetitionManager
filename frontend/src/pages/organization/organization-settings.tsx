export function OrganizationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Organization Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your organization's settings and preferences.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 font-semibold">Organization Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Organization Name</label>
              <input
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
                defaultValue="My Sports Club"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
                rows={3}
                defaultValue="A competitive sports organization focused on excellence."
              />
            </div>
            <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
              Save Changes
            </button>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-4 font-semibold">Competition Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-approve registrations</p>
                <p className="text-sm text-muted-foreground">
                  Automatically approve participant registrations
                </p>
              </div>
              <button className="rounded-full bg-primary w-11 h-6 relative">
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email notifications</p>
                <p className="text-sm text-muted-foreground">
                  Send email updates to participants
                </p>
              </div>
              <button className="rounded-full bg-primary w-11 h-6 relative">
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
