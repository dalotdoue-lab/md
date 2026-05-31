/**
 * Prisma Safe Serialization Utility
 * Converts BigInt/Decimal to regular Numbers for JSON responses
 */

function serializePrisma(data) {
  if (data === null || data === undefined) return data;
  
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (typeof value === 'bigint') {
        return Number(value);
      }
      // Handle Prisma Decimal (if stringified)
      if (typeof value === 'object' && value !== null && 'toNumber' in value) {
        return Number(value.toString());
      }
      return value;
    })
  );
}

module.exports = { serializePrisma };

