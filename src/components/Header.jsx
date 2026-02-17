import { NavLink } from "react-router-dom";
import Button from "./ui/Button.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet } from "@fortawesome/free-solid-svg-icons";

const linkBase = "text-sm font-semibold text-slate-300 transition";
const linkAcrtive = "text-emerald-400";


const Header = () => {

  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight">
          <FontAwesomeIcon
            icon={ faWallet }
            className="text-emerald-400 text-xl drop-shadow-md"
          />
          <span>
            XRPL Wallet <span className="text-emerald-400">Testnet</span>
          </span>
        </h1>

        <nav className="flex items-center gap-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) => isActive ? `${linkBase} ${linkActive}` : linkBase }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/accounts"
            className={({ isActive }) => isActive ? `${linkBase} ${linkActive}` : linkBase
            }
          >
            Accounts
          </NavLink>
        </nav>
      </div>

      <Button variant="secondary" size="sm">
        Connect
      </Button>
    </header>
  );
}

export default Header;