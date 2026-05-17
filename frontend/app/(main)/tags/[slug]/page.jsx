import MainLayout from '@/components/layout/MainLayout';
import TagView from '@/components/tags/TagView';

export async function generateMetadata({ params }) {
  return { title: `#${params.slug}` };
}

export default function TagPage({ params }) {
  return (
    <MainLayout>
      <TagView slug={params.slug} />
    </MainLayout>
  );
}
