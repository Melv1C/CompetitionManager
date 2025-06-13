import { ThemeProvider } from './components/theme/theme-provider';
import { ThemeToggle } from './components/theme/theme-toggle';

function App() {
  return (
    <ThemeProvider>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Welcome to Vite UI</h1>
        <p className="mt-2 text-gray-600">
          Click the button below to toggle themes.
        </p>
        <ThemeToggle />
      </div>
    </ThemeProvider>
  );
}

export default App;
