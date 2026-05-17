import { jsx } from 'react/jsx-runtime';
import { warnIfInvalidPeerDependency, resolveMaybeUrlArg } from '@uploadthing/shared';
import { version } from 'uploadthing/client';
import { a as peerDependencies, U as UploadButton } from './button-client-DpQoAqtf.js';
export { g as generateReactHelpers } from './button-client-DpQoAqtf.js';
import { U as UploadDropzone } from './dropzone-client-T3eVoyIq.js';
export { u as useDropzone } from './dropzone-client-T3eVoyIq.js';
import { U as Uploader } from './uploader-client-DCvRO1q2.js';

const generateUploadButton = (opts)=>{
    warnIfInvalidPeerDependency("@uploadthing/react", peerDependencies.uploadthing, version);
    const url = resolveMaybeUrlArg(opts?.url);
    const TypedButton = (props)=>/*#__PURE__*/ jsx(UploadButton, {
            ...props,
            url: url
        });
    return TypedButton;
};
const generateUploadDropzone = (opts)=>{
    warnIfInvalidPeerDependency("@uploadthing/react", peerDependencies.uploadthing, version);
    const url = resolveMaybeUrlArg(opts?.url);
    const TypedDropzone = (props)=>/*#__PURE__*/ jsx(UploadDropzone, {
            ...props,
            url: url
        });
    return TypedDropzone;
};
const generateUploader = (opts)=>{
    warnIfInvalidPeerDependency("@uploadthing/react", peerDependencies.uploadthing, version);
    const url = resolveMaybeUrlArg(opts?.url);
    const TypedUploader = (props)=>/*#__PURE__*/ jsx(Uploader, {
            ...props,
            url: url
        });
    return TypedUploader;
};

export { UploadButton, UploadDropzone, Uploader, generateUploadButton, generateUploadDropzone, generateUploader };
