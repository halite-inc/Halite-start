const fs = require('fs');
const path = require('path');

function removeLiquid(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove LiquidGlassCard import
  content = content.replace(/import\s+LiquidGlassCard\s+from\s+['"].*LiquidGlass.*['"];?\n?/g, '');

  // Remove <LiquidGlassCard ... /> usage
  content = content.replace(/\{\s*liquidGlassEnabled\s*&&\s*\(\s*<LiquidGlassCard[^>]*\/>\s*\)\s*\}/g, '');
  content = content.replace(/\{\s*liquidGlassEnabled\s*&&\s*<LiquidGlassCard[^>]*\/>\s*\}/g, '');
  
  // Remove `{liquidGlassEnabled ? 'liquid-surface' : ...}` in CommandPalette
  content = content.replace(/liquidGlassEnabled\s*\?\s*'liquid-surface'\s*:\s*/g, '');

  // Replace ternary: `${liquidGlassEnabled ? 'A' : B}` with `${B}`
  // Because it spans multiple lines often, let's use a regex that matches `liquidGlassEnabled \n ? X \n : `
  // Actually, let's just do it carefully.

  // In page.tsx:
  // } ${liquidGlassEnabled
  //   ? '' // handled by component
  //   : glassmorphismEnabled
  content = content.replace(/\}\s*\$\{\s*liquidGlassEnabled\s*\?\s*''[^\n]*\s*:\s*glassmorphismEnabled/g, '} ${glassmorphismEnabled');
  
  // same for LeftSidebar:
  // } ${liquidGlassEnabled ? 'liquid-surface' : glassmorphismEnabled
  content = content.replace(/\$\{\s*liquidGlassEnabled\s*\?\s*'liquid-surface'\s*:\s*glassmorphismEnabled/g, '${glassmorphismEnabled');

  // In LeftSidebar:
  // const isLiquid = liquidGlassEnabled;
  content = content.replace(/const isLiquid = liquidGlassEnabled;\n/g, 'const isLiquid = false;\n');
  
  // const modeLabel = liquidGlassEnabled ? 'Liquid' : (glassmorphismEnabled ? 'Glass' : 'Normal');
  content = content.replace(/liquidGlassEnabled\s*\?\s*'Liquid'\s*:\s*\(/g, '(');

  // remove button inside LeftSidebar (lines ~2175-2198)
  // It's the 3rd button in the "Dashboard Theme" group.
  // Let's just remove the liquidGlassEnabled from LeftSidebar props and page state.

  fs.writeFileSync(filePath, content);
}

const files = [
  path.join(__dirname, 'page.tsx'),
  path.join(__dirname, 'components/LeftSidebar.tsx'),
  path.join(__dirname, 'components/CommandPalette.tsx')
];

files.forEach(removeLiquid);

console.log('Script ran successfully!');
