import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { useWallet } from "../context/WalletContext";
import { useLock } from "../context/LockContext";
import Button from "../components/ui/Button.jsx";

const linkBase = "text-sm font-semibold text-slate-300 transition";
const linkActive = "text-emerald-400";

const short = (s) => (s ? `${s.slice(0,6)}...${s.slice(-6)}` : "");

const Header = () => {
  const { activeAccount } = useWallet();

  const { lockWallet } = useLock();

  return (
    <header className="mb-8 flex items-start justify-between">
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

      <div className="rounded-md border border-slate-800 bg-slate-900/50 ml-6 px-3 py-2 text-right">
        {!activeAccount ? (
          <>
            <div className="text-sm font-semibold text-slate-200">
              No account selected
            </div>
            <div className="text-xs text-slate-400">
              <NavLink
                to="/accounts"
                className="text-emerald-400 hover:text-emerald-200 hover:underline underline-offset-2"
              >
                Go to Accounts
              </NavLink>         
            </div>
          </>
        ) : (
          <>
            <div className="text-sm font-semibold text-slate-200">
              {activeAccount.label}
            </div>
            <div className="text-sm text-emerald-400">
              {short(activeAccount.address)}
            </div>
          </>
        )}
      </div>
     
      <div className="flex flex-col items-center gap-1">
        <Button 
          onClick={lockWallet}
          className="ml-2"
        >
          🔒 Lock Wallet
        </Button>
        <span className="hidden whitespace-nowrap text-xs text-slate-500 sm:inline ml-1">
          Auto locks after 5 min inactivity
        </span>
      </div>
    </header>
  );
}

export default Header;