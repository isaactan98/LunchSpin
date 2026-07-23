// Emits a browser_batch actions array for a slice of the audit queue.
// Results come back in queue order, so the extractor omits the name (mapped by index).
// Usage: node scripts/gen-batch.mjs <startIndex> <count> <tabId>
import { readFileSync } from 'node:fs';

const [start, count, tabId] = process.argv.slice(2).map(Number);
const queries = JSON.parse(readFileSync('scripts/.cache/queries.json', 'utf8'));

const X = `await new Promise(r=>setTimeout(r,2000));const f=document.querySelector('div[role="feed"]'),M=document.querySelector('div[role="main"]')||document.body,T=M.innerText||'',g=s=>{const e=M.querySelector(s);return e&&e.textContent.trim()};JSON.stringify(f?{m:'L',c:[...f.querySelectorAll('a[href*="/maps/place/"]')].map(a=>a.getAttribute('aria-label')).slice(0,3)}:{m:'P',n:g('h1'),k:g('button[jsaction*="category"]'),a:g('button[data-item-id="address"]'),x:/Permanently closed/i.test(T),h:(T.match(/(Open|Closed)[^\\n]{0,26}/)||[])[0],p:(T.match(/\\$\\d+[–-]\\d+/)||[])[0],s:['Dine-in','Takeaway','Delivery'].filter(v=>T.includes(v))})`;

const actions = [];
for (const item of queries.slice(start, start + count)) {
  actions.push({ name: 'navigate', input: { url: item.url, tabId } });
  actions.push({ name: 'javascript_tool', input: { action: 'javascript_exec', tabId, text: X } });
}
console.log(JSON.stringify(actions));
console.error(`# ${start}..${start + count - 1}: ` + queries.slice(start, start + count).map((q) => q.name).join(' / '));
