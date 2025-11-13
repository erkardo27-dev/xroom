export default function Footer() {
  return (
    <footer className="py-8 mt-12 px-4 md:px-8 border-t">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} XRoom Tonight. Бүх эрх хуулиар хамгаалагдсан.</p>
        <p className="mt-2">Сүүлчийн минутын шилдэг хямдралтай буудлын өрөөг ол. Маш хурдан, бүрэн нууцлалтай захиал.</p>
      </div>
    </footer>
  );
}
