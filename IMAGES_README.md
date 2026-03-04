# Premium Images for Medical Clinic Cards

This project requires high-quality premium images for the website cards. We've created automated tools and manual guides to help generate these images.

## 🎯 Required Images

### MethodGrid Cards (4 images)
- `atendimento-personalizado.png` - Personalized medical consultation
- `bioimpedancia-assessment.png` - Bioimpedance equipment and analysis
- `acompanhamento-estrategico.png` - Health monitoring dashboard
- `protocolos-individualizados.png` - Customized treatment plans

### Specialties Cards (4 images)
- `obesidade-treatment.png` - Obesity treatment consultation
- `performance-sports.png` - Sports medicine performance assessment
- `reposicao-hormonal.png` - Hormonal replacement therapy
- `implantes-hormonais.png` - Hormonal implant procedures

## 🚀 Automated Generation

### Prerequisites
Set up API keys for image generation:

```bash
# Option 1: OpenAI DALL-E 3
export OPENAI_API_KEY="your-openai-api-key"

# Option 2: Replicate (Stable Diffusion)
export REPLICATE_API_TOKEN="your-replicate-token"
```

### Generate All Images
```bash
node scripts/generate-images.js --all
```

### Generate by Category
```bash
# Method cards only
node scripts/generate-images.js --method

# Specialty cards only
node scripts/generate-images.js --specialty
```

### Generate Single Image
```bash
node scripts/generate-images.js --single atendimento-personalizado
```

## 🎨 Manual Generation Guide

If you prefer to generate images manually, follow our detailed guide:

📖 **[Complete Image Generation Guide](docs/PREMIUM_IMAGES_GUIDE.md)**

The guide includes:
- Detailed prompts for each image
- Recommended AI tools (Midjourney, DALL-E, Stable Diffusion)
- Technical specifications
- Post-processing instructions

## 🛠️ Recommended AI Tools

### 1. Midjourney (Discord)
- Best for photorealistic medical imagery
- Join: https://discord.gg/midjourney
- Use prompts from `docs/PREMIUM_IMAGES_GUIDE.md`

### 2. DALL-E 3 (ChatGPT Plus)
- Good for professional illustrations
- Access: https://chat.openai.com/
- Use the prompts with `--ar 1:1` for square format

### 3. Stable Diffusion (Web Interfaces)
- Customizable medical content
- Free options: Automatic1111, Stable Diffusion WebUI
- Use prompts with detailed parameters

### 4. Adobe Firefly
- Professional medical photography style
- Access: https://firefly.adobe.com/

## 📋 Quality Checklist

Before using generated images:

- [ ] Square format (1:1 aspect ratio)
- [ ] High resolution (1024x1024px minimum)
- [ ] Professional medical appearance
- [ ] Gold accent colors (#B89C64)
- [ ] Medically accurate content
- [ ] Clean, modern aesthetic
- [ ] Optimized file size (< 500KB)
- [ ] PNG format with transparency if needed

## 📁 File Organization

Save all images in the `/public/` folder with the exact filenames specified above.

## 🔄 Integration

After generating images, update the components to use them:

```tsx
// In MethodGrid.tsx
<Image
  src="/atendimento-personalizado.png"
  alt="Atendimento Personalizado"
  // ... other props
/>
```

## 💡 Tips for Best Results

1. **Consistency**: Use similar lighting and style across all images
2. **Medical Accuracy**: Ensure equipment and procedures look realistic
3. **Brand Colors**: Include gold accents to match the site theme
4. **Professional**: Maintain clean, trustworthy medical aesthetic
5. **Quality**: Generate at high resolution, then optimize for web

## 🆘 Troubleshooting

### API Issues
- Check API key validity
- Verify account has sufficient credits
- Try different AI services if one fails

### Quality Issues
- Regenerate with more specific prompts
- Adjust lighting/color parameters
- Use reference images for style guidance

### Technical Issues
- Ensure Node.js 18+ is installed
- Check network connectivity for API calls
- Verify write permissions for `/public/` folder

## 📞 Support

If you need help with image generation or have questions about the specifications, refer to the detailed guide in `docs/PREMIUM_IMAGES_GUIDE.md`.