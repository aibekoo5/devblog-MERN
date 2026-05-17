import { Suspense } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import WriteEditor from '@/components/posts/WriteEditor';

export const metadata = { title: 'Write a post' };

export default function WritePage() {
  return (
    <MainLayout>
      <Suspense fallback={<div style={{ padding: 48, textAlign: 'center' }}><span className="spinner" /></div>}>
        <WriteEditor />
      </Suspense>
    </MainLayout>
  );
}