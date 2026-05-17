import Image from 'next/image';

const sizeMap = { sm: 32, md: 48, lg: 72, xl: 96 };

export default function Avatar({ user, size = 'md' }) {
  const px = sizeMap[size] ?? 40;
  const cls = `avatar${size === 'lg' ? ' avatar-lg' : size === 'xl' ? ' avatar-xl' : ''}`;
  const initials = user?.username?.[0]?.toUpperCase() ?? '?';

  return (
    <div className={cls} style={{ width: px, height: px, fontSize: px * 0.36 }}>
      {user?.avatar ? (
        <Image src={user.avatar} alt={user.username} width={px} height={px} style={{ objectFit: 'cover', borderRadius: '50%' }} />
      ) : (
        initials
      )}
    </div>
  );
}
