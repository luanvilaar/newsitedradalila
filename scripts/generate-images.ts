import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
});

async function generateImage(prompt: string, outputPath: string) {
  try {
    console.log(`Generating image for: ${path.basename(outputPath)}...`);
    const model = 'gemini-2.0-flash-exp'; 
    const response = await ai.models.generateContent({
      model, 
      contents: {
        role: 'user',
        parts: [{ text: `Generate a high quality image: ${prompt}` }],
      },
      // Trying to request image modality if supported via config
      generationConfig: {
        responseModalities: ['image'],
      }
    } as any);

    let imageData: string | undefined;

    if (response.candidates && response.candidates[0]?.content?.parts) {
      // Check for inline data or image part
      for (const part of response.candidates[0].content.parts) {
        if ((part as any).inlineData?.data) {
          imageData = (part as any).inlineData.data;
          break;
        }
        if ((part as any).image?.data) { // SDK variation depending on version
           imageData = (part as any).image.data;
           break;
        }
      }

      if (imageData) {
        const buffer = Buffer.from(imageData, 'base64');
        fs.writeFileSync(outputPath, buffer);
        console.log(`✅ Image saved to ${outputPath}`);
      } else {
        console.error('❌ No image data found in response parts');
        // console.log(JSON.stringify(response, null, 2));
      }
    } else {
      console.error('❌ No candidates in response');
      // console.log(JSON.stringify(response, null, 2));
    }
  } catch (error: any) {
    if (error.message?.includes('404')) {
        console.error('❌ Model not found or API endpoint issue. Check model name.');
    } else if (error.message?.includes('429')) {
        console.error('❌ Rate limit exceeded.');
    } else {
        console.error('❌ Error generating image:', error.message || error);
    }
  }
}

async function main() {
  const publicDir = path.join(process.cwd(), 'public');

  // 1. Obesidade (Specialty)
  await generateImage(
    'High-end culinary photography of a balanced, gourmet meal focusing on vibrant colors (avocado, salmon, greens) and fresh ingredients, symbolic of healthy weight management within a medical context. Professional natural lighting, shallow depth of field, elegant styling, subtle gold cutlery/accents in background. 4k resolution, editorial food photography style.',
    path.join(publicDir, 'obesidade-treatment.png')
  );

  // 2. Performance (Specialty)
  await generateImage(
    'Cinematic shot of a high-performance athlete in a modern gym environment, focused intensity, dramatic moody lighting with rim light (golden hour). Subtle gold accents in the equipment or clothing. High contrast, 8k resolution, sports editorial style, detailed muscle definition, representing peak medical performance.',
    path.join(publicDir, 'performance-sports.png')
  );

  // 3. Reposição Hormonal (Specialty)
  await generateImage(
    'Abstract representation of vitality and balance. A healthy, fit energetic person (30-40s) ending a run in a golden hour sunrise setting, breathing deeply. Radiant lighting, lens flare, sense of energy and renewal. High resolution, lifestyle photography, representing hormonal balance.',
    path.join(publicDir, 'reposicao-hormonal.png')
  );

  // 4. Implantes Hormonais (Specialty)
  await generateImage(
    'Close-up macro shot of a hormonal implant pellet (tiny, white cylindrical) resting on a sterile, high-end medical glass tray. Clean, clinical luxury aesthetic. Soft focus background (bokeh), precise lighting to highlight technology and purity. Subtle gold glint on the surface. 4k resolution.',
    path.join(publicDir, 'implantes-hormonais.png')
  );
}

main().catch(console.error);
