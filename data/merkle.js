const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

function hashLeaf(address, amount) {
  return Buffer.from(
    keccak256(address + amount.toString().padStart(32, '0')).toString('hex'),
    'hex'
  );
}

async function generateMerkleRoot() {
  const leaves = [];

  await new Promise((resolve, reject) => {
    const csvFilePath = path.join(__dirname, 'airdrop.csv');
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        const leaf = hashLeaf(row.address, row.amount);
        leaves.push(leaf);
      })
      .on('end', () => {
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });

  const tree = new MerkleTree(leaves, keccak256, { sort: true });
  const root = tree.getHexRoot();

  console.log('Merkle Root:', root);

  const proofs = {};
  leaves.forEach((leaf, index) => {
    const proof = tree.getHexProof(leaf);
    proofs[index] = proof;
  });

  fs.writeFileSync('data/proofs.json', JSON.stringify(proofs, null, 2));
}

generateMerkleRoot();