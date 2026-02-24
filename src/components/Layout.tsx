import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={styles.wrapper}>
      <nav style={styles.nav}>
        <span style={styles.brand}>MyCycleCoach</span>
        <div style={styles.navLinks}>
          <NavLink
            to="/training"
            style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}
          >
            Training
          </NavLink>
          <NavLink
            to="/strava"
            style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}
          >
            Strava
          </NavLink>
          <NavLink
            to="/profile"
            style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}
          >
            Profile
          </NavLink>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Log Out
        </button>
      </nav>
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { minHeight: '100vh', background: '#f0f4f8' },
  nav: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 1.5rem',
    height: '56px',
    background: '#1a56db',
    color: '#fff',
    gap: '1.5rem',
  },
  brand: { fontWeight: 700, fontSize: '1.1rem', marginRight: 'auto' },
  navLinks: { display: 'flex', gap: '0.25rem' },
  navLink: {
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    padding: '0.4rem 0.75rem',
    borderRadius: '4px',
    fontWeight: 500,
  },
  navLinkActive: {
    color: '#fff',
    background: 'rgba(255,255,255,0.15)',
  },
  logoutBtn: {
    marginLeft: '0.5rem',
    padding: '0.4rem 0.9rem',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: '4px',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 500,
  },
  main: { padding: '1.5rem' },
};
