export default function Footer() {
  return (
    <footer className="py-8 mt-12 px-4 md:px-8 border-t">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} XRoom Tonight. All rights reserved.</p>
        <p className="mt-2">Find the best last-minute hotel deals. Booked in a flash, with total privacy.</p>
      </div>
    </footer>
  );
}
