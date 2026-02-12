//import { useState } from 'react'
import Header from "./components/Header.jsx";
import Main from "./pages/Main.jsx";
import Footer from "./components/Footer.jsx";
// import './App.css'

const App = () => {

  return (
    <div className="min-h-screen flex flex-col">
    <Header />
      <h1>Xrpl Wallet v1.0</h1>
      <Main />
      <Footer />
    </div>
  )
}

export default App

