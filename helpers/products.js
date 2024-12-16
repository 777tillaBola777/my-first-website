const fs = require('fs')
const path = require('path')

const db = require('../helpers/database')

const loadProducts = async (orderingColumn , orderingDirection) => {
    /*const filename = path.join(__dirname, '..', 'product.json')
    try {
        const data = fs.readFileSync(filename, 'utf8')
        return JSON.parse(data)
    } catch(error) {
        console.log(error)
    }
    return []*/

    let sqlQuery = 'SELECT * FROM pro.products'

    if (orderingColumn) {
        const orderByDir = orderingDirection === 'ASC' ? orderingDirection : 'DESC'
        sqlQuery += ` ORDER BY ${orderingColumn} ${orderByDir}`
    }

    const result = await db.execute(sqlQuery)

    if(result[0]){
        return result[0]
    }
    return null
}

const saveProducts = (allProducts) => {
    const filename = path.join(__dirname, '..', 'product.json')
    try {
        fs.writeFileSync(filename, JSON.stringify(allProducts))
    } catch(error) {
        console.log(error)
    }
}

const addProduct = (product) => {
    return db.execute('INSERT INTO products (name,price,image,description, type_id, brand) VALUES (?,?,?,?,?,?)',
    [
        product.name,
        product.price, 
        product.image,
        product.description,
        product.type_id,
        product.brand
    ])
}

const addProductFields = async (product_id, fields, values) => {
    if (typeof fields === 'string') {
        const result = await db.execute('INSERT INTO products_fields (field_name,field_value,product_id) VALUES (?,?,?)',
        [fields, values, +product_id])
        if(result[0]){
            return result[0]
        }
        return null
    }
    console.log(fields, values)
    fields.forEach( async (field, index) => {
        console.log(field, values[index], product_id)
        const result2 = await db.execute('INSERT INTO products_fields (field_name,field_value,product_id) VALUES (?,?,?)',
        [field, values[index], +product_id])
        //console.log('bu yangi qiymat',result2[0])
        if(result2[0]){
            //console.log('bu yangi qiymat',result2[0])
            return result2[0]
        }
        return null
    })
    
}
/*
async function loadTypes(){
    const result = await db.execute('select *, (SELECT count(*) FROM products WHERE type_id=t.id) as used from types t')
    
    if(result[0]){
        return result[0]
    }
    return null
}*/
const updateProduct = async (product) => {
    const result = await db.execute('UPDATE products SET name=?,type_id=?,price=?,image=?,description=?,brand=? WHERE id=?',
        [
            product.name,
            product.type_id,
            product.price,
            product.image,
            product.description,
            product.brand,
            product.id
        ])
        if(result[0]){
            return result[0]
        }
        return null
}

const updateFields = async (field_id, field, value) => {
    return await db.execute(`UPDATE products_fields SET field_name=?, field_value=? WHERE field_id=?`,
        [field, value, +field_id])
}
const deleteProduct = (productId) => {
    console.log('productId',productId)
    if (!productId || !(+productId) || +productId < 1) {
        
        throw new Error('Invalid product Id')
        
    }
    return db.execute('DELETE FROM products WHERE id=?', [productId])
}

const deleteField = async (fieldId) => {
    console.log('productId', fieldId)
    if (!fieldId || !(+fieldId) || +fieldId < 1) {
        
        throw new Error('Invalid product Id')
        
    }
    const deleteFieldFunc = await db.execute('DELETE FROM products_fields WHERE field_id=?', [fieldId])
    if(deleteFieldFunc[0]){
        return deleteFieldFunc[0]
    }

    return null
}

const deleteFields = async (fieldsId) => {
    if (!fieldsId?.length) {
        console.log('qara, hatoying bor: ', +fieldsId )
        throw new Error('Invalid product Id')
        
    }

    
    const ids = fieldsId.join()
    const sql = `DELETE FROM products_fields WHERE field_id IN (${ids})`
    console.log(sql)
    const deleteFieldsFunc = await db.execute(sql)

    if(deleteFieldsFunc[0]){
        return deleteFieldsFunc[0]
    }

    return null
}



async function getProduct(productId) {
    if (!productId || !(+productId) || +productId < 1) {
        console.log(`Error: ${productId}`)
        throw new Error('Invalid product Id')
    }
    console.log('before findById db exec')
    const result = await db.execute('SELECT p.*,t.type FROM products p JOIN types t ON p.type_id=t.id WHERE p.id=?', [productId])
    console.log('after findById bd exec')
    console.log(result)
    if (result[0][0]) {
        return result[0][0]
    }

    return null
}

function getType(typeId) {
    if (!typeId || !(+typeId) || +typeId < 1) {
        throw new Error('Invalid product Id')
        
    }
    return db.execute('SELECT * FROM  types t WHERE t.id=?', [typeId])
}

const updateType = (productType) => {

    return db.execute('UPDATE types SET type=? WHERE id=?',
        [
            productType.type,
            productType.id,
        ])
}

