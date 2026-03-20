import { getCurrentUser } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { TIER_LIMITS, type Tier } from '@/lib/types';
import LogoutButton from './LogoutButton';

export const runtime = 'edge';

export default async function ProfilePage() {
  const user = (await getCurrentUser())!;
  const db = getDB();
  const limits = TIER_LIMITS[user.tier];

  const [urlCount, keyCount, totalClicks] = await Promise.all([
    db.prepare('SELECT COUNT(*) as count FROM urls WHERE user_id = ?').bind(user.id).first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM api_keys WHERE user_id = ? AND is_active = 1').bind(user.id).first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM clicks c JOIN urls u ON c.url_id = u.id WHERE u.user_id = ?')
      .bind(user.id).first<{ count: number }>(),
  ]);

  const urlLimit = limits.maxUrls === -1 ? '∞' : limits.maxUrls;
  const tiers: Tier[] = ['free', 'pro', 'business', 'enterprise'];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-text-primary mb-6">Profile</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Account */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold mb-4">Account</h2>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-lime-dim border border-lime-border flex items-center justify-center text-2xl font-bold text-lime-main overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                user.display_name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="text-lg font-semibold">{user.display_name}</div>
              <div className="text-sm text-text-secondary">{user.email}</div>
              <div className="flex gap-1.5 mt-1">
                <span className="badge bg-lime-dim text-lime-main border border-lime-border capitalize">{user.tier}</span>
                {user.role === 'admin' && (
                  <span className="badge bg-honey-dim text-honey-main border border-honey-border">Admin</span>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Elixpo ID</span>
              <span className="text-text-secondary font-mono text-xs">{user.elixpo_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Member since</span>
              <span className="text-text-secondary">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Usage */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold mb-4">Usage</h2>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-text-muted">URLs</span>
                <span>{urlCount?.count || 0} / {urlLimit}</span>
              </div>
              {limits.maxUrls !== -1 && (
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full bg-lime-main transition-all" style={{ width: `${Math.min(((urlCount?.count || 0) / limits.maxUrls) * 100, 100)}%` }} />
                </div>
              )}
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-text-muted">API Keys</span>
                <span>{keyCount?.count || 0} / {limits.maxApiKeys}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-full rounded-full bg-sage-main transition-all" style={{ width: `${Math.min(((keyCount?.count || 0) / limits.maxApiKeys) * 100, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="text-xs text-text-muted mb-1">Total Clicks</div>
              <div className="text-2xl font-bold">{totalClicks?.count || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-sm font-semibold mb-4">Plans</h2>
        <div className="grid grid-cols-4 gap-4">
          {tiers.map((tier) => {
            const tl = TIER_LIMITS[tier];
            const isCurrent = user.tier === tier;
            return (
              <div key={tier} className="p-5 rounded-xl border transition-all" style={{
                borderColor: isCurrent ? 'rgba(163, 230, 53, 0.3)' : 'rgba(255,255,255,0.1)',
                background: isCurrent ? 'rgba(163, 230, 53, 0.04)' : 'transparent',
              }}>
                <div className="font-semibold capitalize mb-1">{tier}</div>
                {isCurrent && <span className="badge bg-lime-dim text-lime-main border border-lime-border mb-3 inline-block">Current</span>}
                <div className="space-y-1.5 text-xs text-text-secondary mt-2">
                  <div>{tl.maxUrls === -1 ? 'Unlimited' : tl.maxUrls} URLs</div>
                  <div>{tl.maxApiKeys} API keys</div>
                  <div>{tl.maxClicksRetention}d analytics</div>
                  <div>{tl.customCodes ? '✓' : '✗'} Custom codes</div>
                  <div>{tl.analytics ? '✓' : '✗'} Analytics</div>
                  <div>{tl.expiringLinks ? '✓' : '✗'} Expiring links</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold">Session</h2>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
