interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = src;
  });
}

export async function cropImageToBlob(
  src: string,
  area: CropArea,
  mimeType: string
): Promise<Blob> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not prepare image crop.");
  }

  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const outputType = mimeType === "image/png" ? "image/png" : "image/webp";

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not prepare image crop."));
        return;
      }
      resolve(blob);
    }, outputType, 0.92);
  });
}

