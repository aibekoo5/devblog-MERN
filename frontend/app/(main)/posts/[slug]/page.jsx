import MainLayout from '@/components/layout/MainLayout';
import PostDetail from '@/components/posts/PostDetail';

export async function generateMetadata({ params }) {
  return { title: params.slug.replace(/-/g, ' ') };
}

export default function PostPage({ params }) {
  return (
    <MainLayout>
      <PostDetail slug={params.slug} />
    </MainLayout>
  );
}
