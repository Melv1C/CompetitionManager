import { MainLayout } from './components/layout';
import { ThemeProvider } from './components/theme/theme-provider';

function App() {
  return (
    <ThemeProvider>
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Competition Manager
          </h1>
          <p className="text-lg text-muted-foreground mb-8 text-center max-w-2xl">
            Manage your competitions efficiently with our comprehensive
            platform.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">
                Create Competitions
              </h3>
              <p className="text-muted-foreground">
                Set up and configure new competitions with ease.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">
                Manage Participants
              </h3>
              <p className="text-muted-foreground">
                Register and track participants across events.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Track Results</h3>
              <p className="text-muted-foreground">
                Monitor progress and display real-time results.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
