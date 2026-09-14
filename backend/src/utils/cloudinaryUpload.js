import { Readable } from 'stream'
import cloudinary from '../config/cloudinary.js'

export function uploadToCloudinary(buffer, folder = 'anirudh-hardware/products') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    )

    Readable.from(buffer).pipe(stream)
  })
}