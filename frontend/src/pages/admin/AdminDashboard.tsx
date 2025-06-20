import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart3, TrendingUp, Trophy, Users } from 'lucide-react';

export function AdminDashboard() {
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      description: 'System users',
      icon: Users,
      trend: '+89 this month',
    },
    {
      title: 'Organizations',
      value: '67',
      description: 'Active organizations',
      icon: Trophy,
      trend: '+5 this month',
    },
    {
      title: 'Pending Requests',
      value: '3',
      description: 'Organization approvals',
      icon: BarChart3,
      trend: 'Requires attention',
    },
    {
      title: 'System Health',
      value: 'Good',
      description: 'All services running',
      icon: TrendingUp,
      trend: 'Operational',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          System administration and platform management
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {stat.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your competitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    New participant registered
                  </p>
                  <p className="text-sm text-muted-foreground">
                    John Doe joined "Spring Championship 2025"
                  </p>
                </div>
                <div className="ml-auto font-medium">2m ago</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Competition results updated
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Results added for "Winter Cup Finals"
                  </p>
                </div>
                <div className="ml-auto font-medium">1h ago</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    New competition created
                  </p>
                  <p className="text-sm text-muted-foreground">
                    "Summer League 2025" is now accepting registrations
                  </p>
                </div>
                <div className="ml-auto font-medium">3h ago</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2">
              <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <span className="text-sm font-medium">
                  Create new competition
                </span>
                <Trophy className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <span className="text-sm font-medium">Add participant</span>
                <Users className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <span className="text-sm font-medium">Export results</span>
                <BarChart3 className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
