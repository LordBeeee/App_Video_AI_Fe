import { useCallback, useEffect, useState } from 'react'
import { createTopup, getTopups, getWallet, getWalletTransactions } from '../../services/wallet.service'
import { Page, Card, Tile, Skeleton, Empty } from '../../components/Aurora/AuroraUI'
import './wallet.css'

const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value || 0))} ₫`
const topupAmounts = [50_000, 100_000, 200_000, 500_000, 1_000_000]

const TX_TYPES = {
  topup: { label: 'Nạp tiền', icon: 'south_west', pos: true },
  debit: { label: 'Chi tiêu', icon: 'north_east', pos: false },
  refund: { label: 'Hoàn tiền', icon: 'undo', pos: true },
  adjustment: { label: 'Điều chỉnh', icon: 'tune', pos: true },
}

const ORDER_STATUS = {
  paid: { label: 'Đã thanh toán', tone: 'ok', icon: 'check_circle' },
  pending: { label: 'Chờ thanh toán', tone: 'run', icon: 'autorenew' },
  cancelled: { label: 'Đã hủy', tone: 'bad', icon: 'cancel' },
  expired: { label: 'Hết hạn', tone: 'bad', icon: 'timer_off' },
}

export default function Wallet() {
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [topups, setTopups] = useState([])
  const [amount, setAmount] = useState(100_000)
  const [paying, setPaying] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const [walletData, transactionData, topupData] = await Promise.all([
        getWallet(), getWalletTransactions(), getTopups(),
      ])
      setWallet(walletData)
      setTransactions(transactionData)
      setTopups(topupData)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const topup = async () => {
    setPaying(true)
    setError('')
    try {
      const order = await createTopup(Number(amount))
      setTopups((items) => [order, ...items])
      if (order.checkoutUrl) window.open(order.checkoutUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally { setPaying(false) }
  }

  const pending = !loaded

  return (
    <Page>
      <header className="au-head">
        <h1 className="au-title au-fd">Ví & thanh toán</h1>
        <div className="au-tools">
          <button type="button" onClick={load} className="au-btn icon" title="Làm mới" aria-label="Làm mới">
            <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>
      </header>

      {error && <div className="au-warnline" role="alert">{error}</div>}

      <div className="au-tiles wl-tiles">
        <Tile tone="dark" icon="account_balance_wallet" label="Số dư" loading={pending} value={money(wallet?.balanceVnd)} />
        <Tile icon="lock_clock" label="Đang giữ" loading={pending} value={money(wallet?.heldVnd)} />
        <Tile tone="orange" icon="savings" label="Khả dụng" loading={pending} value={money(wallet?.availableVnd)} />
      </div>

      <div className="wl-main">
        <Card icon="qr_code_2" title="Nạp tiền qua payOS">
          <div className="au-scroll wl-form">
            <div className="wl-amts">
              {topupAmounts.map((value) => (
                <button key={value} type="button" onClick={() => setAmount(value)} className={`wl-amt${amount === value ? ' on' : ''}`}>{money(value)}</button>
              ))}
            </div>
            <label className="wl-lab">Số tiền khác
              <span className="wl-in">
                <span className="material-symbols-outlined">edit</span>
                <input type="number" min="10000" max="100000000" step="1000" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
                <em>₫</em>
              </span>
            </label>
            <button type="button" onClick={topup} disabled={paying} className="au-btn solid wl-cta">
              <span className="material-symbols-outlined">{paying ? 'progress_activity' : 'qr_code_2'}</span>
              {paying ? 'Đang tạo liên kết…' : `Nạp ${money(amount)}`}
            </button>
            <p className="wl-note">
              <span className="material-symbols-outlined">info</span>
              Bạn sẽ được chuyển sang trang payOS để quét VietQR. Ví chỉ được cộng sau khi webhook thanh toán được xác minh.
            </p>
          </div>
        </Card>

        <div className="wl-col">
          <Card icon="receipt_long" title="Giao dịch gần đây" className="wl-tx">
            {pending ? <Skeleton h="100%" /> : !transactions.length ? (
              <Empty icon="receipt_long" text="Chưa có giao dịch" />
            ) : (
              <div className="au-scroll">
                <ul className="au-list">
                  {transactions.map((item) => {
                    const meta = TX_TYPES[item.type] || { label: item.type, icon: 'swap_horiz', pos: true }
                    return (
                      <li key={item.id} className="au-tk">
                        <span className={`au-ic wl-ic${meta.pos ? ' pos' : ''}`}><span className="material-symbols-outlined">{meta.icon}</span></span>
                        <div className="au-tk-m">
                          <b>{meta.label}</b>
                          <small>{new Date(item.createdAt).toLocaleString('vi-VN')}</small>
                        </div>
                        <div className="wl-v">
                          <b className={meta.pos ? 'pos' : ''}>{item.type === 'debit' ? '-' : '+'}{money(item.amountVnd)}</b>
                          <small>Còn {money(item.balanceAfterVnd)}</small>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </Card>

          {!!topups.length && (
            <Card icon="request_quote" title="Đơn nạp tiền" className="wl-od">
              <div className="au-scroll">
                <ul className="au-list">
                  {topups.slice(0, 6).map((order) => {
                    const status = ORDER_STATUS[order.status] || { label: order.status, tone: '', icon: 'schedule' }
                    return (
                      <li key={order.id} className="au-tk">
                        <span className="au-ic"><span className="material-symbols-outlined">qr_code_2</span></span>
                        <div className="au-tk-m">
                          <b>{money(order.amountVnd)}</b>
                          <small>#{order.orderCode}</small>
                        </div>
                        {order.status === 'pending' && order.checkoutUrl && (
                          <a href={order.checkoutUrl} target="_blank" rel="noreferrer" className="au-ico" title="Mở payOS" aria-label="Mở payOS">
                            <span className="material-symbols-outlined">open_in_new</span>
                          </a>
                        )}
                        <span className={`au-st ${status.tone}`} title={status.label}><span className="material-symbols-outlined">{status.icon}</span></span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Page>
  )
}
