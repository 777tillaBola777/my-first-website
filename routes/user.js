const express = require("express");
const passport = require("passport");
const path = require("path");
const router = express.Router();
const {
  homePage,
  productCont,
  postPro,
  contactInform,
  profile,
  errPage,
  proPage2,
  logOut,
  loginPage,
  itemPage,
  editUserPage,
  loginSuccess,
  getJustProducts,
  getBrandsByBrandId,
  getTypesByTypeId,
  postProfilePage,
  cartPage,
  getProductsByOption,
  getProductsWithJson,
  cart,
  typePage,
  proceedToCheckOut,
  addInfo,
  productInfo,
  addressPage,
  addAddress,
  addAddressPostPage,
  aboutAddress,
  postAddress,
  deleteAddress,
  postUser
} = require("../controllers/user");

const {
  userExists,
  genPassword,
  isAuth,
  isAdmin,
  insertUser,
} = require("../model/users");

const {
  menuItems,
  products,
  inform,
  contacts,
  appNames,
  users,
} = require("../data");
//const user = require("../helpers/user");
const db = require("../helpers/database");
const Users = require("../model/users");
//console.log('db', db)
//const { isValidUser, updateUser } = require("../helpers/user");
const {
  loadProducts,
  getProduct,
  getProductFields,
  searchProduct,
  loadProduct,
  loadTypes,
  HightToLow,
  LowToHigh,
  getSortCriteria,
} = require("../helpers/products");

router.get("/html", function (req, res) {
  const indexFileName = path.join(__dirname, "index2.html");
  console.log("html filename", indexFileName);
  res.sendFile(indexFileName);
});

router.get("/", homePage);

router.get("/products", productCont);

router.post("/products", postPro);

router.get("/orders/:orderId", productInfo);

router.post("/orders", addInfo);

router.get("/address", addressPage)
router.get("/about-us", contactInform);
router.get("/contact", contactInform);
router.get("/account", profile);
router.get("/errorPage", errPage);
router.get("/productPage", proPage2);
router.get("/logout", logOut);
router.get("/login", loginPage);
router.get("/cartPage", cartPage);
router.get("/products/details", cart);
router.get("/proceedToCheckOut", proceedToCheckOut);
router.get("/types/:type_name", typePage);
router.get("/types/:type_name/details", getProductsWithJson);
router.get("/types/:type_name/type_id", getTypesByTypeId);
router.get("/types/:type_name/brand_id", getBrandsByBrandId);
router.get("/types/:type_name/used", getJustProducts);
router.get("/add-address",addAddress)
router.post("/add/address",addAddressPostPage)


// /about-item/34
router.get("/about-item/:productId", itemPage);
router.get("/about-address/:addressId", aboutAddress)
router.get("/edit-user", editUserPage);
router.post("/account", postProfilePage);
router.post("/types/:type_name", getProductsByOption);
router.post("/about-address/:addressId", postAddress)
router.delete("/about-address/:addressId", deleteAddress)


/*router.post("/login", passport.authenticate("local", {
      failureRedirect: "/login",
      successRedirect: "/"
    })
)*/

  
router.post('/login', async (req, res, next) => {
  try {
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
      badRequestMessage: 'The email does not match any account', // change "missing credentials" message
      failureFlash: true
    })(req, res, next)

  } catch (e) {
    res.status(400).send()
  }
})
  



router.get("/login-success", (re, res, next) => {
  const indexFileName = path.join(__dirname, "login-success.html");
  res.sendFile(indexFileName);
});

router.get("/login-failure", (re, res, next) => {
  const indexFileName = path.join(__dirname, "login-failure.html");
  res.sendFile(indexFileName);
});


router.get("/register", async (req, res, next) => {
  let warningText = 'This user has already been exist'  
  res.render("register", {
    title: "register",
    menu: menuItems,
    exist: req?.query?.user_exist,
    message: req.flash('message') ?? 'none'
  });
});



router.post("/register", userExists, async (req, res, next) => {
  //password
  //login
  //const userExist = userExists(req.body.username, next)

  
  const saltHash = genPassword(req.body.pw);
  
  const salt = saltHash.salt;
  const hash = saltHash.hash;
  if (req.body.uname === "admin" || req.body.uname === "Admin") {
    db.query(
      "INSERT INTO users (username,hash,salt,isAdmin) VALUES (?,?,?,1)",
      [req.body.uname, hash, salt],
      function (err, res, fields) {
        if (err) {
          console.log("Error");
        } else {
          console.log("Successfully Entered");
        }
      }
    );
  } else {
    db.query(
      "INSERT INTO users (username,hash,salt,isAdmin) VALUES (?,?,?,0)",
      [req.body.uname, hash, salt],
      function (err, res, fields) {
        if (err) {
          console.log("Error");
        } else {
          console.log("Successfully Entered");
        }
      }
    );
  }

  res.redirect("/login");
});

/*router.post('/login', (req, res) => {
  passport.authenticate('local', {failureRedirect: '/login-failure', successRedirect: '/login-success'})
})*/

router.get("/protected-route", isAuth, (req, res, next) => {
  res.send(
    '<h1>You are authenticated</h1><p><a href="/logout">Logout and reload</a></p>'
  );
});

router.get("/notAuthorizedAdmin", (req, res, next) => {
  res.send(
    '<h1>You are not authorized to view the resource as you are not the admin of the page </h1><p><a href="/login">Retry login as admin</a></p>'
  );
});

/*router.get("/register/user_exist=1", (req, res, next) => {
  //console.log('exist', res)
  const indexFileName = path.join(__dirname, "existUser.html");
  res.sendFile(indexFileName);
})*/

/*router.post('/productPage/:productId', (req, res) => {
    const product = {
      name: req.body.name,
      type: req.body.type,
      price: req.body.price,
      image: req.body.image,
      description: req.body.description,
      id: req.params.productId
    }
    const result = getProduct(req.params.productId)
    result
      .then((data) => {
        console.log(data)
        res.redirect('/admin/products')
      })
      .catch((err) => {
        console.log(err)
        res.redirect('/errorPage')
      }
  })*/

/*router.get("/productPage", (req, res) => {
  console.log(req.query.keyword);
  const sortDetails = getSortCriteria(req.query.sort_by)
  console.log('beiiie1', req.query.keyword, req.query.sort_by );
  const searchProductResult = searchProduct(
    req.query.keyword,
    sortDetails.sortField,
    sortDetails.sortDirection
  );
  searchProductResult
    .then(([products, data]) => {
      const types = loadTypes();
      return Promise.all([types, products]);
    })
    .then(([[rows, metaData], products]) => {
      console.log("heyyyyy");
      res.render("productPage", {
        title: "Add product form",
        menu: menuItems,
        product: products,
        productTypes: rows,
        keyword: req?.query?.keyword ?? '',
        loggedInUser: req.session.loggedInUser
      });
    })
    .catch((err) => {
      res.redirect("/errorPage");
      console.log(err);
    });
});*/

/*router.post("/productPage", (req, res) => {
  console.log(req.body.keyword);
  console.log('bee2',req.body.keyword, req.body.name, req.body.value);
  
      res.redirect("productPage");
    })
    .catch((err) => console.log(err));
});*/
module.exports = router;

