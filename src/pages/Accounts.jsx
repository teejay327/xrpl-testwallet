import Card, { CardHeader, CardTitle, CardContent } from "../components/ui/Card.jsx";

const Accounts = () => {

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300">
          Your XRPL accounts
        </CardContent>
        <CardFooter/>
      </Card>
    </div>
  )
}

export default Accounts;