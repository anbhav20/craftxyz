import cloudinary from '../config/cloudinary.js';

export function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

export async function uploadMany(files, folder) {
  const results = await Promise.all(files.map((file) => uploadBuffer(file.buffer, folder)));
  return results.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
}

// Swallows individual failures — a dangling Cloudinary asset after a
// failed delete is a minor cleanup issue, not worth failing the whole
// request over (e.g. product deletion should still succeed).
export async function destroyMany(publicIds = []) {
  await Promise.all(publicIds.map((id) => cloudinary.uploader.destroy(id).catch(() => {})));
}
