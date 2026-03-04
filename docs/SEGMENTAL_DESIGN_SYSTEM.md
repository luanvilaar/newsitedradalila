# 🎨 Design System - Análise Corporal Segmentar

## Paleta de Cores

### Massa Magra (Azul)
```css
/* Primary */
--lean-primary: #3B82F6;     /* blue-600 */
--lean-light: #60A5FA;       /* blue-400 */
--lean-dark: #2563EB;        /* blue-700 */

/* Backgrounds */
--lean-bg-light: #DBEAFE;    /* blue-100 */
--lean-bg-lighter: #EFF6FF;  /* blue-50 */

/* Gradients */
background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
```

**Exemplo Visual:**
```
███████████  Primary (#3B82F6)
███████████  Light (#60A5FA)
███████████  Dark (#2563EB)
░░░░░░░░░░░  BG Light (#DBEAFE)
░░░░░░░░░░░  BG Lighter (#EFF6FF)
```

### Gordura (Laranja)
```css
/* Primary */
--fat-primary: #F97316;      /* orange-600 */
--fat-light: #FB923C;        /* orange-400 */
--fat-dark: #EA580C;         /* orange-700 */

/* Backgrounds */
--fat-bg-light: #FFEDD5;     /* orange-100 */
--fat-bg-lighter: #FFF7ED;   /* orange-50 */

/* Gradients */
background: linear-gradient(135deg, #FFEDD5, #FED7AA);
```

**Exemplo Visual:**
```
███████████  Primary (#F97316)
███████████  Light (#FB923C)
███████████  Dark (#EA580C)
░░░░░░░░░░░  BG Light (#FFEDD5)
░░░░░░░░░░░  BG Lighter (#FFF7ED)
```

### Status Colors

#### Normal (Verde)
```css
--status-normal-bg: #DCFCE7;    /* green-100 */
--status-normal-text: #15803D;  /* green-700 */
--status-normal-border: #BBF7D0; /* green-200 */
```

#### Acima (Vermelho)
```css
--status-high-bg: #FEE2E2;      /* red-100 */
--status-high-text: #B91C1C;    /* red-700 */
--status-high-border: #FECACA;  /* red-200 */
```

#### Abaixo (Amarelo)
```css
--status-low-bg: #FEF3C7;       /* yellow-100 */
--status-low-text: #A16207;     /* yellow-700 */
--status-low-border: #FDE68A;   /* yellow-200 */
```

### Cores Neutras
```css
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-900: #111827;
```

---

## Tipografia

### Fontes
```css
/* Headings */
font-family: system-ui, -apple-system, sans-serif;
font-weight: 600-700;

/* Body */
font-family: system-ui, -apple-system, sans-serif;
font-weight: 400-500;
```

### Tamanhos
```css
/* Card Title */
.card-title {
  font-size: 1.125rem;   /* 18px */
  font-weight: 600;
  color: #111827;        /* gray-900 */
}

/* Metric Value (kg) */
.metric-value {
  font-size: 1.5rem;     /* 24px */
  font-weight: 700;
  color: #111827;
}

/* Percentage */
.metric-percentage {
  font-size: 1.25rem;    /* 20px */
  font-weight: 600;
  color: var(--lean-primary) or var(--fat-primary);
}

/* Status Badge */
.status-badge {
  font-size: 0.75rem;    /* 12px */
  font-weight: 500;
}

/* Labels */
.label {
  font-size: 0.875rem;   /* 14px */
  font-weight: 500;
  color: #6B7280;        /* gray-600 */
}
```

---

## Espaçamento

### Padding
```css
/* Card */
padding: 1.5rem;         /* 24px */

/* Card Compact */
padding: 1rem;           /* 16px */

/* Button Toggle */
padding: 0.5rem 1rem;    /* 8px 16px */

/* Status Badge */
padding: 0.125rem 0.5rem; /* 2px 8px */
```

### Gap
```css
/* Grid */
gap: 1.5rem;             /* 24px */

/* Flex */
gap: 1rem;               /* 16px */

/* Small */
gap: 0.5rem;             /* 8px */
```

### Margin
```css
/* Section */
margin-bottom: 1.5rem;    /* 24px */

/* Card */
margin-bottom: 1rem;      /* 16px */

/* Element */
margin-bottom: 0.5rem;    /* 8px */
```

---

## Bordas e Raios

### Border Radius
```css
/* Card */
border-radius: 0.75rem;   /* 12px */

/* Button */
border-radius: 0.5rem;    /* 8px */

/* Badge */
border-radius: 9999px;    /* full */

/* Avatar Container */
border-radius: 1rem;      /* 16px */
```

