# Premium Medical Card Images - Generation Guide

This guide contains detailed prompts for generating high-quality premium images for each card in the medical clinic website.

## Image Specifications
- **Resolution**: 1024x1024px minimum (square format for cards)
- **Style**: Professional medical photography, clean and modern
- **Colors**: Gold accents (#B89C64), dark blue (#1A2332), white backgrounds
- **Format**: PNG with transparent background where appropriate
- **Quality**: High detail, medically accurate, professional appearance

## MethodGrid Cards (4 images needed)

### 1. Atendimento Personalizado (Personalized Care)
**Filename**: `atendimento-personalizado.png`

**Prompt for AI Image Generation:**
```
Professional medical consultation in modern clinic office, female doctor in white coat sitting at desk with tablet, having personalized discussion with patient, warm lighting, gold accent details on medical equipment, clean white walls, medical charts on wall, trust and care in the atmosphere, photorealistic, high detail, medical professional aesthetic, 4k resolution
```

**Key Elements**:
- Doctor-patient interaction
- Modern medical office
- Trust and personalization
- Professional medical attire

### 2. Avaliação por Bioimpedância (Bioimpedance Assessment)
**Filename**: `bioimpedancia-assessment.png`

**Prompt for AI Image Generation:**
```
Modern bioimpedance body composition analyzer in clinical setting, professional medical equipment with digital interface displaying body fat percentage and muscle mass metrics, female healthcare professional operating device, patient standing on platform, clean medical environment, gold accent highlights on equipment, scientific and precise atmosphere, photorealistic, high detail, medical technology aesthetic, 4k resolution
```

**Key Elements**:
- Bioimpedance equipment
- Digital health metrics display
- Medical professional operating device
- Clean clinical environment

### 3. Acompanhamento Estratégico (Strategic Monitoring)
**Filename**: `acompanhamento-estrategico.png`

**Prompt for AI Image Generation:**
```
Medical dashboard on tablet showing patient health progress charts and graphs, weight loss trajectory, body composition changes over time, performance metrics, strategic health monitoring interface, gold accent design elements, clean modern medical UI, professional healthcare analytics, photorealistic, high detail, data visualization aesthetic, 4k resolution
```

**Key Elements**:
- Health progress charts
- Data visualization
- Medical dashboard interface
- Strategic monitoring concept

### 4. Protocolos Individualizados (Individualized Protocols)
**Filename**: `protocolos-individualizados.png`

**Prompt for AI Image Generation:**
```
Personalized medical treatment plan document on desk with stethoscope, customized medication schedule, diet plan, exercise protocol, individual patient profile, medical charts and prescription papers, gold accent binder, professional medical planning, organized and detailed, photorealistic, high detail, healthcare documentation aesthetic, 4k resolution
```

**Key Elements**:
- Treatment plan documents
- Medication schedules
- Personalized protocols
- Medical planning materials

## Specialties Cards (4 images needed)

### 1. Obesidade (Obesity Treatment)
**Filename**: `obesidade-treatment.png`

**Prompt for AI Image Generation:**
```
Medical weight management consultation, doctor discussing obesity treatment plan with patient, body composition analysis charts, healthy food choices, exercise equipment in background, supportive and professional medical environment, gold accent medical tools, compassionate healthcare setting, photorealistic, high detail, obesity treatment aesthetic, 4k resolution
```

**Key Elements**:
- Weight management focus
- Healthy lifestyle elements
- Medical consultation
- Supportive environment

### 2. Performance (Sports Performance)
**Filename**: `performance-sports.png`

**Prompt for AI Image Generation:**
```
Sports medicine performance assessment, athlete undergoing physical evaluation, strength testing equipment, performance metrics on digital display, sports medicine professional, athletic training environment with medical equipment, gold accent sports medicine tools, high performance medical setting, photorealistic, high detail, sports medicine aesthetic, 4k resolution
```

**Key Elements**:
- Athletic performance
- Sports medicine equipment
- Physical assessment
- Performance metrics

### 3. Reposição Hormonal (Hormonal Replacement)
**Filename**: `reposicao-hormonal.png`

**Prompt for AI Image Generation:**
```
Hormonal health consultation, endocrinologist discussing hormone balance with patient, endocrine system diagram, hormone level charts, medical laboratory equipment, professional hormonal therapy setting, gold accent medical instruments, endocrine healthcare environment, photorealistic, high detail, hormonal medicine aesthetic, 4k resolution
```

**Key Elements**:
- Hormone balance focus
- Endocrine system
- Medical laboratory elements
- Hormonal therapy

### 4. Implantes Hormonais (Hormonal Implants)
**Filename**: `implantes-hormonais.png`

**Prompt for AI Image Generation:**
```
Hormonal implant procedure in modern medical clinic, subcutaneous hormone pellet implantation, sterile medical environment, professional healthcare team, implant delivery system, gold accent surgical tools, advanced medical technology setting, photorealistic, high detail, implant medicine aesthetic, 4k resolution
```

**Key Elements**:
- Medical implant procedure
- Sterile clinical environment
- Advanced medical technology
- Professional healthcare setting

## Generation Instructions

### Recommended AI Tools:
1. **Midjourney** (Discord bot) - Best for photorealistic medical imagery
2. **DALL-E 3** (ChatGPT) - Good for professional illustrations
3. **Stable Diffusion** (web interfaces) - Customizable medical content
4. **Adobe Firefly** - Professional medical photography style

### Prompt Engineering Tips:
- Start with "photorealistic, high detail, medical professional aesthetic"
- Include "gold accent details" to match site theme
- Specify "4k resolution" for quality
- Add "clean modern medical environment" for consistency
- Use "female healthcare professional" for brand consistency

### Post-Processing:
1. Ensure square format (1:1 aspect ratio)
2. Add subtle gold accent overlays if needed
3. Optimize file size for web (under 500KB)
4. Test transparency if used as overlays

### File Organization:
Save all images in `/public/` folder with the specified filenames.
Update component imports to use the new images.