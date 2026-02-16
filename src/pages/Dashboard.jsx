import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card.jsx";

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
      </Card>
    </div>
  )
};

export default Dashboard;