import { createUploadthing } from 'uploadthing/next';

const f = createUploadthing();

const auth = (req) => {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) throw new Error('Unauthorized');
  return { token };
};

export const ourFileRouter = {
  avatarUploader: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(({ req }) => auth(req))
    .onUploadComplete(({ metadata, file }) => {
      return { url: file.url };
    }),

  postCoverUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(({ req }) => auth(req))
    .onUploadComplete(({ metadata, file }) => {
      return { url: file.url };
    }),
};
