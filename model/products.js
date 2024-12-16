const fs = require('fs')
const path = require('path')
const { query } = require('../helpers/database')

const db = require('../helpers/database')

module.exports = class Product {
    constructor( ids, name, typeId, price, description, image,brand, featured) {
        this.ids = ids ? ids : null
        this.name = name
        this.typeId = typeId
        this.price = price
        this.description = description
        this.image = image
        this.brand = brand
        this.featured = featured
        

        //console.log(this.name)
    }

    async save() {
        const result = await db.execute('INSERT INTO own_work.products (name,price,image,description, type_id, brand_id, featured) VALUES (?,?,?,?,?,?,?)',
        [
            this.name,
            this.price, 
            this.image,
            this.description,
            this.typeId,
            this.brand,
            this.featured
        ]   
        )

        if(result[0]){
            return result[0]
        } 

        return null
    }

    static async deleteProduct(productId) {
        //console.log('productId',productId)
    if (!productId || !(+productId) || +productId < 1) {
        
        throw new Error('Invalid product Id')
        
    }
    const result = await db.execute('DELETE FROM own_work.products WHERE id=?', [productId])
    if(result[0]){
        return result[0]
    }

    return null
    }

    static async deleteFields(fieldsId) {
        if (!fieldsId?.length) {
            //console.log('qara, hatoying bor: ', +fieldsId )
            throw new Error('Invalid product Id')
            
        }
    
        
        const ids = fieldsId.join()
        const sql = `DELETE FROM own_work.products_fields WHERE field_id IN (${ids})`
        //console.log(sql)
        const deleteFieldsFunc = await db.execute(sql)
    
        if(deleteFieldsFunc[0]){
            return deleteFieldsFunc[0]
        }
    
        return null
    }
    
    static async findById(productId) {
        if (!productId || !(+productId) || +productId < 1) {
            console.log(`Error: ${productId}`)
            throw new Error('Invalid product Id')
        }
        console.log('before findById db exec')
        const result = await db.execute('SELECT p.*,t.type FROM own_work.products p JOIN own_work.types t ON p.type_id=t.id WHERE p.id=?', [productId])
        console.log('after findById bd exec')
        if (result[0]) {
            return result[0]
        }

        return null
    }

    /**
     * [
     * {
     *  name: 'name',
     *  value: 'cake',
     *  criteria: 'LIKE'
     * },
     * {
     *  name: 'type_id',
     *  value: '5',
     *  criteria: '='
     * }
     * ]
     */
    static async fetchAll( params, orderBy = '', orderDirection = '', index, fields = [], group = []) {

     
        const queryFields = fields?.length && fields[0] !== undefined ? fields.join(',') : '*'
        let sqlQuery = `SELECT ${queryFields} FROM own_work.products`
        
        if(queryFields === 'id'){
            sqlQuery = `SELECT count(${queryFields}) as used FROM own_work.products`
            
        } 
        
        

        
/**/    
        
        console.log('ozgacha', orderBy, orderDirection, index, fields, group)
        
        let queryCondition = ''
        const queryConditionValues = []
        if (params?.length) {
            const sqlParams = params?.map((param) => {
                let columnValue = param.value
                let conditionValue = '?'
                if (param.criteria === 'LIKE') {
                    columnValue = `%${param.value}%`
                    queryConditionValues.push(columnValue)
                } else if (param.criteria === 'IN') {
                    columnValue = param.value //.map((item) => `${item}`)
                    conditionValue = '(' + param.value.map((item) => '?').join(',') + ')'
                    console.log('brands',param.value)
                    queryConditionValues.push(...columnValue)
                } else if(param.criteria === '<='){
                    conditionValue = param.value
                } else if(param.criteria === '>='){
                    conditionValue =  param.value
                } else {
                    queryConditionValues.push(columnValue)
                }
                //console.log('PARAMS',`${param.name} ${param.criteria} ${conditionValue}`)
                return `${param.name} ${param.criteria} ${conditionValue}`
            })

            queryCondition = sqlParams.join(' AND ')
            sqlQuery += ` WHERE ${queryCondition}`
            //console.log('PARAMS', sqlQuery)
        }

        if (orderBy?.length !== 0 && queryFields !== 'brand_id' && queryFields !== 'type_id') {
            
            const orderByDir = orderDirection === 'ASC' ? orderDirection : 'DESC'
            sqlQuery += ` ORDER BY ${orderBy} ${orderByDir}`
            console.log('query', orderBy) 
        }

        if(group?.length && group[0] !== undefined){
            const queryGroups = group?.length ? ' group by ' + group.join(',') : ''
            sqlQuery += queryGroups
        }
        

        if(+index >= 0) {
            sqlQuery += ` LIMIT  ${index}, 5`
        }

        

        console.log('PRODUCTS QUERY', sqlQuery)
        const result = await db.execute(sqlQuery, queryConditionValues)  
        //console.log('PRODUCTS QUERY', sqlQuery)
        if(result[0]){
            return result[0]
        }
        return null
    }

    static async loadTypes(){
        const result = await db.execute('select *, (SELECT count(*) FROM own_work.products WHERE type_id=t.id) as used from own_work.types t')
        //console.log(result)
    if(result[0]){
        return result[0]
    }
    return null

    }

    static async getType(typeId){
        if (!typeId || !(+typeId) || +typeId < 1) {
            throw new Error('Invalid product Id')
        }
        const type = await db.execute('SELECT * FROM  own_work.types t WHERE t.id=?', [typeId])

        if(type[0][0]){
           return type[0][0]
        }

        return null
    }

    static async searchProduct(name, orderBy = '', orderDirection = '', req){
        // WHERE name LIKE ?
        let sqlQuery = 'SELECT * FROM own_work.products'
    
        if(name && typeof name === 'string'){
            sqlQuery += ` WHERE name LIKE ?`
            console.log('it is not name')
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
        return null
    }

    static async updateType(productType){
        const data = `UPDATE own_work.types SET type= '${productType.name}', parent_type=${productType.parent_type} WHERE id=${productType.id}`
        
        const value = await db.execute(data)

            console.log('value',productType)
        if(value[0]){
            return value[0]
        }

        return null
        /*[
            productType.type,
            productType.id,
        ])*/
    }

    static async getParentTypes(parent_type_ids){
        const sql = `SELECT * FROM own_work.types WHERE parent_type IN (${parent_type_ids})`
        const data = await db.execute(sql)
        console.log(sql)
       // console.log(data)
        if(data){
            return data[0]
        }
    }

    static async updateProduct(product) {
        console.log(product)
        const result = await db.execute(
            'UPDATE own_work.products SET name=?, type_id=?, price=?, image=?, description=?, brand_id=?, featured=? WHERE id=?',
            [
                product.name || null,
                product.type_id || null,
                product.price || null,
                product.image || null,
                product.description || null,
                product.brand_id || null,
                product.featured || null,
                product.id
            ]
        );
    
        if (result[0]) {
            return result[0];
        }
        return null;
    }

    static async getProductFields(product_id) {
        if (!(+product_id) || +product_id < 1) {
            throw new Error('Invalid product Id')
        }
    
        const resultFields = await db.execute('SELECT * FROM own_work.products_fields WHERE product_id=?', [product_id])
        if(resultFields[0]){
            return resultFields[0]
        }
    
        return null
    }
    
    static async updateFields(field_id, field, value) {
        return await db.execute(`UPDATE own_work.products_fields SET field_name=?, field_value=? WHERE field_id=?`,
            [field, value, +field_id])
    }

    static async addProductFields (product_id, fields, values) {
        if (typeof fields === 'string') {
            const result = await db.execute('INSERT INTO own_work.products_fields (field_name,field_value,product_id) VALUES (?,?,?)',
            [fields, values, +product_id])
            if(result[0]){
                return result[0]
            }
            return null
        }
        console.log(fields, values)
        fields.forEach( async (field, index) => {
            console.log(field, values[index], product_id)
            const result2 = await db.execute('INSERT INTO own_work.products_fields (field_name,field_value,product_id) VALUES (?,?,?)',
            [field, values[index], +product_id])
            console.log('bu yangi qiymat 2',result2[0])
            if(result2[0]){
                console.log('bu yangi qiymat 2',result2[0])
                return result2[0]
            }
            return null
        })
        
    }

    static async loadProducts (orderingColumn , orderingDirection) {
        /*const filename = path.join(__dirname, '..', 'product.json')
        try {
            const data = fs.readFileSync(filename, 'utf8')
            return JSON.parse(data)
        } catch(error) {
            console.log(error)
        }
        return []*/
    
        let sqlQuery = 'SELECT * FROM own_work.products'
    
        if (orderingColumn) {
            const orderByDir = orderingDirection === 'ASC' ? orderingDirection : 'DESC'
            sqlQuery += ` ORDER BY ${orderingColumn} ${orderByDir}`
        }
    
        const result = await db.execute(sqlQuery)
        console.log(sqlQuery)
        if(result[0]){
            return result[0]
        }
        return null
    }

    static async getProduct(productId) {
        if (!productId || !(+productId) || +productId < 1) {
            console.log(`Error: ${productId}`)
            throw new Error('Invalid product Id')
        }
        console.log('before findById db exec')
        const result = await db.execute('SELECT p.*,t.type FROM own_work.products p JOIN own_work.types t ON p.type_id=t.id WHERE p.id=?', [productId])
        console.log('after findById bd exec')
        //console.log(result)
        if (result[0][0]) {
            return result[0][0]
        }
    
        return null
    }

    static async getProductFields(product_id) {
        if (!(+product_id) || +product_id < 1) {
            throw new Error('Invalid product Id')
        }
    
        const resultFields = await db.execute('SELECT * FROM own_work.products_fields WHERE product_id=?', [product_id])
        if(resultFields[0]){
            return resultFields[0]
        }
    
        return null
    }

    static async usedType(typeId){
        const val = await db.execute('SELECT count(*) as count FROM own_work.products WHERE type_id=?', [typeId])
        if(val[0]){  
            return val[0]
        }

        return null
    }

    static async usedBrand(brandId){
        const val = await db.execute('SELECT count(*) as count FROM own_work.products WHERE brand_id=?', [brandId])
        if(val[0]){  
            return val[0]
        }

        return null
    }

    static async deleteType(typeid){
        console.log('productId',typeid)
        if (!typeid || !(+typeid) || +typeid < 1) {
            
            throw new Error('Invalid product Id')
            
        }
        const qiymat = await db.execute('DELETE FROM own_work.types WHERE id=?', [typeid])

        if(qiymat[0]){
            return qiymat[0]
        }

        return null
    }

    static async addProductFields (product_id, fields, values) {
        if (typeof fields === 'string') {
            const result = await db.execute('INSERT INTO own_work.products_fields (field_name,field_value,product_id) VALUES (?,?,?)',
            [fields, values, +product_id])
            if(result[0]){
                //console.log('bu yangi qiymat',result[0])
                return result[0]
            }
            return null
        }
        console.log(fields, values)
        fields.forEach( async (field, index) => {
            console.log(field, values[index], product_id)
            const result2 = await db.execute('INSERT INTO own_work.products_fields (field_name,field_value,product_id) VALUES (?,?,?)',
            [field, values[index], +product_id])
            //console.log('bu yangi qiymat',result2[0])
            if(result2[0]){
                //console.log('bu yangi qiymat',result2[0])
                return result2[0]
            }
            return null
        })
        
    }
    
    static async addType (type) {
        return await db.execute('INSERT INTO own_work.types (type, parent_type) VALUES (?,?)',
        [
            type.name,
            type.parent_type
        ])
    }

    static getSortCriteria(sortBy='') {
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


    static async getById(ids){
    
        const proIds = ids//.join()
        const sql = `SELECT * FROM own_work.products p WHERE p.id IN (${proIds})`
        //console.log(sql)
        const result = await db.execute(sql)
    
        if(result[0]){
            return result[0]
        }
    
        return null
    }

    

    static async getTypes(typeId){

        if(!typeId?.length){
            return null
        }
        
        const sql = `SELECT * FROM own_work.types t WHERE t.id IN (${typeId})`
        //console.log(sql)
        const result = await db.execute(sql)
        if(result[0]){
            return result[0]
        }
         return null
    }
    


    static async getProductsByType(massive, orderDirection='', orderingColumn=''){
        let sql = `SELECT * FROM own_work.products p WHERE p.type_id IN (${massive})`
        //console.log(sql)

         if(orderDirection){
            sql += ` ORDER BY ${orderDirection} ${orderingColumn}`
         }   

         
        const result = await db.execute(sql)
        const massiveProducts = []
        console.log('sql',sql)
        if(result[0]){
            return result[0]
        }
        return null
    }

    static async getTypeByName(type_name) {
        const qiymat = await db.execute('SELECT * FROM own_work.types WHERE type = ?',[type_name])
        if(qiymat[0]){
            return qiymat[0]
        }
    
        return null
    }

    static async insertViewValue(number, id){
        const qiymat = await db.execute('UPDATE own_work.products SET seen = ? WHERE id = ?;', 
        [number, id])
        if(qiymat[0]){
            return qiymat[0]
        }
    
        return null
    }

    static async loadBrands() {
    
        let sqlQuery = 'select *, (SELECT count(*) FROM own_work.products WHERE brand_id=b.id) as used from own_work.brands b'
        
    
        const result = await db.execute(sqlQuery)
        //console.log(result)
        if(result[0]){
            return result[0]
        }
        return null
    }

    static async deleteBrand(brandId) {
        console.log('brandId',brandId)
    if (!brandId || !(+brandId) || +brandId < 1) {
        
        throw new Error('Invalid product Id')
        
    }
    const result = await db.execute('DELETE FROM own_work.brands WHERE id=?', [brandId])
    if(result[0]){
        return result[0]
    }

    return null
    }

    static async addBrand(brand){
        console.log('brand',brand)
        return await db.execute('INSERT INTO own_work.brands (brands) VALUE (?)',
        [
            brand.name
        ])
    }
    
    static async getBrand(brandId) {
        if(!brandId?.length){
            return null
        }

        const val = `SELECT * FROM own_work.brands WHERE id IN(${brandId})`
        const qiymat = await db.execute(val)
       // console.log(val)
        if(qiymat[0]){
            return qiymat[0]
        }
    
        return null
    }

    static async updateBrand(brands){
        const data = `UPDATE own_work.brands SET brands = '${brands.name}' WHERE id=${brands.id}`
        
        const value = await db.execute(data)

           // console.log(data)
        if(value[0][0]){
            return value[0][0]
        }
    }

    static async getProductsByBrandId(massive, brandArray, prices,orderingColumn, orderingDirection){
        console.log(brandArray, prices)
        let sqlQuery = `SELECT * FROM own_work.products p WHERE p.type_id IN (${massive})`

        /*if(brandArray.length > 0){
             sqlQuery += ` AND brand_id IN (${brandArray})`
        }*/

        if(prices.price1 && prices.price2){
                console.log('bor')
                sqlQuery += ` AND price >= ${prices.price1} AND price <= ${prices.price2}`
        } else if(prices.price1){
                console.log('bor1')
                sqlQuery += ` AND price >= ${prices.price1}`
           
        } else if(prices.price2){
                console.log('bor2')
                sqlQuery += ` AND price <= ${prices.price2}`
        } 
    
        

        if (orderingColumn) {
            const orderByDir = orderingDirection === 'ASC' ? orderingDirection : 'DESC'
            sqlQuery += ` ORDER BY ${orderingColumn} ${orderByDir}`
        }
        //console.log('sqlquery', sqlQuery)
        if(typeof sqlQuery === 'string'){
            const result = await db.execute(sqlQuery)
            
            if(result[0]){
                return result[0]
            }
        }
        return null
        
    }

    static async getProductsByPrice(prices){
        let data = `SELECT * FROM own_work.products`
        if(prices.price1 && prices.price2){
            data += ` WHERE price >= ${prices.price1} AND price <= ${prices.price2}`
        } else if(prices.price1){ 
            data += ` WHERE price >= ${prices.price1}`
        } else if(prices.price2){
            data += ` WHERE price <= ${prices.price2}`
        } 
        const value = await db.execute(data)

            console.log(data)
        if(value[0]){
            return value[0]
        }
    }

    static async getUsed(type_id){
        const result = await db.execute('SELECT t.id, t.type, count(*) as used FROM own_work.products p JOIN own_work.types t ON p.type_id=t.id WHERE type_id = ? GROUP BY p.type_id',[type_id])
        console.log(`SELECT t.id, t.type, count(*) as used FROM products p JOIN types t ON p.type_id=t.id WHERE type_id = ${type_id} GROUP BY p.type_id`)
        if(result[0]){
            return result[0]
        }

        return null
    }
}
