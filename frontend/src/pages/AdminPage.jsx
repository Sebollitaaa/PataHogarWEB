import { useEffect, useState } from 'react';
import { adminApi } from '../api/admin';
import { ShieldIcon, UserIcon } from '../components/icons/Icons';
import { timeAgo } from '../utils/format';
import '../components/row-list.css';
import './admin.css';

export default function AdminPage() {
  const [tab, setTab] = useState('users');

  return (
    <div className="container admin-page">
      <div className="admin-page__header">
        <ShieldIcon size={22} />
        <h1>Administración</h1>
      </div>

      <div className="listing-tabs">
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Usuarios</button>
        <button className={tab === 'actions' ? 'active' : ''} onClick={() => setTab('actions')}>Auditoría</button>
      </div>

      {tab === 'users' ? <UsersTab /> : <ActionsTab />}
    </div>
  );
}

function UsersTab() {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function load() {
    adminApi.listUsers(q).then((d) => setUsers(d.users));
  }

  async function handleBan(user) {
    const reason = prompt(`¿Por qué suspendés a ${user.first_name} ${user.last_name}? (opcional)`) || '';
    await adminApi.banUser(user.id, reason);
    setMessage(`${user.first_name} fue suspendido.`);
    load();
  }

  async function handleUnban(user) {
    await adminApi.unbanUser(user.id);
    setMessage(`${user.first_name} fue reactivado.`);
    load();
  }

  async function handleDelete(user) {
    if (!confirm(`¿Eliminar definitivamente la cuenta de ${user.first_name} ${user.last_name}? Se borran también sus publicaciones.`)) return;
    const reason = prompt('Motivo (opcional)') || '';
    await adminApi.deleteUser(user.id, reason);
    setMessage(`${user.first_name} fue eliminado.`);
    load();
  }

  return (
    <div>
      <input className="input" placeholder="Buscar por nombre o email…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 320, marginBottom: 16 }} />
      {message && <div className="alert alert-info" style={{ marginBottom: 16 }}>{message}</div>}

      {!users ? null : users.length === 0 ? (
        <div className="listing-empty"><p>Sin resultados.</p></div>
      ) : (
        <ul className="row-list">
          {users.map((u) => (
            <li key={u.id} className="row-card">
              <span className="row-card__avatar"><UserIcon size={18} /></span>
              <div className="row-card__info">
                <strong>{u.first_name} {u.last_name}</strong>
                <span className="row-card__meta">{u.email} · {u.role}</span>
              </div>
              <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                {u.status === 'active' ? 'Activo' : 'Suspendido'}
              </span>
              <div className="row-card__actions">
                {u.status === 'active' ? (
                  <button className="btn btn-outline btn-sm" onClick={() => handleBan(u)}>Suspender</button>
                ) : (
                  <button className="btn btn-outline btn-sm" onClick={() => handleUnban(u)}>Reactivar</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ActionsTab() {
  const [actions, setActions] = useState(null);

  useEffect(() => {
    adminApi.actions().then((d) => setActions(d.actions));
  }, []);

  const LABELS = {
    delete_pet: 'Eliminó una publicación',
    ban_user: 'Suspendió un usuario',
    delete_user: 'Eliminó un usuario',
    flag_outdated_pet: 'Marcó una publicación como desactualizada',
  };

  return !actions ? null : actions.length === 0 ? (
    <div className="listing-empty"><p>Sin acciones registradas.</p></div>
  ) : (
    <ul className="row-list">
      {actions.map((a) => (
        <li key={a.id} className="row-card">
          <span className="row-card__avatar"><ShieldIcon size={16} /></span>
          <div className="row-card__info">
            <strong>{a.admin_first_name} {a.admin_last_name}</strong>
            <span className="row-card__meta">{LABELS[a.action_type] || a.action_type}{a.reason ? ` — ${a.reason}` : ''}</span>
          </div>
          <time className="row-card__time">{timeAgo(a.created_at)}</time>
        </li>
      ))}
    </ul>
  );
}
