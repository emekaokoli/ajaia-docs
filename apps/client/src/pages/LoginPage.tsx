import { useState } from 'react'
import { FileText, Loader2, LogIn } from 'lucide-react'
import { useLogin } from '../api/queries'
import { ApiError } from '../api/client'
import { cn } from '../lib/utils'

const USERS = [
  { email: 'alice@ajaia.test', name: 'Alice' },
  { email: 'bob@ajaia.test', name: 'Bob' },
] as const

export default function LoginPage() {
  const [email, setEmail] = useState<string>(USERS[0].email)
  const login = useLogin()

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-base p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-accent" aria-hidden="true" />
          <h1 className="text-xl font-bold">Ajaia Docs</h1>
        </div>
        <p className="mt-1 text-sm text-muted">Pick a seeded user to sign in.</p>
        <div className="mt-6 grid gap-2">
          {USERS.map((u) => (
            <button
              key={u.email}
              type="button"
              onClick={() => setEmail(u.email)}
              className={cn(
                'rounded-lg border px-4 py-3 text-left transition-colors',
                email === u.email
                  ? 'border-accent bg-accent/5 font-medium'
                  : 'border-line hover:border-muted',
              )}
            >
              {u.name}
              <span className="block text-xs text-muted">{u.email}</span>
            </button>
          ))}
        </div>
        {login.error ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {login.error instanceof ApiError ? login.error.message : 'Sign in failed'}
          </p>
        ) : null}
        <button
          type="button"
          disabled={login.isPending}
          onClick={() => login.mutate({ email })}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
        >
          {login.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogIn className="h-4 w-4" aria-hidden="true" />
          )}
          Sign in
        </button>
      </div>
    </div>
  )
}