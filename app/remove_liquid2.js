const fs = require('fs');
const path = require('path');

function removeAll(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove liquidGlassEnabled definition from props
  content = content.replace(/,\s*liquidGlassEnabled\s*:\s*boolean/g, '');
  content = content.replace(/liquidGlassEnabled\s*:\s*boolean\s*,?/g, '');
  
  // Remove liquidGlassEnabled from destructuring
  content = content.replace(/,\s*liquidGlassEnabled/g, '');
  content = content.replace(/liquidGlassEnabled\s*,?/g, '');
  
  // Remove liquidGlassEnabled={liquidGlassEnabled}
  content = content.replace(/liquidGlassEnabled=\{liquidGlassEnabled\}/g, '');
  
  // Remove setLiquidGlassEnabled
  content = content.replace(/const \[liquidGlassEnabled, setLiquidGlassEnabled\] = useState<boolean>\(false\);/g, '');
  content = content.replace(/setLiquidGlassEnabled\([^)]*\);?/g, '');

  // Remove localStorage.setItem('liquidGlassEnabled', ...);
  content = content.replace(/localStorage\.setItem\('liquidGlassEnabled'[^)]*\);?/g, '');
  content = content.replace(/const savedLiquid = localStorage\.getItem\('liquidGlassEnabled'\);?/g, '');

  // If there's any remaining `if (savedLiquid) setLiquidGlassEnabled(...)`
  content = content.replace(/if\s*\(savedLiquid\)[^{]*;?/g, '');

  // Remove `liquidGlassEnabled && <div ...>` in widgets
  content = content.replace(/\{\s*liquidGlassEnabled\s*&&\s*<div[^>]*className="pointer-events-none absolute inset-0 rounded-3xl"[^>]*>\s*<\/div>\s*\}/g, '');
  content = content.replace(/\{\s*liquidGlassEnabled\s*&&\s*<div[^>]*className="pointer-events-none absolute inset-0 rounded-3xl"[^>]*\/>\s*\}/g, '');

  // Replace `${liquidGlassEnabled \n ? ... : glassmorphismEnabled ? ... : ...}` in page.tsx
  // Since we already ran a regex, let's fix any remaining ternary expressions:
  content = content.replace(/\$\{liquidGlassEnabled\s*\?\s*`[^`]*`\s*:\s*isDark/g, '${isDark');

  // <LiquidGlassGlobalCanvas eventSource={containerRef} />
  content = content.replace(/import LiquidGlassGlobalCanvas.*/g, '');
  content = content.replace(/\{\s*liquidGlassEnabled\s*&&\s*<LiquidGlassGlobalCanvas[^>]*\/>\s*\}/g, '');

  // In LeftSidebar: `liquidGlassEnabled` might still exist.
  // We'll run the previous regex logic too, just in case.

  fs.writeFileSync(filePath, content);
}

['page.tsx', 'components/LeftSidebar.tsx', 'components/CommandPalette.tsx'].forEach(file => {
  removeAll(path.join(__dirname, file));
});

console.log('Deep clean completed.');
