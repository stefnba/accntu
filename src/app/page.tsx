import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-selector";
export default function Home() {
  return (
    <div className="">
      <ThemeToggle />
      <Button>Click me</Button>
    </div>
  );
}
