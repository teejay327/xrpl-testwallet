import Layout from "./components/Layout.jsx";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Footer from "./components/Footer.jsx";

const App = () => {

  return (
    <Layout>
      <Header />
      <Home />
      <Footer />
    </Layout>
  )
}

export default App;