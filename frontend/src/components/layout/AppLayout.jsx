import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

export default function AppLayout() {
  return (
    <div className={styles.appLayout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