const addType = (type) => {
    return db.execute('INSERT INTO types (type) VALUES (?)',
    [
        type.name
    ])
}

const deleteType = (typeid) => {
    console.log('productId',typeid)
    if (!typeid || !(+typeid) || +typeid < 1) {
        
        throw new Error('Invalid product Id')
        
    }
    return db.execute('DELETE FROM types WHERE id=?', [typeid])
}

async function getProductFields(product_id) {
    if (!(+product_id) || +product_id < 1) {
        throw new Error('Invalid product Id')
    }

    const resultFields = await db.execute('SELECT * FROM products_fields WHERE product_id=?', [product_id])
    if(resultFields[0]){
        return resultFields[0]
    }

    return null
}

async function loadTypes(){
    const result = await db.execute('select *, (SELECT count(*) FROM products WHERE type_id=t.id) as used from types t')
    
    if(result[0]){
        return result[0]
    }
    return null
}

function usedType(typeId){
    return db.execute('SELECT count(*) as count FROM products WHERE type_id=?', [typeId])
}

function loadProduct(name){
    
    return db.execute(`SELECT * FROM products WHERE name=?`, [name])
}

async function searchProduct(name, orderBy = '', orderDirection = ''){
    // WHERE name LIKE ?
    let sqlQuery = 'SELECT * FROM products'

    if(name && typeof name === 'string'){
        sqlQuery += ` WHERE name LIKE ?`
    } else {
        console.log('it is not name')
    }

    if (orderBy) {
        const orderByDir = orderDirection === 'ASC' ? orderDirection : 'DESC'
        sqlQuery += ` ORDER BY ${orderBy} ${orderByDir}`
    }

    console.log('sql', sqlQuery)

    const qiymat = await db.execute(sqlQuery, [`%${name}%`])

    if(qiymat[0][0]){
        return qiymat[0][0]
    }
}

function getSortCriteria(sortBy='') {
    if (typeof sortBy === 'string') {
        console.log('hello', typeof sortBy, sortBy)
    }
        const items = sortBy.split(' ')
        console.log('items', typeof items, items)
        let direction = 'DESC'
        if (items.length > 1 && items[1] === 'low') {
            direction = 'ASC'
            console.log('1 dan katta va 2-qiymat low')
        }

        return {
            sortField: items.length ? items[0] : '',
            sortDirection: direction
        }
}

async function getChosenProduct(productId){
    const qiymat = db.execute(`SELECT * FROM pro.products where id=?;`, [productId])
    if(qiymat[0]){
        return qiymat[0]
    }

    return null
}

function getTypefromTypes(types, typeId) {
    let result = ''
    types.forEach((type) => {
        //console.log(+type.id , +typeId)
        if (+type.id === +typeId && +typeId > 0) {
            result = type 
        }
    })
    //console.log('getting type', result)
    return result
}


function getTypefromType(types, typeId) {
    let result = null
    types.forEach((type) => {
        //console.log(+type.id , +typeId)
        if (+type.id === +typeId && +typeId > 0) {
            result = type 
        }
    })
    //console.log('getting type', result)
    return result
}

/**
 * This function searches for type ancentors
 * @param {Array} types 
 * @param {number} typeId 
 * @param {Array} ancentors 
 */
function getTypeAncentors(types, typeId, ancentors) {
    let parentType = null
    types.forEach((type) => {
        if (+type.id === +typeId) {
            parentType = getTypefromTypes(types, type.parent_type) 
        }
        console.log('Parent types',parentType)
    })
    if (parentType?.id) {
        ancentors.push(parentType)
        getTypeAncentors(types, +parentType.id, ancentors)
    }
}

function getTypeChildren(types, typeId, ancentors) {
    let parentType = []
    
    types.forEach((type) => {
        //console.log('alo', +type.parent_type === +typeId)
        //console.log(+type.parent_type , +typeId)
        if (+type.parent_type === +typeId) {
            const selectedType = getTypefromType(types, +type.id)
            parentType.push(selectedType)
        }
        
    })
    //console.log('type pros',parentType)

    parentType.forEach((item) => {
        //console.log('not null',+item?.id) 
        if (+item?.id > 0) {
            ancentors.push(item)
            getTypeChildren(types, +item?.id, ancentors)
        }
        //console.log('not null',ancentors) 
    })
    
}

async function addBrand(brand){
    const val = `INSERT INTO pro.brands (brands) VALUES (${brand});`
    const qiymat = await db.execute(val)
    if(qiymat[0]){
        return qiymat[0]
    }

    return null
}


module.exports = {
    loadProducts,
    saveProducts,
    addProduct,
    updateProduct,
    getProduct,
    deleteProduct,
    addProductFields,
    getProductFields,
    updateFields,
    deleteFields,
    deleteField,
    loadTypes,
    searchProduct,
    loadProduct,
    getSortCriteria,
    getType,
    updateType,
    addType,
    deleteType,
    usedType,
    getChosenProduct,
    getTypeAncentors,
    getTypefromTypes,
    getTypeChildren,
    addBrand
}