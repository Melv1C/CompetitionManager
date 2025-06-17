import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoriesManagement } from '@/features/categories/components/categories-management';
import { ClubsManagement } from '@/features/clubs/components/clubs-management';
import { EventsManagement } from '@/features/events/components/events-management';

export function AdminDatabase() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Database Management
        </h1>
        <p className="text-muted-foreground">
          Manage events, categories, and clubs for competitions
        </p>
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-fit grid-cols-3">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
        </TabsList>
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Events Management</CardTitle>
            </CardHeader>
            <CardContent>
              <EventsManagement />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categories Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoriesManagement />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="clubs">
          <Card>
            <CardHeader>
              <CardTitle>Clubs Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ClubsManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
