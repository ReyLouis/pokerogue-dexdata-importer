import sharp from 'sharp';

// Convert images to webp format
async function convertToWebP(imagePath) {
    const webpBuffer = await sharp(imagePath)
      .webp()
      .toBuffer();
    return webpBuffer;
  }
  
  // Upload pictures to R2
  export const uploadImg = async (imagePath:string, imageName:string) => {
    try {
      const webpBuffer = await convertToWebP(imagePath);
  
      const formData = new FormData();
      formData.append('file', new Blob([webpBuffer], { type: 'image/webp' }), imageName);
      const workerUrl = `${process.env.CLOUDFLARE_WORKER}`;
      const uploadResponse = await fetch(workerUrl, {
        method: 'PUT',
        headers: {
          'X-CF-Secret': `${process.env.R2_AUTH_KEY_SECRET}`, //Key used for Worker authentication  
        },
        body: formData
      });
  
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image via worker');
      }
      return `${process.env.R2_BUCKET_URL}${imageName}`;
    } catch (error) {
      console.error(error);
      throw new Error(`Error processing image: ${error}`);
    }
  }
  