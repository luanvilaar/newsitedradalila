#!/usr/bin/env node

/**
 * Premium Medical Images Generator
 * Generates high-quality images for medical clinic website cards
 *
 * Usage: node scripts/generate-images.js
 *
 * Requires: OPENAI_API_KEY or REPLICATE_API_TOKEN environment variable
 */

require('dotenv').config({ path: '.env.images.local' });
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const https = require('https');

const IMAGE_PROMPTS = {
  // MethodGrid Cards
  'atendimento-personalizado': {
    prompt: 'Professional medical consultation in modern clinic office, female doctor in white coat sitting at desk with tablet, having personalized discussion with patient, warm lighting, gold accent details on medical equipment, clean white walls, medical charts on wall, trust and care in the atmosphere, photorealistic, high detail, medical professional aesthetic, 4k resolution',
    category: 'method'
  },
  'bioimpedancia-assessment': {
    prompt: 'Modern bioimpedance body composition analyzer in clinical setting, professional medical equipment with digital interface displaying body fat percentage and muscle mass metrics, female healthcare professional operating device, patient standing on platform, clean medical environment, gold accent highlights on equipment, scientific and precise atmosphere, photorealistic, high detail, medical technology aesthetic, 4k resolution',
    category: 'method'
  },
  'acompanhamento-estrategico': {
    prompt: 'Medical dashboard on tablet showing patient health progress charts and graphs, weight loss trajectory, body composition changes over time, performance metrics, strategic health monitoring interface, gold accent design elements, clean modern medical UI, professional healthcare analytics, photorealistic, high detail, data visualization aesthetic, 4k resolution',
    category: 'method'
  },
  'protocolos-individualizados': {
    prompt: 'Personalized medical treatment plan document on desk with stethoscope, customized medication schedule, diet plan, exercise protocol, individual patient profile, medical charts and prescription papers, gold accent binder, professional medical planning, organized and detailed, photorealistic, high detail, healthcare documentation aesthetic, 4k resolution',
    category: 'method'
  },

  // Specialties Cards
  'obesidade-treatment': {
    prompt: 'High-end culinary photography of a balanced, gourmet meal focusing on vibrant colors (avocado, salmon, greens) and fresh ingredients, symbolic of healthy weight management. Professional natural lighting, shallow depth of field, elegant styling, subtle gold cutlery/accents in background. 4k resolution, editorial food photography style.',
    category: 'specialty'
  },
  'performance-sports': {
    prompt: 'Cinematic shot of a high-performance athlete in a modern gym environment, focused intensity, dramatic moody lighting with rim light (golden hour). Subtle gold accents in the equipment or clothing. High contrast, 8k resolution, sports editorial style, detailed muscle definition, representing peak medical performance.',
    category: 'specialty'
  },
  'reposicao-hormonal': {
    prompt: 'Abstract representation of vitality and balance. A healthy, fit energetic person (30-40s) activity in a golden hour sunrise setting, breathing deeply. Radiant lighting, lens flare, sense of energy and renewal. High resolution, lifestyle photography, representing hormonal balance.',
    category: 'specialty'
  },
  'implantes-hormonais': {
    prompt: 'Close-up macro shot of a hormonal implant pellet (tiny, white cylindrical) resting on a sterile, high-end medical glass tray. Clean, clinical luxury aesthetic. Soft focus background (bokeh), precise lighting to highlight technology and purity. Subtle gold glint on the surface. 4k resolution.',
    category: 'specialty'
  }
};

class ImageGenerator {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || process.env.REPLICATE_API_TOKEN;
    this.outputDir = path.join(__dirname, '..', 'public');
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateImage(filename, prompt) {
    const outputPath = path.join(this.outputDir, `${filename}.png`);

    console.log(`🎨 Generating: ${filename}.png`);
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);

    try {
      if (process.env.OPENAI_API_KEY) {
        await this.generateWithOpenAI(prompt, outputPath);
      } else if (process.env.REPLICATE_API_TOKEN) {
        await this.generateWithReplicate(prompt, outputPath);
      } else {
        throw new Error('No API key found. Set OPENAI_API_KEY or REPLICATE_API_TOKEN');
      }

      console.log(`✅ Generated: ${filename}.png`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to generate ${filename}:`, error.message);
      return false;
    }
  }

  async generateWithOpenAI(prompt, outputPath) {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        size: '1024x1024',
        quality: 'standard',
        n: 1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    // Download the image
    await this.downloadImage(imageUrl, outputPath);
  }

  async generateWithReplicate(prompt, outputPath) {
    // Using Stable Diffusion via Replicate
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
      },
      body: JSON.stringify({
        version: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
        input: {
          prompt: prompt,
          width: 1024,
          height: 1024,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 25
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status}`);
    }

    const prediction = await response.json();

    // Wait for completion
    let result;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
        }
      });
      result = await statusResponse.json();
    } while (result.status !== 'succeeded' && result.status !== 'failed');

    if (result.status === 'failed') {
      throw new Error('Replicate prediction failed');
    }

    const imageUrl = result.output[0];
    await this.downloadImage(imageUrl, outputPath);
  }

  async downloadImage(url, outputPath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(outputPath);
      https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    });
  }

  async generateAll() {
    console.log('🚀 Starting premium medical image generation...\n');

    const results = [];
    for (const [filename, config] of Object.entries(IMAGE_PROMPTS)) {
      const success = await this.generateImage(filename, config.prompt);
      results.push({ filename, success, category: config.category });

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n📊 Generation Summary:');
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);

    if (successful.length > 0) {
      console.log('\n📁 Generated images saved to /public/:');
      successful.forEach(r => console.log(`   - ${r.filename}.png (${r.category})`));
    }

    if (failed.length > 0) {
      console.log('\n❌ Failed images:');
      failed.forEach(r => console.log(`   - ${r.filename}.png`));
    }
  }

  async generateCategory(category) {
    console.log(`🎯 Generating ${category} images...\n`);

    const categoryPrompts = Object.entries(IMAGE_PROMPTS)
      .filter(([_, config]) => config.category === category);

    for (const [filename, config] of categoryPrompts) {
      await this.generateImage(filename, config.prompt);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// CLI Interface
async function main() {
  const generator = new ImageGenerator();
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Premium Medical Images Generator

Usage:
  node scripts/generate-images.js [options]

Options:
  --all              Generate all images (default)
  --method           Generate only MethodGrid card images
  --specialty        Generate only Specialties card images
  --single <name>    Generate single image by filename
  --help             Show this help

Environment Variables:
  OPENAI_API_KEY     For DALL-E 3 generation
  REPLICATE_API_TOKEN For Stable Diffusion generation

Examples:
  node scripts/generate-images.js --all
  node scripts/generate-images.js --method
  node scripts/generate-images.js --single atendimento-personalizado
`);
    return;
  }

  if (args.includes('--method')) {
    await generator.generateCategory('method');
  } else if (args.includes('--specialty')) {
    await generator.generateCategory('specialty');
  } else if (args.includes('--single')) {
    const index = args.indexOf('--single');
    const filename = args[index + 1];
    if (!filename || !IMAGE_PROMPTS[filename]) {
      console.error(`❌ Invalid filename. Available: ${Object.keys(IMAGE_PROMPTS).join(', ')}`);
      return;
    }
    await generator.generateImage(filename, IMAGE_PROMPTS[filename].prompt);
  } else {
    await generator.generateAll();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ImageGenerator, IMAGE_PROMPTS };