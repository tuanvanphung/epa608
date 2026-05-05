import fs from 'fs';

const content = fs.readFileSync('src/questions.ts', 'utf8');
const qs = [];
const regex = /category:\s*'([^']+)',\s*text:\s*'([^']+)'/g;
let m;
while ((m = regex.exec(content)) !== null) {
    if (m[1] === 'Type II') {
        qs.push(m[2]);
    }
}
fs.writeFileSync('q_list.txt', qs.join('\n'));
