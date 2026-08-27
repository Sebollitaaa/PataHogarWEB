import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { conversationsApi } from '../api/conversations';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNotifications } from '../context/NotificationsContext';
import FullPageSpinner from '../components/ui/FullPageSpinner';
import Avatar from '../components/Avatar';
import { ArchiveIcon, ArrowLeftIcon, SendIcon, TrashIcon } from '../components/icons/Icons';
import { timeAgo } from '../utils/format';
import './messages.css';

export default function MessagesPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { refresh: refreshNotifications } = useNotifications();

  const [groups, setGroups] = useState(null);
  const [expandedPerson, setExpandedPerson] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    setLoadingThread(true);
    conversationsApi.messages(conversationId).then((d) => {
      setMessages(d.messages);
      setLoadingThread(false);
      loadConversations();
      refreshNotifications();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const handler = ({ conversationId: incomingId, message }) => {
      if (String(incomingId) === String(conversationId)) {
        setMessages((list) => [...list, message]);
        // El chat ya está abierto: le avisamos al backend que este mensaje se leyó
        // al toque, así la campanita no se queda con un número colgado.
        conversationsApi.messages(conversationId).then(() => refreshNotifications());
      }
      loadConversations();
    };
    socket.on('message:new', handler);
    return () => socket.off('message:new', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, conversationId]);

  function loadConversations() {
    conversationsApi.list().then((d) => setGroups(d.conversations));
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    try {
      await conversationsApi.send(conversationId, draft);
      setDraft('');
    } finally {
      setSending(false);
    }
  }

  async function handleArchive(chat, archived) {
    await conversationsApi.archive(chat.conversationId, archived);
    loadConversations();
  }

  async function handleDelete(chat) {
    if (!confirm('¿Eliminar esta conversación de tu lista?')) return;
    await conversationsApi.remove(chat.conversationId);
    if (String(chat.conversationId) === String(conversationId)) navigate('/mensajes');
    loadConversations();
  }

  if (groups === null) return <FullPageSpinner />;

  const visibleGroups = groups
    .map((g) => ({ ...g, chats: g.chats.filter((c) => showArchived || !c.archived) }))
    .filter((g) => g.chats.length > 0);

  const activeChat = groups.flatMap((g) => g.chats.map((c) => ({ ...c, counterpart: g.counterpart }))).find((c) => String(c.conversationId) === String(conversationId));

  return (
    <div className={`container messages-page ${conversationId ? 'has-active-chat' : ''}`}>
      <aside className="messages-sidebar">
        <div className="messages-sidebar__header">
          <h2>Mensajes</h2>
          <label className="checkbox-row" style={{ fontSize: '0.78rem' }}>
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} /> Ver archivados
          </label>
        </div>

        {visibleGroups.length === 0 ? (
          <p className="messages-empty">No tenés conversaciones todavía.</p>
        ) : (
          <ul className="conversation-list">
            {visibleGroups.map((g) => {
              const single = g.chats.length === 1;
              const isExpanded = expandedPerson === g.counterpart.id;
              return (
                <li key={g.counterpart.id}>
                  <button
                    className="conversation-list__person"
                    onClick={() => single ? navigate(`/mensajes/${g.chats[0].conversationId}`) : setExpandedPerson(isExpanded ? null : g.counterpart.id)}
                  >
                    <Avatar url={g.counterpart.profilePhotoUrl} />
                    <span className="conversation-list__person-info">
                      <strong>{g.counterpart.firstName} {g.counterpart.lastName}</strong>
                      {single && <span className="conversation-list__preview">{g.chats[0].lastMessagePreview}</span>}
                    </span>
                    {single && g.chats[0].unreadCount > 0 && <span className="badge-dot-static">{g.chats[0].unreadCount}</span>}
                  </button>

                  {(!single && isExpanded) && (
                    <ul className="conversation-list__subchats">
                      {g.chats.map((chat) => (
                        <li key={chat.conversationId}>
                          <button
                            className={String(chat.conversationId) === String(conversationId) ? 'active' : ''}
                            onClick={() => navigate(`/mensajes/${chat.conversationId}`)}
                          >
                            <span>{chat.petName}</span>
                            {chat.unreadCount > 0 && <span className="badge-dot-static">{chat.unreadCount}</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      <section className="messages-thread">
        {!conversationId ? (
          <div className="messages-empty messages-empty--center">Elegí una conversación para ver los mensajes.</div>
        ) : !activeChat ? (
          <div className="messages-empty messages-empty--center">Esta conversación ya no está disponible.</div>
        ) : (
          <>
            <div className="messages-thread__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button className="btn-icon btn-ghost mobile-back" onClick={() => navigate('/mensajes')} aria-label="Volver">
                  <ArrowLeftIcon size={18} />
                </button>
                <Avatar url={activeChat.counterpart.profilePhotoUrl} size={30} />
                <strong>{activeChat.counterpart.firstName} {activeChat.counterpart.lastName}</strong>
                <span className="field-hint"> · sobre {activeChat.petName}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-outline btn-sm" onClick={() => handleArchive(activeChat, !activeChat.archived)}>
                  <ArchiveIcon size={15} /> {activeChat.archived ? 'Desarchivar' : 'Archivar'}
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => handleDelete(activeChat)}>
                  <TrashIcon size={15} />
                </button>
              </div>
            </div>

            {loadingThread ? (
              <FullPageSpinner />
            ) : (
              <div className="messages-thread__body">
                {messages.map((m) => (
                  <div key={m.id} className={`bubble ${m.senderId === user.id ? 'bubble--own' : ''}`}>
                    <p>{m.content}</p>
                    <time>{timeAgo(m.createdAt)}</time>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}

            <form className="messages-thread__composer" onSubmit={handleSend}>
              <input
                className="input" placeholder="Escribí un mensaje…"
                value={draft} onChange={(e) => setDraft(e.target.value)}
              />
              <button className="btn btn-primary btn-icon" disabled={sending || !draft.trim()} aria-label="Enviar">
                <SendIcon size={18} />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
