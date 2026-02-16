import Container from "./ui/Container.jsx";

const Layout = ({ children }) => {

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-slate-950 via-slate-900 bg-slate-950 text-slate-100">
      <Container className="flex flex-col flex-1 py-10">
        { children }
      </Container>
    </div>
  );
};

export default Layout;