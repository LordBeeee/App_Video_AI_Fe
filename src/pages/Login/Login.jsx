import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loginApi } from '../../services/auth.service'
import { useAuthStore } from '../../store/auth.store'

export default function LoginCard() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)

  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginApi({ email, password })

      // Cookie được BE set tự động, FE chỉ lưu user info
      setSession({ user: data.user || null })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-primary-container blur-3xl" />
      <main className="w-full max-w-[480px] z-10">
        <div className="glass-panel flex flex-col items-center gap-8 rounded-2xl p-8 sm:p-10">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="material-symbols-outlined text-4xl text-primary">
                auto_awesome
              </span>

              <span className="text-xl font-black tracking-tighter text-on-surface font-h2">
                {/* CineAI */}
              </span>
            </div>

            <h1 className="font-h2 text-3xl font-bold text-on-surface">Welcome Back</h1>

            <p className="font-body-sm text-outline-variant uppercase tracking-widest text-[10px]">
              {/* Access your professional engine */}
            </p>
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-6">
            <div className="space-y-2">
              <label className="font-label-caps text-on-surface-variant block">
                Email Address
              </label>

              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  mail
                </span>

                <input
                  className="w-full rounded-xl border border-outline-variant bg-white py-4 pl-12 pr-4 text-on-surface outline-none transition-all font-mono-ui focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="abc123@gmail.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label-caps text-on-surface-variant block">
                Password
              </label>

              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  lock
                </span>

                <input
                  className="w-full rounded-xl border border-outline-variant bg-white py-4 pl-12 pr-12 text-on-surface outline-none transition-all font-mono-ui focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center font-medium">
                {error}
              </p>
            )}

            <button
              className="w-full rounded-xl bg-primary py-4 text-sm font-bold tracking-[0.16em] text-on-primary shadow-[0_10px_24px_rgba(243,136,32,0.25)] transition-all hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 font-label-caps"
              type="submit"
              disabled={loading}
            >
              {loading ? 'LOGGING IN...' : 'LOGIN TO WORKSPACE'}
            </button>
          </form>
        </div>
      </main>
    </section>
  )
}
