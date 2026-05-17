import MainLayout from '@/components/layout/MainLayout';
import PostsFeed from '@/components/posts/PostsFeed';

export const metadata = { title: 'DevBlog — Developer Stories & Knowledge' };

export default function HomePage() {
  return (
    <MainLayout>
      <PostsFeed />
    </MainLayout>
  );
}
