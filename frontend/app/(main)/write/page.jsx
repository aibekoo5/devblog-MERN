import MainLayout from '@/components/layout/MainLayout';
import WriteEditor from '@/components/posts/WriteEditor';

export const metadata = { title: 'Write a post' };

export default function WritePage() {
  return (
    <MainLayout>
      <WriteEditor />
    </MainLayout>
  );
}
