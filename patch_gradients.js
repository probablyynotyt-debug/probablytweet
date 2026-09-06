const fs = require('fs');
const content = fs.readFileSync('src/lib/customization.ts', 'utf8');

const oldGradients = [
  'linear-gradient(45deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
  'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(120deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(to right, #fa709a 0%, #fee140 100%)',
  'linear-gradient(to top, #30cfd0 0%, #330867 100%)',
  'linear-gradient(to right, #ff758c 0%, #ff7eb3 100%)',
  'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)',
  'linear-gradient(to top, #ff0844 0%, #ffb199 100%)',
  'linear-gradient(to top, #96fbc4 0%, #f9f586 100%)',
  'linear-gradient(120deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
  'linear-gradient(to top, #c471f5 0%, #fa71cd 100%)',
  'linear-gradient(to top, #48c6ef 0%, #6f86d6 100%)',
  'linear-gradient(to right, #feada6 0%, #f5efef 100%)',
  'linear-gradient(to top, #e14fad 0%, #f9d423 100%)',
  'linear-gradient(to top, #00c6fb 0%, #005bea 100%)',
  'linear-gradient(to top, #fdcbf1 0%, #fdcbf1 1%, #e6dee9 100%)',
  'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(to right, #cfd9df 0%, #e2ebf0 100%)',
  'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)',
  'linear-gradient(to right, #a8caba 0%, #5d4157 100%)',
  'linear-gradient(to right, #29323c 0%, #485563 100%)',
  'linear-gradient(to bottom, #FFB199 0%, #FF0844 100%)',
  'linear-gradient(to right, #92fe9d 0%, #00c9ff 100%)',
  'linear-gradient(to right, #ff758c 0%, #ff7eb3 100%)',
  'linear-gradient(to right, #00b09b, #96c93d)',
  'linear-gradient(to right, #8e2de2, #4a00e0)',
  'linear-gradient(to right, #ff416c, #ff4b2b)',
  'linear-gradient(to right, #f7971e, #ffd200)',
  'linear-gradient(to right, #b20a2c, #fffbd5)',
  'linear-gradient(to right, #fc4a1a, #f7b733)',
  'linear-gradient(to right, #11998e, #38ef7d)',
  'linear-gradient(to right, #ee0979, #ff6a00)',
  'linear-gradient(to right, #3a1c71, #d76d77, #ffaf7b)',
  'linear-gradient(to right, #1fa2ff, #12d8fa, #a6ffcb)',
  'linear-gradient(to right, #4cb8c4, #3cd3ad)',
  'linear-gradient(to right, #0052d4, #4364f7, #6fb1fc)',
  'linear-gradient(to right, #fc00ff, #00dbde)',
  'linear-gradient(to right, #e55d87, #5fc3e4)'
];

const uniqueGradients = Array.from(new Set(oldGradients));
const newGradientsStr = 'export const GRADIENTS = [\n' + uniqueGradients.map(s => `  '${s}'`).join(',\n') + '\n];';

const regex = /export const GRADIENTS = \[[^\]]+\];/m;
const updatedContent = content.replace(regex, newGradientsStr);

fs.writeFileSync('src/lib/customization.ts', updatedContent);
console.log('Fixed gradients!');
