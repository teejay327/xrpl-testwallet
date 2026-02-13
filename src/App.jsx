import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Footer from "./components/Footer.jsx";

const App = () => {

  return (
    <div className="min-h-screen flex flex-col">
    <Header />
      <h1>Xrpl Wallet v1.0</h1>
      <Home />
      <Footer />
    </div>
  )
}

export default App;