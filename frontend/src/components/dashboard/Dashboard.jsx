import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Spinner } from '../UI';
import styles from './Dashboard.module.css';

const statuses = ['todo', 'inprogress', 'done'];
const statusLabels = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };
const statusColors = { todo: '#7a8aaa', inprogress: '#4f8eff', done: '#22c87a' };

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <Spinner size={32} />
    </div>
  );

  const byStatus = data?.by_status || [];
  const getCount = (s) => {
    const found = byStatus.find(b => b.status === s);
    return found ? parseInt(found.count) : 0;
  };

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className={styles.sub}>Here's your team's activity at a glance</p>
        </div>
      </div>

      <div className={styles.statGrid}>
        <StatCard
          value={data?.total_tasks ?? 0}
          label="Total Tasks"
          icon="◎"
          color="accent"
        />
        <StatCard
          value={data?.my_tasks ?? 0}
          label="My Open Tasks"
          icon="◈"
          color="warning"
        />
        <StatCard
          value={data?.overdue ?? 0}
          label="Overdue"
          icon="⚠"
          color="danger"
        />
        <StatCard
          value={getCount('done')}
          label="Completed"
          icon="✓"
          color="success"
        />
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.statusCard}>
          <h3 className={styles.sectionTitle}>Tasks by Status</h3>
          <div className={styles.statusBars}>
            {statuses.map(s => {
              const count = getCount(s);
              const pct = data?.total_tasks ? Math.round((count / data.total_tasks) * 100) : 0;
              return (
                <div key={s} className={styles.statusRow}>
                  <div className={styles.statusMeta}>
                    <span className={styles.statusName}>{statusLabels[s]}</span>
                    <span className={styles.statusNum}>{count}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${pct}%`, background: statusColors[s] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.leaderCard}>
          <h3 className={styles.sectionTitle}>Tasks per User</h3>
          {data?.by_user?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.75rem' }}>No data yet</p>
          ) : (
            <div className={styles.userList}>
              {(data?.by_user || []).map((u, i) => (
                <div key={u.id} className={styles.userRow}>
                  <div className={styles.userRank}>#{i + 1}</div>
                  <div className={styles.userAvatar}>{u.name?.[0]?.toUpperCase()}</div>
                  <div className={styles.userName}>{u.name}</div>
                  <div className={styles.userCount}>{u.task_count} tasks</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, icon, color }) {
  const colorMap = {
    accent: { bg: 'var(--accent-dim)', text: 'var(--accent)' },
    warning: { bg: 'var(--warning-dim)', text: 'var(--warning)' },
    danger: { bg: 'var(--danger-dim)', text: 'var(--danger)' },
    success: { bg: 'var(--success-dim)', text: 'var(--success)' },
  };
  const c = colorMap[color];
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: c.bg, color: c.text }}>{icon}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
