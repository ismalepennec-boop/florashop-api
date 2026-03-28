import { Separator } from '@/components/ui/separator';

export default function Footer() {
  return (
    <footer className="bg-muted/50 mt-auto">
      <Separator />
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          FloraShop &copy; {new Date().getFullYear()}
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Mentions légales
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
