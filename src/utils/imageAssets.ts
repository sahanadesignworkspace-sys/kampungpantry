import kampungFridgeHero from '../assets/images/kampung_fridge_hero_1794555569400.jpg';
import freshChoySum from '../assets/images/fresh_choy_sum_1794555569672.jpg';
import tropicalPapayaBananas from '../assets/images/tropical_papaya_bananas_1794555570329.jpg';
import pantryRiceLentils from '../assets/images/pantry_rice_lentils_1794555570700.jpg';
import kampungStirfryRecipe from '../assets/images/kampung_stirfry_recipe_1794555571732.jpg';
import type { ApprovedCategory } from '../types/pantry';

export const IMAGE_ASSETS = {
  hero: kampungFridgeHero,
  choySum: freshChoySum,
  fruit: tropicalPapayaBananas,
  pantry: pantryRiceLentils,
  stirfry: kampungStirfryRecipe,
} as const;

export function resolveFoodImage(imageUrl?: string, category?: ApprovedCategory): string {
  if (imageUrl && imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }
  if (imageUrl && imageUrl.startsWith('https://www.themealdb.com/images/')) {
    return imageUrl;
  }
  if (imageUrl === 'asset:hero') return IMAGE_ASSETS.hero;
  if (imageUrl === 'asset:choySum') return IMAGE_ASSETS.choySum;
  if (imageUrl === 'asset:fruit') return IMAGE_ASSETS.fruit;
  if (imageUrl === 'asset:pantry') return IMAGE_ASSETS.pantry;
  if (imageUrl === 'asset:stirfry') return IMAGE_ASSETS.stirfry;

  if (category === 'Vegetables') return IMAGE_ASSETS.choySum;
  if (category === 'Fruits') return IMAGE_ASSETS.fruit;
  return IMAGE_ASSETS.pantry;
}

export async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read selected image.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Unsupported image format.'));
      img.onload = () => {
        const maxWidth = 720;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
