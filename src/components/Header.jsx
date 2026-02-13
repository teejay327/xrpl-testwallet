import Button from "./ui/Button.jsx";

const Header = () => {

  return (
    <header className="mb-8 flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight">
        <div className="p-6 bg-slate-900 text-emerald-400">Tailwind v4 working</div>
      </h1>
      <Button variant="secondary" size="sm">
        Connect
      </Button>
    </header>
  );
}

export default Header;