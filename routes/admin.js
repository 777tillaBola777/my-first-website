const { 
    addProduct,
    postAddedProduct,
    productController,
    types,
    addtype,
    addTypeController,
    editProductPage,
    editPro,
    brandsPage,
    addBrandController,
    addBrand,
    editTypePage,
    editPostType,
    deleteController,
    deleteTypeController,
    editBrandPage,
    editPostBrand,
    deleteBrandController,
    orderPage,
    itemPage,
    itemPostPage,
    getUsers,
    ediUser,
    postEditUser
} = require("../controllers/admin");

const {
    userExists,
    genPassword,
    isAuth,
    isAdmin,
    insertUser,
  } = require("../model/users");

const express = require('express')
const app = express()
const router = express.Router();

router.get('/products/add',isAdmin, addProduct)
router.post('/products/add',isAdmin, postAddedProduct)
router.get('/products', isAdmin,productController)
router.get('/types', isAdmin,types)
router.get('/brands', isAdmin,brandsPage)
router.get('/types/add', isAdmin,addTypeController)
router.get('/brands/add', isAdmin,addBrandController)
router.get('/products/:productId', isAdmin,editProductPage)
router.get('/types/:typeId', isAdmin,editTypePage)
router.get('/brands/:brandId', isAdmin,editBrandPage)
router.get("/orderPage", isAdmin,orderPage);
router.get("/order/:orderId", isAdmin, itemPage);
router.get("/users", isAdmin, getUsers)
router.get('/edit-user/:userId', ediUser)

router.post('/types/add', addtype)
router.post('/products/:productId', editPro)
router.post('/brands/add', addBrand)
router.post('/types/:typeId', editPostType)
router.post('/brands/:brandId', editPostBrand)
router.post("/order/:orderId", isAdmin, itemPostPage);
router.post('/edit-user/:userId', postEditUser)

router.get("/admin-route", isAdmin, (req, res, next) => {
    res.send(
      '<h1>You are admin</h1><p><a href="/logout">Logout and reload</a></p>'
    );
  });
  
  router.get("/notAuthorized", isAdmin, (req, res, next) => {
    res.send(
      '<h1>You are not authorized to view the resources </h1><p><a href="/login">Retry login</a></p>'
    );
  });
  
  router.get("/userAlreadyExists", isAdmin, (req, res, next) => {
    res.send(
      '<h1>Sorry! This username has taken </h1><p><a href="/register">Register with different username</a></p>'
    );
  });
  

router.delete('/products/:productId',deleteController)
router.delete('/types/:typeId',deleteTypeController)
router.delete('/brands/:brandId', deleteBrandController)



exports.router = router;