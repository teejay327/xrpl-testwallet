import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/Card.jsx";

const Dashboard = () => {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300">
          Wallet overview
        </CardContent>
        <CardFooter/>
      </Card>
    </div>
  )
};

export default Dashboard;