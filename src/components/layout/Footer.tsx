export default function Footer() {
  return (
    <footer className="py-12 mt-12 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg">XRoom Tonight</h3>
            <p className="text-sm text-muted-foreground">
              Сүүлчийн минутын хамгийн шилдэг буудлын саналуудыг бид танд хүргэнэ.
            </p>
          </div>
          {/* Placeholders for columns if needed, or just keep minimal */}
        </div>
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} XRoom Tonight. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Нууцлалын бодлого</a>
            <a href="#" className="hover:text-primary transition-colors">Үйлчилгээний нөхцөл</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
