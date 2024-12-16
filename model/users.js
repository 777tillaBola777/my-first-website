const db = require('../helpers/database')
const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const crypto = require("crypto")
const MySQLStore = require("express-mysql-session")(session)

module.exports = class Users{
    constructor(username, password, firstname, lastname,address,phone_number, role, id,country){
            this.username = username
            this.password = password
            this.firstname = firstname
            this.lastname = lastname
            this.address = address
            this.phone_number = phone_number
            this.role = role
            this.id = id
            this.country = country
    }

    saveUser() {
        return db.execute(`SELECT users.*,roles.role 
            FROM users
            INNER JOIN roles
            ON users.role_id=roles.id
            WHERE users.login=? AND users.password=sha(?)`,
        [
            this.login, 
            this.password
        ])
    }

    setId(id) {
        this.id = id
    }

    setUsername(username) {
        this.username = username
    }

    setFirstname(firstname) {
        this.firstname = firstname
    }

    setLastname(lastname) {
        this.lastname = lastname
    }

    setAddress(address) {
        console.log(address)
        this.address = address
        
    }


    setPhoneNumber(phone_number) {
        this.phone_number = phone_number
    }

  


    save() {
        if (!this.id || !(+this.id) || +this.id < 1) {
            throw new Error('Invalid product Id', this.id)
        }
        console.log('hammas togri')
        return db.execute('UPDATE own_work.users SET username=? WHERE id=?',
            [this.username ,this.id])
    }

    static async authenticate (login, password) {
        const qiymat =  await db.execute(`SELECT users.*,roles.role 
            FROM users
            INNER JOIN roles
            ON users.role_id=roles.id
            WHERE users.login=? AND users.password=sha(?)`,
        [
            login, 
            password
        ])

        if(qiymat[0]){
            return qiymat[0]
        }

        return null
    }


     addUserFeatures() {
        console.log('every details: ', this.address,
        this.phone_number,
        this.payment_type,
        this.firstname,
        this.lastname,
        this.id)

        return db.execute(`INSERT INTO own_work.user_features (address,phone_number,firstname,lastname,user_id, country) VALUE (?,?,?,?,?,?)`,
        [
            this.address,
            this.phone_number,
            this.firstname,
            this.lastname,
            this.id, 
            this.country
        ])
    }

    static async authenticateUser(user_id) {
        const conditionValue =  `SELECT users.id,users.isAdmin,users.username, user_features.* 
        FROM own_work.users
        INNER JOIN own_work.user_features
        ON users.id=user_features.user_id
        WHERE users.id IN (${user_id})`



        const qiymat = await db.execute(conditionValue)

        if(qiymat[0]){
            return qiymat[0]
        }

        return null
    }
  /*  static insertUser() {
        return db.execute(`INSERT INTO users (login, password, role_id, firstname, lastname) 
        VALUES(?,?,?,?,?)`,
        [
            this.login, 
            this.password, 
            this.role_id, 
            this.firstname, 
            this.lastname
        ])
    }*/

      

    
      
    
    static genPassword(password){
        const salt = crypto.randomBytes(32).toString('hex')
        const genhash = crypto.pbkdf2Sync(password, salt, 10000, 60, 'sha512').toString('hex')
        return {salt: salt, hash: genhash}
    }
    
    static isAuth(req, res, next){
        console.log('isAuth', req.isAuthenticated())
        if(req.isAuthenticated()){
            next()
        } else{
            res.redirect('/notAuthorized')
        }
    }
    
    static isAdmin(req, res, next){
        console.log('isAdmin',req.user[0].isAdmin)
        if(req.isAuthenticated() &&  req.user[0].isAdmin==1){
            next()
        } else{
            res.redirect('/notAuthorizedAdmin')
        }
    }
    
    static async userExists(req,res, next){
        const result = await db.execute('SELECT * FROM own_work.users WHERE username = ?', [req.body.uname])
        
           if(result[0].length > 0){
                console.log('inside post', req.query)
                console.log('chiqdi')
                req.flash('message', {message: 'user is valid, so change the username'})
                res.redirect('/register?user_exist=1')
            } else {
                console.log('chiqmadi')
                next()
            }
    
    }

    static insertUser(username,hash,salt) {
        if(username === 'admin'){
            return db.execute('INSERT INTO own_work.users (username,hash,salt,isAdmin) VALUES (?,?,?,1)', 
        [username,hash,salt], function(err, res, fields) {
      if(err){
          console.log("Error1")
      } else {
          console.log("Successfully Entered")
      }
        })
        } else {
            return db.execute('INSERT INTO own_work.users (username,hash,salt,isAdmin) VALUES (?,?,?,0)', 
        [username,hash,salt], function(err, res, fields) {
      if(err){
          console.log("Error1")
      } else {
          console.log("Successfully Entered")
      }
        })
        }
       
    }

    static async userId(id){
        if(!id || id === null){
            return null
        }

        const result = await db.execute('SELECT * FROM own_work.users WHERE id = ?', [id])
           //console.log(result)
           if(result[0]){
                return result[0]
        } 
    }

    static async getAddressUser(userId){
        if(!userId || userId === null){
            return null
        }

        const result = await db.execute('SELECT * FROM own_work.user_features where id = ?;', [userId])
           console.log(result)
           if(result[0]){
                return result[0]
        } 
    }


    static async editAddress(address , phone_number , firstname , lastname , country, id){
        if(!id || id === null){
            return null
        }

        const result = await db.execute(`UPDATE own_work.user_features  
        SET address = ?, phone_number = ?, firstname = ?, lastname = ?, country = ?
         WHERE id = ?;`, [address , phone_number  , firstname , lastname , country, id])
           //console.log(result)
           if(result[0]){
                return result[0]
        } 
    }

    static async deleteAddress(id){
        if(!id || id === null){
            return null
        }

        const result = await db.execute('DELETE FROM own_work.user_features	WHERE id = ?;', [id])
           //console.log(result)
           if(result[0]){
                return result[0]
            } 
    }

    static async loadUserAdresses(){

        const result = await db.execute('SELECT * FROM own_work.user_features')
           //console.log(result)
           if(result[0]){
                return result[0]
        } 
    }

    static async loadUsers(){

        const result = await db.execute('SELECT * FROM own_work.users')
           //console.log(result)
           if(result[0]){
                return result[0]
            } 
    }


    static async updateUserType(isAdmin,note,blocked, id){
        const result = await db.execute('UPDATE own_work.users SET isAdmin = ?, note = ?, blocked = ? WHERE id =?;', [isAdmin,note,blocked, id])
        console.log(`UPDATE own_work.users SET isAdmin = ${isAdmin}, note = ${note}, blocked = ${blocked} WHERE id =${id};`)
        if(result[0]){
            return result[0]

        } 
    }
      
}

