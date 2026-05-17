import MainLayout from '@/components/layout/MainLayout';
import ProfileView from '@/components/profile/ProfileView';

export async function generateMetadata({ params }) {
  return { title: `@${params.username}` };
}

export default function ProfilePage({ params }) {
  return (
    <MainLayout>
      <ProfileView username={params.username} />
    </MainLayout>
  );
}