### Borders
```css
/* Card */
border: 1px solid rgba(184, 156, 100, 0.2);

/* Status Badge */
border: 1px solid var(--status-border);

/* Focus */
outline: 2px solid var(--lean-primary);
outline-offset: 2px;
```

---

## Sombras

```css
/* Card Elevation */
.card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Card Hover */
.card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Button Active */
.button:active {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}
```

---

## Gradientes

### Card Background
```css
background: linear-gradient(135deg, 
  rgb(249, 250, 251), 
  rgb(255, 255, 255)
);
```

### Avatar Icon Background
```css
/* Massa Magra */
background: linear-gradient(135deg, 
  rgb(219, 234, 254), 
  rgb(191, 219, 254)
);

/* Gordura */
background: linear-gradient(135deg, 
  rgb(255, 237, 213), 
  rgb(254, 215, 170)
);
```

### Progress Bar
```css
/* Normal */
background: linear-gradient(90deg, 
  var(--color-400), 
  var(--color-600)
);

/* Acima */
background: linear-gradient(90deg, 
  rgb(248, 113, 113), 
  rgb(220, 38, 38)
);
```

---

## Animações (Framer Motion)

### Card Entrance
```typescript
const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};
```

### Progress Bar Fill
```typescript
initial={{ scaleX: 0 }}
animate={{ scaleX: 1 }}
transition={{ 
  delay: 0.4, 
  duration: 0.6,
  ease: "easeOut"
}}
style={{ originX: 0 }}
```

### Pulse Effect
```typescript
initial={{ scale: 0.8, opacity: 0.8 }}
animate={{ scale: 1.5, opacity: 0 }}
transition={{ 
  repeat: Infinity, 
  duration: 2,
  ease: "easeInOut"
}}
```

### Value Scale
```typescript
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ 
  type: "spring",
  delay: 0.2
}}
```

---

## Layout Responsivo

### Grid Breakpoints
```css
/* Mobile (default) */
.grid {
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Desktop (lg: 1024px+) */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}
```

### Avatar Sizes
```css
/* Mobile */
.avatar {
  height: 10rem;   /* 160px */
  width: 6rem;     /* 96px */
}

/* Desktop */
.avatar {
  height: 16rem;   /* 256px */
  width: 8rem;     /* 128px */
}
```

---

## Estados Interativos

### Hover
```css
/* Card */
.card:hover {
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

/* Button */
.button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Progress Bar */
.progress-bar:hover {
  filter: brightness(1.1);
}
```

### Active
```css
/* Toggle Button */
.toggle-active {
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: var(--primary-color);
}

/* Toggle Inactive */
.toggle-inactive {
  color: rgb(107, 114, 128);
}
```

### Focus
```css
/* Keyboard Navigation */
.interactive:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
  border-radius: 0.5rem;
}
```

---

## SVG Avatar

### Dimensions
```typescript
viewBox="0 0 100 250"
width="100%"
height="100%"
```

### Body Parts
```typescript
// Head
<circle cx="50" cy="20" r="12" fill="#E5E7EB" />

// Arm
<ellipse cx="72" cy="55" rx="6" ry="18" fill={color} />

// Leg
<ellipse cx="60" cy="135" rx="8" ry="30" fill={color} />
```

### Opacity Mapping
```typescript
const getOpacity = (status: string) => {
  if (status === "Normal") return 0.6;
  if (status === "Acima") return 0.9;
  return 0.4;
};
```

---

## Acessibilidade

### Contraste Mínimo
```
Normal Text:   4.5:1
Large Text:    3:1
UI Elements:   3:1
```

### ARIA Labels
```tsx
<div role="region" aria-label="Análise corporal segmentar">
  <button aria-label="Ver análise de massa magra">
    Massa Magra
  </button>
</div>
```

### Keyboard Navigation
```tsx
tabIndex={0}
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleToggle();
  }
}}
```

---

## Performance

### Framer Motion Optimization
```typescript
viewport={{ once: true }}  // Anima apenas uma vez
whileInView                 // Lazy animation on scroll
layoutId                    // Shared layout transitions
```

### Image Optimization
```typescript
// Se adicionar imagens
<Image 
  priority={false}
  loading="lazy"
  quality={85}
/>
```

---

**Referências de Design:**
- InBody S10 / InBody 770
- Material Design 3
- Tailwind CSS Design System
- Framer Motion Best Practices

---

**Criado**: 3 de março de 2026  
**Versão**: 1.0.0  
**Design System**: DT Medical Platform
