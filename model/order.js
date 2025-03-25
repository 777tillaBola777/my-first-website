const fs = require('fs')
const path = require('path')

const db = require('../helpers/database')
const datetime = require('../helpers/datetime')

module.exports = class orders {

    constructor(  ids, payment_type, consumer_id,taking_form, status, id) {
        this.ids = ids
        this.payment_type = payment_type
        this.consumer_id = consumer_id
        this.taking_form = taking_form
        this.status = status
        this.products = []
        this.id = id
    }

    async save() {
        const result = await db.execute('INSERT INTO own_work.orders (customer_id,taking_form, payment_type,status) VALUES(?, ?, ?,?)', [
            this.consumer_id,
            this.taking_form,
            this.payment_type,
            this.status 
        ])

       // console.log(`INSERT INTO pro.orders (customer_id,taking_form, payment_type,status) VALUES(${this.consumer_id,this.taking_form,this.payment_type,this.status })`)

        if (result[0]) {
            this.id = result[0].insertId
        }
        return result[0]
        
    }

    setId(id) {
        this.id = id
    }

    static async get(id) {
        const result = await db.execute('SELECT * FROM own_work.orders where id=?', [id])
        //console.log('result',result)
        if (result[0]) {
            const order = new orders(
                result[0][0].customer_id,
                result[0][0].payment_type,
                result[0][0].taking_form,
                result[0][0].status
            )
            order.setId(result[0][0].id)
            return order
        }
    }

    async addProduct(product, count) {
        if (!this.id) {
            throw 'Order is not saved'
        }
        return await db.execute('INSERT INTO own_work.ordered_products (name,price,image,description, type_id, created, count,product_id, order_id) VALUES (?,?,?,?,?,?,?,?,?)', [  // Use this.id here, which is the correct order reference
            product.name,
            product.price,
            product.image,
            product.description,
            product.type_id,
            product.created,
            count,
            product.id,
            this.id
        ])
    }

    async showProduct(product, count) {
        return await db.execute('INSERT INTO own_work.ordered_products (order_id,name,price,image,description, type_id, created, count,product_id) VALUES (?,?,?,?,?,?,?,?,?)', [
            this.consumer_id,
            product.name,
            product.price,
            product.image,
            product.description, 
            product.type_id,
            product.created,
            count,
            product.id
        ])
    }

    static async addProductInformation(taking_form,payment_type){
        return await db.execute('INSERT INTO own_work.orders (taking_form, payment_type,status) VALUES(?, ?, ?)', [
            taking_form,
            payment_type,
            status
        ])
    }
    
    static async addOrderedProduct(id, product, count){
        return await db.execute('INSERT INTO own_work.ordered_products (order_id,name,price,image,description, type_id, created, count) VALUES (?,?,?,?,?,?,?,?)', [
            id,
            product.name,
            product.price,
            product.image,
            product.description, 
            product.type_id,
            product.created,
            count
        ])
    }
    
    async getOrderedProducts() {
        console.log('new success!')
        const result = await db.execute('SELECT * FROM own_work.ordered_products WHERE order_id=?', [this.ids])
        if(result[0]){
            //console.log(result[0])
            return result[0]
        }
        return null
    }

setCreated(created) {
    this.created = created
    this.createdHumanReadable = datetime.getHumanReadibleDateTime(created)
    return this.createdHumanReadable
}

    static async getOnlyOrder(id) {
        //console.log('new success!')
        const result = await db.execute('SELECT op.order_id,op.name,op.price,op.image,op.description,op.type_id,op.count,op.product_id,o.* FROM own_work.ordered_products op JOIN own_work.orders o ON op.order_id=o.id WHERE op.order_id=?', [id])
        console.log(result[0])
        if(result[0]){
            //console.log(result[0])
           return result[0]
        }
        return null
    }

    setCount(count) {
        this.count = count
    }

    static async getOrders(massive) {
        const massiveValue = []
        let sqlQuery = 'SELECT o.*, (select sum(count) from own_work.ordered_products where order_id=o.id) as count FROM own_work.orders o '
        
        if(massive[0] !== undefined && massive[0].value !== '' || massive[1].value !== '' || massive[2].value !== ''){
            
            sqlQuery += ' WHERE '
            
            massive.forEach((item,index) => {
            
                console.log(item)
            
                if(item.value !== ''){
            
                    massiveValue.push(`${item.name} = '${item.value}'`)
            
                }
            
            })
            
            let text = massiveValue.join(' and ')
            
            sqlQuery += text
        }
        
        sqlQuery += ` ORDER BY created DESC`
        const result = await db.execute(sqlQuery)  
        
        if(result[0]){
            let order = []
            result[0].forEach((item, index) => {
                if(item?.id){
                    order.push(new orders(
                        null,
                        item.payment_type,
                        item.customer_id,
                        item.taking_form,
                        item.status
                    )) 
                    order[index].setCreated(item.created)
                    order[index].setId(item?.id)
                    order[index].setCount(item?.count)
                } 
            });
            return order
        }
        return null
    }

    static async updateStatus(status, id) {
        //console.log('new success!')
        const result = await db.execute('UPDATE own_work.orders SET status = ? WHERE id = ?', 
        [status, id])
        console.log(result)
        if(result[0]){
            return result[0]
        }
        return null
    }

    static async getOrderByName(payName, takeType, status){
        let sqlQuery = 'SELECT * FROM own_work.orders'
        const payType = payName ? true : false
        const takingType = takeType ? true : false
        const orderStatus = status ? true : false 

        if(payType && takingType && orderStatus){
            sqlQuery += ` WHERE payment_type = '${payName}' and taking_form = '${takeType}' and status = '${status}' `
        } else if(payType && takingType){
            sqlQuery += ` WHERE payment_type = '${payName}' and taking_form = '${takeType}'`
        } else if(payType && orderStatus){
            sqlQuery += ` WHERE payment_type = '${payName}'  and status = '${status}'`
        } else if(takingType && orderStatus){
            sqlQuery += ` WHERE taking_form = '${takeType}'  and status = '${status}'`
        } else if(payType){
            sqlQuery += ` WHERE payment_type = '${payName}'`
        } else if(takingType){
            sqlQuery += ` WHERE taking_form = '${takeType}'`
        } else if(orderStatus){
            sqlQuery += ` WHERE status = '${status}'`
        }
        
    
        const result = await db.execute(sqlQuery)
        if(result[0]){
            return result[0]
        }
        return null
    }
    
}

