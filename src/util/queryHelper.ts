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
                colValuesBody = colValuesBody.concat(`NULL`); //set as null if no value found for key
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

//Function to create a generic update statement for one record in one table
//Assumes object with updated key/value pairs being passed in as updateFields
//Assumes conditions passed in as object with key/value pairs (e.g WHERE key1 = value1, key2 = value2)
//returnCol is optional to pass back new id or just confirmation of successful execution
export function createUpdateStatement(
    tableName: string,
    updateFields: object,
    conditions: object,
    returnCol: string
    ) {
    try {
        let colValuesBody = "";
        Object.entries(updateFields).forEach(([key, value], index) => {
            if (!value) {
                colValuesBody = colValuesBody.concat(`${key} = NULL`); //set as null if no value found for key
            } else {
                colValuesBody = colValuesBody.concat(`${key} = '${value}'`);
            }
            if (index < Object.keys(updateFields).length - 1) {
                colValuesBody = colValuesBody.concat(", ");
            }
        });
        let conditionBody = "";
        Object.entries(conditions).forEach(([key, value], index) => {
        if (!value) {
            conditionBody = conditionBody.concat(`${key} = NULL`);
        } else if (value.constructor === Date) {
            conditionBody = conditionBody.concat(
            `${key} = '${value.toISOString()}'`
            );
        } else {
            conditionBody = conditionBody.concat(`${key} = '${value}'`);
        }
        if (index < Object.keys(conditions).length - 1) {
            conditionBody = conditionBody.concat(" AND ");
        }
        });
        let returnColBody = "";
        if (returnCol) {
        returnColBody = returnColBody.concat(`RETURNING ${returnCol}`);
        }
        return `UPDATE ${tableName} SET ${colValuesBody} WHERE ${conditionBody} ${returnColBody}`;
    } catch (error) {
        return error.toISOString(); //KIV, to find a solution to handle the error better
    }
}