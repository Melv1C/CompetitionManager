export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 text-sm text-muted-foreground text-center">
        <p>© {currentYear} Competition Manager. All rights reserved.</p>
      </div>
    </footer>
  );
}
