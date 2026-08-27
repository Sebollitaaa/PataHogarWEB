import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationsContext';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { timeAgo } from '../../utils/format';
import { notificationText, notificationLink } from '../../utils/notificationText';
import {
  BellIcon, HeartIcon, PlusIcon, UserIcon, ChevronDownIcon,
  LogOutIcon, ShieldIcon, MessageIcon,
} from '../icons/Icons';
import logo from '../../assets/logo-header.png';
import './header.css';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="brand">
          <img src={logo} alt="PataHogar" className="brand__logo" />
          <span>PataHogar</span>
        </Link>

        <nav className="site-header__nav">
          {isAuthenticated && (
            <Link to="/publicar" className="btn btn-accent btn-sm">
              <PlusIcon size={16} /> Publicar mascota
            </Link>
          )}

          {isAuthenticated ? (
            <>
              <Link to="/mensajes" className="icon-link" title="Mensajes" aria-label="Mensajes">
                <MessageIcon />
              </Link>
              <Link to="/favoritos" className="icon-link" title="Favoritos" aria-label="Favoritos">
                <HeartIcon />
              </Link>
              <NotificationsBell />
              <UserMenu user={user} onLogout={async () => { await logout(); navigate('/'); }} />
            </>
          ) : (
            <>
              <Link to="/ingresar" className="btn btn-outline btn-sm">Ingresar</Link>
              <Link to="/registro" className="btn btn-primary btn-sm">Crear cuenta</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function NotificationsBell() {
  const { unreadCount, recent, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  useOnClickOutside(ref, () => setOpen(false));

  return (
    <div className="dropdown" ref={ref}>
      <button className="icon-link icon-link--badge" onClick={() => setOpen((o) => !o)} aria-label="Notificaciones">
        <BellIcon />
        {unreadCount > 0 && <span className="badge-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      {open && (
        <div className="dropdown__panel dropdown__panel--wide">
          <div className="dropdown__header">
            <span>Notificaciones</span>
            {unreadCount > 0 && (
              <button className="link-btn" onClick={markAllRead}>Marcar todas como leídas</button>
            )}
          </div>
          {recent.length === 0 ? (
            <p className="dropdown__empty">No tenés notificaciones todavía.</p>
          ) : (
            <ul className="notif-list">
              {recent.map((n) => (
                <li key={n.id} className={n.isRead ? '' : 'notif-list__item--unread'}>
                  <button
                    className="notif-list__btn"
                    onClick={() => {
                      if (!n.isRead) markRead(n.id);
                      setOpen(false);
                      navigate(notificationLink(n));
                    }}
                  >
                    <span>{notificationText(n)}</span>
                    <time>{timeAgo(n.createdAt)}</time>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link to="/notificaciones" className="dropdown__footer" onClick={() => setOpen(false)}>
            Ver todas
          </Link>
        </div>
      )}
    </div>
  );
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setOpen(false));

  return (
    <div className="dropdown" ref={ref}>
      <button className="user-chip" onClick={() => setOpen((o) => !o)}>
        {user.profilePhotoUrl ? (
          <img src={`${import.meta.env.VITE_SOCKET_URL}${user.profilePhotoUrl}`} alt="" className="user-chip__avatar" />
        ) : (
          <span className="user-chip__avatar user-chip__avatar--placeholder"><UserIcon size={16} /></span>
        )}
        <span className="user-chip__name">{user.firstName}</span>
        <ChevronDownIcon size={16} />
      </button>
      {open && (
        <div className="dropdown__panel">
          <Link to="/mis-publicaciones" className="dropdown__link" onClick={() => setOpen(false)}>Mis publicaciones</Link>
          <Link to="/adoptadas" className="dropdown__link" onClick={() => setOpen(false)}>Adoptadas</Link>
          <Link to="/perfil" className="dropdown__link" onClick={() => setOpen(false)}>Mi perfil</Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="dropdown__link dropdown__link--accent" onClick={() => setOpen(false)}>
              <ShieldIcon size={16} /> Administración
            </Link>
          )}
          <button className="dropdown__link" onClick={onLogout}>
            <LogOutIcon size={16} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
