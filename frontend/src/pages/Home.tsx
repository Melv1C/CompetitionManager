import { Button } from '@/components/ui/button';
import { ArrowRight, Award, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to Competition Manager
      </h1>
      <p className="text-lg text-muted-foreground mb-8 text-center max-w-2xl">
        Manage your competitions efficiently with our comprehensive platform.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">Create Competitions</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Set up and configure new competitions with ease.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/competitions">
              View Competitions
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">Manage Participants</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Register and track participants across events.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/participants">
              View Participants
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Award className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">Track Results</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Monitor progress and display real-time results.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/results">
              View Results
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
