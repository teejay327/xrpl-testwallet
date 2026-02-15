import Button from "./ui/Button.jsx";

const Header = () => {

  return (
    <header className="mb-8 flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight">
        XRPL Wallet <span className="text-emerald-400">Testnet</span>
      </h1>
      <Button variant="secondary" size="sm">
        Connect
      </Button>
    </header>
  );
}

export default Header;