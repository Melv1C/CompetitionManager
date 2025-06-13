export function CompetitionDetail() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Spring Championship 2025
          </h1>
          <p className="text-muted-foreground">
            March 15-20, 2025 • Competition Management
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border px-4 py-2 text-sm">
            Edit Competition
          </button>
          <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
            Publish Results
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Inscriptions</h3>
          <p className="text-2xl font-bold">45</p>
          <p className="text-xs text-muted-foreground">
            Registered participants
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Confirmations</h3>
          <p className="text-2xl font-bold">42</p>
          <p className="text-xs text-muted-foreground">Confirmed attendance</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Results</h3>
          <p className="text-2xl font-bold">38</p>
          <p className="text-xs text-muted-foreground">Results recorded</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Revenue</h3>
          <p className="text-2xl font-bold">€1,350</p>
          <p className="text-xs text-muted-foreground">Registration fees</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border">
          <div className="p-4">
            <h3 className="font-semibold">Competition Sections</h3>
          </div>
          <div className="border-t p-4 space-y-2">
            <button className="w-full rounded-md border p-3 text-left hover:bg-muted/50">
              <div className="font-medium">Information & Settings</div>
              <div className="text-sm text-muted-foreground">
                Basic competition details
              </div>
            </button>
            <button className="w-full rounded-md border p-3 text-left hover:bg-muted/50">
              <div className="font-medium">Inscriptions Management</div>
              <div className="text-sm text-muted-foreground">
                Handle participant registrations
              </div>
            </button>
            <button className="w-full rounded-md border p-3 text-left hover:bg-muted/50">
              <div className="font-medium">Confirmations</div>
              <div className="text-sm text-muted-foreground">
                Track attendance confirmations
              </div>
            </button>
            <button className="w-full rounded-md border p-3 text-left hover:bg-muted/50">
              <div className="font-medium">Results & Rankings</div>
              <div className="text-sm text-muted-foreground">
                Record and publish results
              </div>
            </button>
            <button className="w-full rounded-md border p-3 text-left hover:bg-muted/50">
              <div className="font-medium">Analytics</div>
              <div className="text-sm text-muted-foreground">
                Competition performance metrics
              </div>
            </button>
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="p-4">
            <h3 className="font-semibold">Recent Activity</h3>
          </div>
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">New registration</div>
                <div className="text-sm text-muted-foreground">
                  John Smith registered
                </div>
              </div>
              <div className="text-xs text-muted-foreground">2h ago</div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Payment received</div>
                <div className="text-sm text-muted-foreground">
                  €30 registration fee
                </div>
              </div>
              <div className="text-xs text-muted-foreground">4h ago</div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Result uploaded</div>
                <div className="text-sm text-muted-foreground">
                  Category A results
                </div>
              </div>
              <div className="text-xs text-muted-foreground">1d ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
