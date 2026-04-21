const fs = require('fs');

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove the import of LiquidGlassCard
  content = content.replace(/import\s+(?:LiquidGlassCard|LiquidGlassGlobalCanvas)\s+from\s+['"].*LiquidGlass.*['"];?\n?/g, '');

  // 2. Remove <LiquidGlassCard ... /> usage
  content = content.replace(/\{\s*liquidGlassEnabled\s*&&\s*\(\s*<LiquidGlassCard[^>]*\/>\s*\)\s*\}/g, '');
  content = content.replace(/\{\s*liquidGlassEnabled\s*&&\s*<LiquidGlassCard[^>]*\/>\s*\}/g, '');
  content = content.replace(/<LiquidGlassCard[^>]*\/>/g, '');

  // 3. Remove <LiquidGlassGlobalCanvas />
  content = content.replace(/\{\s*liquidGlassEnabled\s*&&\s*<LiquidGlassGlobalCanvas[^>]*\/>\s*\}/g, '');
  
  // 4. In page.tsx, replace complex ternary logic for liquidGlassEnabled with the fallback branch.
  // We can do this safely by matching: `liquidGlassEnabled ? 'string1' : (isDark ? 'string2' : 'string3')`
  // Actually, we can just replace `liquidGlassEnabled` with `false` where it's a variable or state!
  
  // 5. Remove state declaration from page.tsx:
  content = content.replace(/const \[liquidGlassEnabled,\s*setLiquidGlassEnabled\]\s*=\s*useState<boolean>\([^)]*\);\n?/g, '');
  
  // 6. Remove localStorage loading
  content = content.replace(/const savedLiquid = localStorage\.getItem\('liquidGlassEnabled'\);[\s\S]*?if \(savedLiquid\) \{[\s\S]*?setLiquidGlassEnabled[^}]*\}[\s\S]*?(?:else \{[\s\S]*?\})?/g, '');

  // 7. Remove localStorage saving
  content = content.replace(/localStorage\.setItem\('liquidGlassEnabled'[^)]*\);?/g, '');

  // 8. Remove `liquidGlassEnabled` from prop definitions (interfaces or inline types)
  content = content.replace(/liquidGlassEnabled\s*\??\s*:\s*boolean\s*,?/g, '');

  // 9. Remove `liquidGlassEnabled` from destructuring
  // This is tricky without AST. Let's do a simple regex:
  // `liquidGlassEnabled,` or `, liquidGlassEnabled`
  content = content.replace(/,\s*liquidGlassEnabled/g, '');
  content = content.replace(/liquidGlassEnabled\s*,/g, '');

  // 10. Remove `liquidGlassEnabled={liquidGlassEnabled}`
  content = content.replace(/liquidGlassEnabled=\{liquidGlassEnabled\}/g, '');

  // 11. Remove LeftSidebar button chunk
  // We know it's from `\{/\*\s*Apple Liquid Glass\s*\*/\}` to `</div>\s*</div>\s*</div>` maybe?
  // Let's just remove everything from `{/* Apple Liquid Glass */}` up to `</button>`
  content = content.replace(/\{\/\*\s*Apple Liquid Glass\s*\*\/\}.*?<\/button>/s, '');
  
  // Remove the Liquid Reflection Color panel
  content = content.replace(/\{\s*liquidGlassEnabled\s*&&\s*\(\s*<div[^>]*>[\s\S]*?Liquid Reflection Color[\s\S]*?<\/div>\s*\)\s*\}/s, '');

  // 12. Fix ternary in LeftSidebar: `const modeLabel = liquidGlassEnabled ? 'Liquid' : (glassmorphismEnabled ? 'Glass' : 'Normal');`
  content = content.replace(/const modeLabel = liquidGlassEnabled \? 'Liquid' : \(/g, 'const modeLabel = (');

  // 13. Replace `liquidGlassEnabled` identifier with `false` globally except where we just removed it
  // This is safe because JS short circuits. `false ? 'a' : 'b'` is valid.
  content = content.replace(/\bliquidGlassEnabled\b/g, 'false');
  
  // 14. Remove liquid reflection color state
  content = content.replace(/const \[liquidReflectionColor,\s*setLiquidReflectionColor\].*?;\n/g, '');
  content = content.replace(/,\s*liquidReflectionColor\s*:\s*string/g, '');
  content = content.replace(/liquidReflectionColor\s*:\s*string\s*,?/g, '');
  content = content.replace(/,\s*liquidReflectionColor/g, '');
  content = content.replace(/liquidReflectionColor\s*,?/g, '');
  content = content.replace(/liquidReflectionColor=\{liquidReflectionColor\}/g, '');
  content = content.replace(/onSetLiquidReflectionColor=\{setLiquidReflectionColor\}/g, '');
  content = content.replace(/,\s*onSetLiquidReflectionColor\s*:\s*\(val:\s*string\)\s*=>\s*void/g, '');
  content = content.replace(/onSetLiquidReflectionColor\s*:\s*\(val:\s*string\)\s*=>\s*void\s*,?/g, '');
  content = content.replace(/,\s*onSetLiquidReflectionColor/g, '');
  content = content.replace(/onSetLiquidReflectionColor\s*,?/g, '');
  content = content.replace(/localStorage\.setItem\('liquidReflectionColor'[^)]*\);?/g, '');
  content = content.replace(/const savedReflection = localStorage\.getItem\('liquidReflectionColor'\);[\s\S]*?if \(savedReflection\) \{[\s\S]*?setLiquidReflectionColor[^}]*\}/g, '');

  fs.writeFileSync(filePath, content);
}

const files = [
  'app/page.tsx',
  'app/components/LeftSidebar.tsx',
  'app/components/CommandPalette.tsx'
];

files.forEach(f => cleanFile(__dirname + '/../' + f));
console.log('Cleaned files');
