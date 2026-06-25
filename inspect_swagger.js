const fs = require('fs');

try {
  let contentBuffer = fs.readFileSync('swagger.json');
  let contentStr;
  
  if (contentBuffer[0] === 0xFF && contentBuffer[1] === 0xFE) {
    contentStr = contentBuffer.toString('utf16le');
  } else if (contentBuffer[0] === 0xFE && contentBuffer[1] === 0xFF) {
    contentStr = contentBuffer.toString('utf16be');
  } else {
    contentStr = contentBuffer.toString('utf8');
  }

  // Strip BOM if present
  if (contentStr.charCodeAt(0) === 0xFEFF) {
    contentStr = contentStr.substring(1);
  }

  // Parse JSON
  const swagger = JSON.parse(contentStr);
  console.log('--- PATHS ---');
  for (const path in swagger.paths) {
    console.log(`${path}: ${Object.keys(swagger.paths[path]).join(', ')}`);
  }

  console.log('\n--- SCHEMAS ---');
  for (const schemaName in swagger.components.schemas) {
    if (schemaName.toLowerCase().includes('member') || schemaName.toLowerCase().includes('tier')) {
      console.log(`Schema: ${schemaName}`);
      const properties = swagger.components.schemas[schemaName].properties;
      if (properties) {
        for (const prop in properties) {
          console.log(`  - ${prop}: ${properties[prop].type || properties[prop].$ref}`);
        }
      }
    }
  }
} catch (err) {
  console.error(err);
}
