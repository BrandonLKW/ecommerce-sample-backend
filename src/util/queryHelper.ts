//Function to create a generic insert statement for one row in one table
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

//Function to create an insert statement for multiple rows at the same time in one table
//Essentially same logic as createInsertStatement
export function createInsertMultipleStatement(
    tableName: string,
    items: object[]
) {
    try {
        let columns = "";
        //Use first object to build columns of the table
        Object.keys(items[0]).forEach((key, index) => {
        columns = columns.concat(`${key}`);
        if (index < Object.entries(items[0]).length - 1) {
            columns = columns.concat(",");
        }
        });
        //Build values block (e.g (value1, value2), (value1, value2) )
        let valuesBody = "";
        Object.values(items).forEach((item, index) => {
        let singleValue = "";
            Object.entries(item).forEach(([key, value], innerIndex) => {
                //If id param is found but no id value, use pgsql DEFAULT keyword
                if (key === "id" && value.toString() === "0") {
                    singleValue = singleValue.concat(`DEFAULT`);
                } else {
                    if (!value) {
                        singleValue = singleValue.concat(`NULL`);
                    } else {
                        singleValue = singleValue.concat(`'${value}'`);
                    }
                }
                if (innerIndex < Object.entries(item).length - 1) {
                    singleValue = singleValue.concat(`,`);
                }
            });
            valuesBody = valuesBody.concat(`(${singleValue})`);
            if (index < Object.entries(items).length - 1) {
                valuesBody = valuesBody.concat(",");
            }
        });
        return `INSERT INTO ${tableName} (${columns}) VALUES ${valuesBody} RETURNING 'SUCCESS'`;
    } catch (error) {
        return error.toISOString(); //KIV, to find a solution to handle the error better
    }
}

