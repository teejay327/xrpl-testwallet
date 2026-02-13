import Container from "./ui/Container";

const Layout = ({ children }) => {

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Container >
        { children }
      </Container>
    </div>
  );
};

export default Layout;