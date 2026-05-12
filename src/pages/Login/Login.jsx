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
      const data = await loginApi({
        email,
        password,
      })

      const accessToken = data.accessToken || data.access_token

      if (!accessToken) {
        throw new Error('Không nhận được access token từ server')
      }

      setSession({
        accessToken,
        user: data.user || null,
      })

      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen w-full bg-[#070d1d] flex items-center justify-center px-4">
      <main className="w-full max-w-[480px] z-10">
        <div className="glass-panel rounded-xl p-10 flex flex-col items-center gap-8 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="material-symbols-outlined text-4xl text-primary">
                auto_awesome
              </span>

              <span className="text-xl font-black tracking-tighter text-white font-h2">
                {/* CineAI */}
              </span>
            </div>

            <h1 className="font-h2 text-h2 text-white">Welcome Back</h1>

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
                  className="w-full bg-surface-container-highest/30 border border-outline-variant rounded-lg py-4 pl-12 pr-4 text-white font-mono-ui focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
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
                  className="w-full bg-surface-container-highest/30 border border-outline-variant rounded-lg py-4 pl-12 pr-12 text-white font-mono-ui focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
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
              className="w-full bg-gradient-to-r from-primary-container to-primary py-4 rounded-lg text-on-primary-container font-label-caps text-sm tracking-[0.2em] neon-glow transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
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