const fs = require('fs')
const path = require('path')

const db = require('../helpers/database')

module.exports = class Consumers{
    constructor(firstname, lastname, phone_number,country,city,zip) {
        this.id = null
        this.firstname = firstname
        this.lastname = lastname
        this.phone_number = phone_number
        this.country = country
        this.city = city
        this.zip = zip
    }

    static async addOrderUser(user){
        return await db.execute('INSERT INTO own_work.consumers (firstname, lastname, phone_number, country, city, zip) VALUE(?,?,?,?,?,?)', 
        [
            user.firstname,
            user.lastname,
            user.phone_number, 
            user.country, 
            user.city, 
            user.zip
        ])
        
    }

    setId(id) {
        this.id = id
        return this.id
    }

    setFirstname(firstname) {
        this.firstname = firstname
    }

    setLastname(lastname) {
        this.lastname = lastname
    }

    async save() {
        const result = await db.execute('INSERT INTO own_work.consumers (firstname, lastname, phone_number, country, city, zip) VALUE(?,?,?,?,?,?)', 
        [
            this.firstname,
            this.lastname,
            this.phone_number,
            this.country,
            this.city,
            this.zip
        ])

        if (result[0]) {
            this.id = result[0].insertId
        }
    }

    async detectNumber() {
        const result = await db.execute('SELECT * FROM own_work.consumers WHERE phone_number = ?',[
            this.phone_number
        ]) 
        console.log(result[0][0])
        if(result[0]){
            return result[0][0]
        }

        return null
    }

    static async doesExist(firstname, lastname, phoneNumber) {
        const result = await db.execute(
            'SELECT * FROM own_work.consumers WHERE firstname = ? AND lastname = ? AND phone_number = ?',
            [firstname, lastname, phoneNumber]
        ); 
    
        if (result[0][0]?.id) {
            const consumer = new Consumers(
                result[0][0].firstname, 
                result[0][0].lastname, 
                result[0][0].phone_number,
                result[0][0].country,
                result[0][0].city,
                result[0][0].zip
            );
            consumer.setId(result[0][0].id);
            return consumer;
        }
        
        return null;
    }
    

    static async getConsumer(id) {
        const result = await db.execute('SELECT * FROM own_work.consumers WHERE id = ?',[
            id
        ]) 

        if(result[0]){
            return result[0]
        }

        return null
        //console.log(result)
        
    }
}

