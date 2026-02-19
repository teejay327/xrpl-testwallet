import { Outlet } from "react-router-dom";
import Layout from "./Layout.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

const AppShell = () => {

  return (
    <Layout>
      <Header />
      <Outlet />
      <Footer />
    </Layout>
  )
}