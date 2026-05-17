import { createUploadthing } from 'uploadthing/next';
// SDK v7+: uses UPLOADTHING_TOKEN env variable automatically (no App ID / Secret needed separately)

const f = createUploadthing();

// Auth helper — reads JWT from custom header sent by the client
const auth = (req) => {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) throw new Error('Unauthorized');
  return { token };
};

export const ourFileRouter = {
  // Upload type 1: user avatar (image only, max 2MB)
  avatarUploader: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(({ req }) => auth(req))
    .onUploadComplete(({ metadata, file }) => {
      return { url: file.url };
    }),

  // Upload type 2: post cover image (image only, max 4MB)
  postCoverUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(({ req }) => auth(req))
    .onUploadComplete(({ metadata, file }) => {
      return { url: file.url };
    }),
};
