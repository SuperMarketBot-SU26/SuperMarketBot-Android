const fs = require('fs');
let contentBuffer = fs.readFileSync('swagger.json');
let contentStr;
if (contentBuffer[0] === 0xFF && contentBuffer[1] === 0xFE) contentStr = contentBuffer.toString('utf16le');
else if (contentBuffer[0] === 0xFE && contentBuffer[1] === 0xFF) contentStr = contentBuffer.toString('utf16be');
else contentStr = contentBuffer.toString('utf8');
if (contentStr.charCodeAt(0) === 0xFEFF) contentStr = contentStr.substring(1);
const swagger = JSON.parse(contentStr);

// Check all schemas that have 'tier' or 'membership' fields
console.log('--- MEMBER /me related paths ---');
for (const path in swagger.paths) {
  if (path.toLowerCase().includes('/me') || path.toLowerCase().includes('member')) {
    console.log(path, ':', Object.keys(swagger.paths[path]).join(', '));
  }
}

console.log('\n--- ALL SCHEMAS WITH TIER FIELD ---');
for (const schemaName in swagger.components.schemas) {
  const props = swagger.components.schemas[schemaName].properties;
  if (props && (props.tier || props.membershipTier)) {
    console.log(`Schema: ${schemaName}`, JSON.stringify(props, null, 2));
  }
}

// Also check /api/search GET parameters
console.log('\n--- /api/search GET params ---');
const searchGet = swagger.paths['/api/search']?.get;
if (searchGet) {
  console.log(JSON.stringify(searchGet.parameters, null, 2));
}
