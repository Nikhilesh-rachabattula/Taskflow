import styles from './UI.module.css';

export const Spinner = ({ size = 20 }) => (
  <div className={styles.spinner} style={{ width: size, height: size }} />
);

export const Button = ({ children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props }) => (
  <button
    className={`${styles.btn} ${styles[`btn_${variant}`]} ${styles[`btn_${size}`]} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? <Spinner size={16} /> : children}
  </button>
);

export const Badge = ({ children, color = 'default' }) => (
  <span className={`${styles.badge} ${styles[`badge_${color}`]}`}>{children}</span>
);

export const Card = ({ children, className = '', ...props }) => (
  <div className={`${styles.card} ${className}`} {...props}>{children}</div>
);

export const FormField = ({ label, error, children }) => (
  <div className={styles.field}>
    {label && <label className={styles.label}>{label}</label>}
    {children}
    {error && <span className={styles.error}>{error}</span>}
  </div>
);

export const EmptyState = ({ icon, title, desc, action }) => (
  <div className={styles.empty}>
    <div className={styles.emptyIcon}>{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
    {action}
  </div>
);

export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
};

export const statusColor = (s) => s === 'done' ? 'success' : s === 'inprogress' ? 'accent' : 'default';
export const priorityColor = (p) => p === 'high' ? 'danger' : p === 'medium' ? 'warning' : 'default';
export const statusLabel = (s) => s === 'todo' ? 'To Do' : s === 'inprogress' ? 'In Progress' : 'Done';
