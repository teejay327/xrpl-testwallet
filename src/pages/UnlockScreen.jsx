const UnlockScreen = () => {

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-bold text-slate-100">
          Wallet locked
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Enter the password to unlock your wallet
        </p>
      </div>
    </div>
  )
}

export default UnlockScreen;