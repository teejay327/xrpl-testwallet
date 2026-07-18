import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import AppShell from "./components/AppShell.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Accounts from "./pages/Accounts.jsx";
import WalletProvider from './context/WalletContext.jsx';
import { LockProvider } from './context/LockContext.jsx';
import LockGate from "./components/LockGate.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "accounts", element: <Accounts />}
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LockProvider>
      <WalletProvider>
        <LockGate>
          <RouterProvider router={router}/>
        </LockGate>      
      </WalletProvider>
    </LockProvider>
  </React.StrictMode>
)