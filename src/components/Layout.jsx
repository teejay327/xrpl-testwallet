import Container from "./ui/Container.jsx";

const Layout = ({ children }) => {

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Container className="py-10">
        { children }
      </Container>
    </div>
  );
};

export default Layout;