//Function to create an insert statement for a parent with one-to-many relationships 
//Attempts to create parent row first, then uses the new parent id as reference for the array of children
//If query fails at any point, data will be rolled back and nothing will be added
//A little bit unnecessarily complex, to review and adjust with future iterations
//Assumes name of the parent_ref to be the same from all children's perspective
//Ref: https://www.postgresql.org/docs/current/queries-with.html
export function createInsertWithChildrenStatement(
    parentTable: string,
    parentFields: object,
    childFields: object,
    parent_ref: string
) {
    try {
        let parentBody = `${createInsertStatement(
            parentTable,
            parentFields,
            "id"
        )}`;
        let childBody = "";
        let hasMultipleChild = false; //used to insert a comma after parent body
        Object.values(childFields).forEach((value, index) => {
            let singleChildPrefix = "";
            //Take first item to construct insert params
            let prefixValues = "";
            for (const key of Object.keys(value.data[0])) {
                if (key.toString() !== parent_ref) {
                prefixValues = prefixValues.concat(`${key},`);
                }
            }
            prefixValues = prefixValues.concat(`${parent_ref}`); //add parent reference column at the end of loop
            if (index < Object.values(childFields).length - 1) {
                //If not last index, assign alias
                singleChildPrefix = singleChildPrefix.concat(
                `child${index} AS (INSERT INTO ${value.tableName} (${prefixValues})`
                );
                //If not second last index, add a comma
                if (index < Object.values(childFields).length - 2) {
                    singleChildPrefix = singleChildPrefix.concat(",");
                }
                hasMultipleChild = true;
            } else {
                singleChildPrefix = singleChildPrefix.concat(
                `INSERT INTO ${value.tableName} (${prefixValues})`
                );
            }
            let singleChildSuffix = "";
            for (const child of value.data) {
                let oneChild = "";
                Object.entries(child).forEach((data) => {
                //[0] is key, [1] is value
                //exclude parent ref if found, add new returned id at the end of loop
                if (data[1]) {
                    oneChild = oneChild.concat(`'${data[1]}',`);
                } else {
                    oneChild = oneChild.concat(`NULL,`);
                }
                });
                singleChildSuffix = singleChildSuffix.concat(
                `(${oneChild} (SELECT id FROM parent)),`
                );
            }
            childBody = childBody.concat(
                `${singleChildPrefix} VALUES ${singleChildSuffix.substring(
                0,
                singleChildSuffix.length - 1
                )} `
            );
            if (index < Object.values(childFields).length - 1) {
                childBody = childBody.concat(")"); //closing tag for alias
            }
        });
        if (hasMultipleChild) {
        return `WITH parent AS (${parentBody}), ${childBody} RETURNING (SELECT id FROM parent)`;
        } else {
        return `WITH parent AS (${parentBody}) ${childBody} RETURNING (SELECT id FROM parent)`;
        }
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

export function createUpdateMultipleStatement(
    tableName: string,
    objectList: object[],
    conditions: string[]
) {
    try {
        //Use first object in list to build reference columns
        let colNameBody = "";
        let colName2Body = "";
        Object.keys(objectList[0]).forEach((key, index) => {
            colNameBody = colNameBody.concat(`${key} = table2.${key}`);
            colName2Body = colName2Body.concat(`${key}`);
            if (index < Object.keys(objectList[0]).length - 1) {
                colNameBody = colNameBody.concat(`, `);
                colName2Body = colName2Body.concat(`, `);
            }
        });
        let colValuesBody = "";
        objectList.forEach((object, listIndex) => {
            let singleColValue = "";
            Object.values(object).forEach((value, index) => {
                singleColValue = singleColValue.concat(`${value}`);
                if (index < Object.values(object).length - 1) {
                    singleColValue = singleColValue.concat(`, `);
                }
            });
            colValuesBody = colValuesBody.concat(`(${singleColValue})`);
            if (listIndex < objectList.length - 1) {
                colValuesBody = colValuesBody.concat(`,`);
            }
        });
        let conditionsBody = "";
        conditions.forEach((condition, index) => {
            conditionsBody = conditionsBody.concat(
                `table1.${condition} = table2.${condition}`
            );
            if (index < Object.keys(conditions).length - 1) {
                conditionsBody = conditionsBody.concat(`AND `);
            }
        });
        return `UPDATE ${tableName} AS table1 SET ${colNameBody} FROM (VALUES ${colValuesBody}) AS table2(${colName2Body}) WHERE ${conditionsBody} RETURNING 'SUCCESS'`;
    } catch (error) {
        return error.toISOString(); //KIV, to find a solution to handle the error better
    }
}

//Function to create an update statement for a parent and all children
export function createUpdateWithChildrenStatement(
    parentTable: string,
    parentFields: object,
    parentConditions: object,
    childFields: object
) {
    try {
        let parentBody = `${createUpdateStatement(
            parentTable,
            parentFields,
            parentConditions,
            "id"
        )}`;
        let childBody = "";
        let hasMultipleChild = false; //used to insert a comma after parent body
        let index = 0; //index is used to dynamically name the alias and ensure it is unique for the statement
        Object.values(childFields).forEach((value) => {
            let singleChild = "";
            const basicQuery = createInsertMultipleStatement(
                value.tableName,
                value.data
            );
            const singleInsertQuery = appendInsertOrUpdateStatement(
                value.data[0],
                basicQuery,
                "id"
            );
            if (index < Object.values(childFields).length - 1) {
                //If not last index, assign alias
                singleChild = singleChild.concat(
                    `child${index} AS (${singleInsertQuery})`
                );
                //If not second last index, add a comma
                if (index < Object.values(childFields).length - 2) {
                    singleChild = singleChild.concat(",");
                }
                hasMultipleChild = true;
            } else {
                singleChild = `${singleInsertQuery}`;
            }
            childBody = childBody.concat(singleChild);
            index += 1;
        });
        if (hasMultipleChild) {
            return `WITH parent AS (${parentBody}), ${childBody} RETURNING (SELECT id FROM parent)`;
        } else {
            return `WITH parent AS (${parentBody}) ${childBody} RETURNING (SELECT id FROM parent)`;
        }
    } catch (error) {
        return error.toISOString(); //KIV, to find a solution to handle the error better
    }
  }

//Function to create a generic delete statement based on conditions in one table
//Assumes conditions passed in as object with key/value pairs (e.g WHERE key1 = value1, key2 = value2)
//returnCol is optional to pass back new id or just confirmation of successful execution
export function createDeleteStatement(
    tableName: string,
    conditions: object,
    returnCol: string
    ) {
    try{
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
        return `DELETE FROM ${tableName} WHERE ${conditionBody} ${returnColBody}`;
    } catch (error) {
        return error.toISOString(); //KIV, to find a solution to handle the error better
    }
}

//Function to append a subquery to the end of statements to add or update rows
//If conflict (assumption is usually id) is found, will proceed to update instead of adding a new row
//Ref: https://stackoverflow.com/questions/36359440/postgresql-insert-on-conflict-update-upsert-use-all-excluded-values
export function appendInsertOrUpdateStatement(
    fields: object,
    insertQuery: string,
    conflict: string
) {
    try {
        let bodyStr = "";
        Object.entries(fields).forEach(([key, value], index) => {
            bodyStr = bodyStr.concat(`${key} = excluded.${key}`); //excluded here refers to the row that wasnt inserted because of the conflict
            if (index < Object.keys(fields).length - 1) {
                bodyStr = bodyStr.concat(", ");
            }
        });
        return `${insertQuery} ON CONFLICT(${conflict}) DO UPDATE SET ${bodyStr}`;
    } catch (error) {
        return error.toISOString(); //KIV, to find a solution to handle the error better
    }
}