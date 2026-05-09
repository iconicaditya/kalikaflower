import { v2 as cloudinary } from 'cloudinary';
import { env } from '@/server/lib/env';
import { fail, ok } from '@/server/lib/http';
import { parseBody, requireAdminRequest } from './_lib';

type Body = {
  dataUrl?: string;
  folder?: string;
};

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export default async function handler(request: Request) {
  try {
    await requireAdminRequest(request);
    const body = await parseBody<Body>(request);

    const dataUrl = body.dataUrl?.trim();
    if (!dataUrl) return fail('dataUrl is required', 400);
    if (!dataUrl.startsWith('data:image/')) {
      return fail('Only image data URLs are allowed', 400);
    }

    const folder = (body.folder?.trim() || 'godawari/plants').replace(/^\/+|\/+$/g, '');
    const upload = await cloudinary.uploader.upload(dataUrl, {
      folder,
      resource_type: 'image',
      overwrite: false,
      unique_filename: true,
      transformation: [{ fetch_format: 'auto', quality: 'auto' }],
    });

    return ok({
      ok: true,
      url: upload.secure_url,
      publicId: upload.public_id,
      width: upload.width,
      height: upload.height,
      format: upload.format,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to upload image', 500);
  }
}

