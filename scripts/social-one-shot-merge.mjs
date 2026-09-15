import fs from 'node:fs';

const queuePath = new URL('../distribution/social-queue.json', import.meta.url);
const oneShotPath = new URL('../distribution/social-one-shot.json', import.meta.url);

if (!fs.existsSync(oneShotPath)) {
  console.log(JSON.stringify({status: 'NO_ONE_SHOT_FILE'}));
  process.exit(0);
}

const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
const oneShot = JSON.parse(fs.readFileSync(oneShotPath, 'utf8'));
const item = oneShot?.item;

if (!item?.id) {
  console.log(JSON.stringify({status: 'INVALID_ONE_SHOT'}));
  process.exit(0);
}

if (queue.items.some((existing) => existing.id === item.id)) {
  console.log(JSON.stringify({status: 'ALREADY_MERGED', id: item.id}));
  process.exit(0);
}

queue.items.push(item);
fs.writeFileSync(queuePath, `${JSON.stringify(queue, null, 2)}\n`);
console.log(JSON.stringify({status: 'MERGED', id: item.id}));
