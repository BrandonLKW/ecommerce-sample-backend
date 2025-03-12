//Function to create a generic insert statement for one table
//Assumes object with key/value pairs being passed in as fields
//key/value pairs are cycled to write string in order(e.g INSERT INTO table1 (key1, key2) VALUES (value1, value2))
//returnCol is optional to pass back new id or just confirmation of successful execution
export function createInsertStatement(
    tableName: string,
    fields: object,
    returnCol: string
  ) {
    try {
      let colNameBody = ""; //used to build string based on object keys
      let colValuesBody = ""; //used to build string based on value keys
      Object.entries(fields).forEach(([key, value], index) => {
        colNameBody = colNameBody.concat(key);
        if (!value) {
          colValuesBody = colValuesBody.concat(`NULL`);
        } else {
          colValuesBody = colValuesBody.concat(`'${value}'`);
        }
        if (index < Object.keys(fields).length - 1) {
          colNameBody = colNameBody.concat(", ");
          colValuesBody = colValuesBody.concat(", ");
        }
      });
      let returnColBody = "";
      if (returnCol) {
        returnColBody = returnColBody.concat(`RETURNING ${returnCol}`);
      }
      return `INSERT INTO ${tableName} (${colNameBody}) VALUES (${colValuesBody}) ${returnColBody}`;
    } catch (error) {
      return error.toISOString(); //KIV, to find a solution to handle the error better
    }
  }