import { useEffect, useState } from 'react'
import { createTopup, getTopups, getWallet, getWalletTransactions } from '../../services/wallet.service'

const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value || 0))} ₫`
const topupAmounts = [50_000, 100_000, 200_000, 500_000, 1_000_000]

export default function Wallet() {
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [topups, setTopups] = useState([])
  const [amount, setAmount] = useState(100_000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const [walletData, transactionData, topupData] = await Promise.all([
      getWallet(), getWalletTransactions(), getTopups(),
    ])
    setWallet(walletData)
    setTransactions(transactionData)
    setTopups(topupData)
  }

  useEffect(() => { load().catch((err) => setError(err.response?.data?.message || err.message)) }, [])

  const topup = async () => {
    setLoading(true)
    setError('')
    try {
      const order = await createTopup(Number(amount))
      setTopups((items) => [order, ...items])
      if (order.checkoutUrl) window.open(order.checkoutUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#111418] p-5 text-white lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-end justify-between">
          <div><p className="text-sm text-cyan-300">Thanh toán & sử dụng</p><h1 className="mt-1 text-3xl font-semibold">Ví AI Studio</h1></div>
          <button onClick={load} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Làm mới</button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-400/15 to-violet-500/10 p-6">
            <p className="text-sm text-slate-400">Số dư</p><p className="mt-3 text-3xl font-semibold">{money(wallet?.balanceVnd)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-slate-400">Đang giữ</p><p className="mt-3 text-3xl font-semibold text-amber-300">{money(wallet?.heldVnd)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-slate-400">Khả dụng</p><p className="mt-3 text-3xl font-semibold text-emerald-300">{money(wallet?.availableVnd)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          <section className="rounded-2xl border border-white/10 bg-[#181b20] p-6">
            <div className="mb-5 flex items-center gap-3"><span className="material-symbols-outlined text-cyan-300">account_balance_wallet</span><h2 className="text-lg font-semibold">Nạp tiền qua payOS</h2></div>
            <div className="grid grid-cols-2 gap-2">
              {topupAmounts.map((value) => <button key={value} onClick={() => setAmount(value)} className={`rounded-xl border px-3 py-3 text-sm ${amount === value ? 'border-cyan-400 bg-cyan-400/10 text-cyan-200' : 'border-white/10 bg-white/[0.03] text-slate-300'}`}>{money(value)}</button>)}
            </div>
            <label className="mt-4 block text-sm text-slate-400">Số tiền khác
              <input type="number" min="10000" max="100000000" step="1000" value={amount} onChange={(event) => setAmount(Number(event.target.value))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#22262d] px-4 py-3 text-white outline-none focus:border-cyan-400/60" />
            </label>
            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
            <button onClick={topup} disabled={loading} className="mt-5 w-full rounded-xl bg-white px-4 py-3 font-semibold text-black disabled:opacity-50">{loading ? 'Đang tạo liên kết…' : `Nạp ${money(amount)}`}</button>
            <p className="mt-3 text-xs leading-5 text-slate-500">Bạn sẽ được chuyển sang trang payOS để quét VietQR. Ví chỉ được cộng sau khi webhook thanh toán được xác minh.</p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#181b20] p-6">
            <h2 className="mb-5 text-lg font-semibold">Giao dịch gần đây</h2>
            <div className="custom-scrollbar max-h-[430px] overflow-y-auto">
              {!transactions.length && <p className="py-10 text-center text-sm text-slate-500">Chưa có giao dịch</p>}
              {transactions.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-white/5 py-4">
                  <div><p className="text-sm font-medium capitalize">{item.type}</p><p className="mt-1 text-xs text-slate-600">{new Date(item.createdAt).toLocaleString('vi-VN')}</p></div>
                  <div className="text-right"><p className={`font-semibold ${['topup', 'refund', 'adjustment'].includes(item.type) ? 'text-emerald-300' : 'text-white'}`}>{item.type === 'debit' ? '-' : '+'}{money(item.amountVnd)}</p><p className="mt-1 text-xs text-slate-600">Còn {money(item.balanceAfterVnd)}</p></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {!!topups.length && <section className="mt-6 rounded-2xl border border-white/10 bg-[#181b20] p-6"><h2 className="mb-4 text-lg font-semibold">Đơn nạp tiền</h2><div className="grid gap-3 md:grid-cols-2">{topups.slice(0, 6).map((order) => <div key={order.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] p-4"><div><p className="font-medium">{money(order.amountVnd)}</p><p className="mt-1 text-xs text-slate-500">#{order.orderCode}</p></div><div className="flex items-center gap-3"><span className={`text-xs font-semibold uppercase ${order.status === 'paid' ? 'text-emerald-300' : 'text-amber-300'}`}>{order.status}</span>{order.status === 'pending' && order.checkoutUrl && <a href={order.checkoutUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 px-3 py-2 text-xs">Mở payOS</a>}</div></div>)}</div></section>}
      </div>
    </div>
  )
}
