import { UserIcon } from './icons/Icons';
import { API_ORIGIN } from '../api/origin';
import './avatar.css';

export default function Avatar({ url, size = 34, alt = '' }) {
  const style = { width: size, height: size };
  if (url) {
    return <img src={`${API_ORIGIN}${url}`} alt={alt} className="avatar" style={style} />;
  }
  return (
    <span className="avatar avatar--placeholder" style={style}>
      <UserIcon size={Math.round(size * 0.5)} />
    </span>
  );
}
