export default function Avatar({ user, small = false }) {
  return <span className={`avatar ${small ? 'small' : ''}`} style={{ background: user?.color || '#e2b6ff' }}>{user?.initials || '??'}</span>;
}
