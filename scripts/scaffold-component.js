#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function getArg(name, defaultValue = '') {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : defaultValue;
}

const name = getArg('name');
const dir = getArg('dir', 'src/presentation/components');
const dryRun = process.argv.includes('--dry-run');

if (!name) {
  console.error('Usage: node scripts/scaffold-component.js --name=<ComponentName> [--dir=<targetDirectory>] [--dry-run]');
  console.error('Example: node scripts/scaffold-component.js --name=TurboBoostGauge --dir=src/presentation/components');
  process.exit(1);
}

const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
const camelName = name.charAt(0).toLowerCase() + name.slice(1);
const targetFolder = path.resolve(process.cwd(), dir);
const testFolder = path.join(targetFolder, '__tests__');

const vuePath = path.join(targetFolder, `${pascalName}.vue`);
const cssPath = path.join(targetFolder, `${camelName}.css`);
const testPath = path.join(testFolder, `${pascalName}.spec.ts`);

const vueTemplate = `<script setup lang="ts">
defineProps<{
  title?: string;
  active?: boolean;
}>();

const emit = defineEmits<{
  (e: 'action'): void;
}>();
</script>

<template>
  <div class="${camelName}-card" :class="{ 'is-active': active }">
    <span class="${camelName}-title">{{ title ?? '${pascalName}' }}</span>
    <button type="button" class="${camelName}-btn" @click="emit('action')">
      Trigger
    </button>
  </div>
</template>

<style scoped src="./${camelName}.css"></style>
`;

const cssTemplate = `.${camelName}-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border-radius: var(--radius-squircle, 22px);
  background: var(--panel, #151a17);
  border: 1px solid var(--panel-border, rgba(255, 255, 255, 0.08));
}

.${camelName}-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text, #f1efe8);
}

.${camelName}-btn {
  padding: 8px 16px;
  border-radius: var(--radius-rect, 18px);
  background: var(--acid, #d9ff78);
  color: #111;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
`;

const testTemplate = `import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ${pascalName} from '../${pascalName}.vue';

describe('${pascalName}', () => {
  it('renders default title and emits action on click', async () => {
    const wrapper = mount(${pascalName}, {
      props: { title: 'Custom Title', active: true },
    });

    expect(wrapper.text()).toContain('Custom Title');
    expect(wrapper.classes()).toContain('is-active');

    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('action')).toHaveLength(1);
  });
});
`;

console.log(`\n🚀 Scaffolding Micro-Component: ${pascalName}`);
console.log(`📁 Target Directory: ${targetFolder}`);

if (dryRun) {
  console.log('[Dry Run] Would create:');
  console.log(`  - ${vuePath}`);
  console.log(`  - ${cssPath}`);
  console.log(`  - ${testPath}`);
  process.exit(0);
}

fs.mkdirSync(targetFolder, { recursive: true });
fs.mkdirSync(testFolder, { recursive: true });

fs.writeFileSync(vuePath, vueTemplate, 'utf8');
fs.writeFileSync(cssPath, cssTemplate, 'utf8');
fs.writeFileSync(testPath, testTemplate, 'utf8');

console.log(`✓ Created: ${path.relative(process.cwd(), vuePath)}`);
console.log(`✓ Created: ${path.relative(process.cwd(), cssPath)}`);
console.log(`✓ Created: ${path.relative(process.cwd(), testPath)}`);
console.log(`🎉 Component ${pascalName} scaffolded successfully with modular CSS and unit tests!\n`);
