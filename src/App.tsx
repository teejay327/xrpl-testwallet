//import { useState } from 'react'
import Header from "./components/Header.jsx";
import Main from "./pages/Main.jsx";
import Footer from "./components/Footer.jsx";
import './App.css'

function App() {

  return (
    <>
    <Header />
      <h1>Xrpl Wallet v1.0</h1>
      <main>
        <Main />
      </main>
      <Footer />
    </>
  )
}

export default App
