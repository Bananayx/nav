import fs from 'node:fs';
import yaml from 'js-yaml';

const CONFIG_FILE = '_config.hexo-theme-webstack.yml';
const README_FILE = 'README.md';

const config = yaml.load(fs.readFileSync(CONFIG_FILE, 'utf8'));

// 把一个分类下的站点列表渲染成 Markdown 列表项，空列表返回 null
function buildSection(title, sites) {
  if (!Array.isArray(sites) || sites.length === 0) return null;
  return {
    title,
    items: sites.map((site) => {
      const desc = site.description ? ` - ${site.description}` : '';
      return `- [${site.name}](${site.url})${desc}`;
    }),
  };
}

const lines = ['# Banana Y.X. 导航', ''];

let siteCount = 0;
for (const item of config.menu ?? []) {
  if (Array.isArray(item.submenu) && item.submenu.length > 0) {
    const sections = item.submenu
      .map((sub) => buildSection(sub.name, config[sub.config]))
      .filter(Boolean);
    if (sections.length === 0) continue;
    lines.push(`## ${item.name}`, '');
    for (const { title, items } of sections) {
      siteCount += items.length;
      lines.push(`### ${title}`, '', ...items, '');
    }
  } else {
    const section = buildSection(item.name, config[item.config]);
    if (!section) continue;
    siteCount += section.items.length;
    lines.push(`## ${section.title}`, '', ...section.items, '');
  }
}

fs.writeFileSync(README_FILE, `${lines.join('\n').trimEnd()}\n`);
console.log(`README.md 已生成，共 ${siteCount} 个站点`);
