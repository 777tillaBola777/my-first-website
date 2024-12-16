const {
    menuItems,
    products,
    inform,
    contacts,
    appNames,
    users,
  } = require("../data");
  
  const countries = require('../public/js/countries.json');
  //const cities = require('../countries-states-cities-database/cities.json');
  
  
  
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
    getTypeAncentors,
    getTypefromTypes,
    getTypeChildren,
  } = require("../helpers/products");
  const Product = require("../model/products");
  const Users = require("../model/users");
  const Consumers = require("../model/consumers");
  const Order = require("../model/order");
  const datetime = require("../helpers/datetime");
  const passport = require("passport");
  
  const homePage = async (req, res) => {
    const productsByType = [3, 16, 17, 20, 23];
    const queryParams = [
      {
        name: "type_id",
        value: productsByType,
        criteria: "IN",
      },
    ];
    
    const result = await Product.fetchAll(queryParams);
    //const getValue = await Product.getProductsByType(productsByType)
    const setType = await Product.getTypes(productsByType);
    const userExists = await Users.userId(req?.session?.passport?.user);
    console.log("local",  userExists);
  
    res.render("home", {
      title: "Homepage",
      products: products,
      productsByTypes: result,
      types: setType,
      menu: menuItems,
      user: req?.user ? req?.user[0] : null,
      userExists: userExists ? userExists[0] : null,
      loggedInUser: req?.session?.passport?.user,
    });
  };
  
  const cartPage = async (req, res) => {
    try {
      const userExists = await Users.userId(req?.session?.passport?.user);
      res.render("cartPage", {
        title: "Cart product",
        menu: menuItems,
        appNames: appNames,
        user: req?.user ? req?.user[0] : null,
        userExists: userExists ? userExists[0] : null,
        loggedInUser: req?.session?.passport?.user,
      });
    } catch (err) {
      res.redirect("/errorPage");
      console.log(err);
    }
  };
  
  const proceedToCheckOut = async (req, res) => {
    const userExists = await Users.userId(req?.session?.passport?.user);
    res.render("proceedToCheckOut", {
      title: "order product",
      menu: menuItems,
      countries,
      //cities,
      user: req?.user ? req?.user[0] : null,
      userExists: userExists ? userExists[0] : null,
      loggedInUser: req?.session?.passport?.user,
    });
  };
  
  const addInfo = async (req, res) => {
    try {
      const user = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phone_number: req.body.phone_number,
        country: req.body.country,
        city: req.body.city,
        zip: req.body.zip,
      };
  
      //const getUser = await Consumers.addOrderUser(user)
  
      let consumer = await Consumers.doesExist(req.body.phone_number);
  
      if (!consumer?.id) {
        consumer = new Consumers(
          req.body.firstname,
          req.body.lastname,
          req.body.phone_number,
          req.body.country,
          req.body.city,
          req.body.zip
        );
        console.log('country', consumer)
        await consumer.save();
        
        console.log("it is exist", consumer);
      }
  
      
  
      const productAbout = JSON.parse(req.body.ids);
      let ids = [];
      let count = [];
  
      productAbout.products.forEach((element) => {
        ids.push(element.id);
        count.push(element.quantity);
      });
  
      //const idValue = consumer.setId(getUser[0].insertId)
      //const b = consumer.save(user)
      //console.log('idlar qiymatlari',getUser[0].insertId, req.body.firstname, req.body.lastname, req.body.phone_number)
  
      const order = new Order(
        null,
        req.body.payment_type,
        consumer.id,
        req.body.taking_form,
        "new"
      );
  
      //console.log(order)
      await order.save();
  
      const product = new Product(ids);
      //2007010420000127*20021405
      //console.log('qimat2222222222',consumerDetails)
      const getChosenPro = await Product.getById(ids);
      getChosenPro.forEach(async (item, index) => {
        const product = await order.addProduct(item, count[index]);
        console.log("Consumer id is exist", product);
        return product.id;
        
      });
  
      // Haridor ma'lumoti qo'shitiladi
      //
  
      // Agar yuqoridagi amallar muvaffaqiyatli tugasa
      res.redirect("/orders/" + order.id);
     // res.redirect('/proceedToCheckOut');
    } catch (err) {
      // fail bo'lsa
      res.redirect("/errorPage");
      console.log(err);
    }
  };
  
  const productInfo = async (req, res) => {
    const order = await Order.getOnlyOrder(req.params.orderId);
    const readibleDate = datetime.getHumanReadibleDateTime(order[0].created);
    const date = datetime.makeDate(order[0].created);
    const date2 = datetime.makeDateNumber(order[0].created);
    const getCustomer = await Consumers.getConsumer(order[0].customer_id);
    const userExists = await Users.userId(req?.session?.passport?.user);
  
    let totalCost = 0;
  
    order.forEach((item) => {
      totalCost += +item.count * +item.price;
    });
  
    console.log("idslar2112", readibleDate);
    res.render("orderTable", {
      title: "Order table",
      menu: menuItems,
      order: order,
      status: order[0].status,
      consumer: getCustomer,
      created: readibleDate,
      date: date,
      dateDay: date2,
      orderId: req.params.orderId,
      contact: contacts,
      totalPrice: totalCost,
      user: req?.user ? req?.user[0] : null,
      userExists: userExists ? userExists[0] : null,
      loggedInUser: req?.session?.passport?.user,
    });
  };
  
  const postPro = async (req, res) => {
    console.log(req.body.keyword);
    console.log("beiiiie2", req.body.value);
    const result = await Product.loadProducts(
      req.query.sort_by,
      req.query.sort_direction
    );
    const search = new Users(req.body.keyword);
    const result1 = search.fetchAll();
    res.redirect("products");
  };
  
  const cart = async (req, res) => {
    try {
      const productsIds = req?.query?.ids.split();
      //const result = new Product(productsIds)
      const getChosenProduct = await Product.getById(productsIds);
      console.log("idlar", req?.query?.ids);
      res.send(getChosenProduct);
  
      /*     if (getChosenProduct) {
            console.log('STATUS OK')
            const a = res.json(getChosenProduct)  
            console.log(a)
          } else { 
            console.log('yo\'q')
          }*/
    } catch (err) {
      res.redirect("/errorPage");
      console.log(err);
    }
  };
  
  const productCont = async (req, res) => {
    console.log("tttta", typeof req.body.value, req.body.value);
    const sortDetails = Product.getSortCriteria(req.query.sort_by);
    console.log("beiiie1", req.query.keyword, req.query.sort_by);
    const queryParams = [];
    if (typeof req.query.keyword === "string" && req.query.keyword.trim()) {
      queryParams.push({
        name: "name",
        value: req.query.keyword.trim(),
        criteria: "LIKE",
      });
    }
    const searchProductResult = await Product.fetchAll(
      queryParams,
      sortDetails.sortField,
      sortDetails.sortDirection
    );
    console.log("aaaaaaaaaaaaaaaaaa", req.query.keyword);
    const userExists = await Users.userId(req?.session?.passport?.user);
    const types = await Product.loadTypes();
    res.render("products", {
      title: "Products",
      menu: menuItems,
      products: searchProductResult,
      sortby: req?.query?.sort_by ?? "",
      productTypes: types,
      keyword: req?.query?.keyword ?? "",
      user: req?.user ? req?.user[0] : null,
      userExists: userExists ? userExists[0] : null,
      loggedInUser: req?.session?.passport?.user,
    });
  };
  
  const contactInform = async (req, res) => {
    const userExists = await Users.userId(req?.session?.passport?.user);
  
    res.render("contact", {
      title: "Contacts",
      menu: menuItems,
      contact: contacts,
      user: req?.user ? req?.user[0] : null,
      userExists: userExists ? userExists[0] : null,
      loggedInUser: req?.session?.passport?.user,
    });
  };
  
  
  const profile = async (req, res) => {
    const userExists = await Users.userId(req?.session?.passport?.user);
    const userAddress = await Users.authenticateUser(req?.session?.passport?.user)
  
    ///console.log("produc", userAddress);
    res.render("account", {
      title: "Profile",
      users: users,
      menu: menuItems,
      contact: contacts,
      userExists: userExists ? userExists[0] : null,
      inform: inform,
      userAddress,
      user: req?.user ? req?.user[0] : null,
      userExists: userExists ? userExists[0] : null,
      loggedInUser: req?.session?.passport?.user,
    });
  };
  
  const errPage = (req, res) => {
    res.render("errorpage", {
      title: "Error",
      menu: menuItems,
    });
  };
  
  const addressPage = async (req, res) => {
    const userExists = await Users.userId(req?.session?.passport?.user);
    const userAddress = await Users.authenticateUser(req?.session?.passport?.user)
    console.log(userAddress)
    res.render("address", {
      title: "Your Addresses",
      menu: menuItems,
      loggedInUser: userExists[0],
      user: req?.user ? req?.user[0] : null,
      userExists: userExists ? userExists[0] : null,
      userAddress,
      loggedInUser: req?.session?.passport?.user,
    });
  };
  
  const proPage2 = async (req, res) => {
    const userExists = await Users.userId(req?.session?.passport?.user);
    res.render("productPage", {
      title: "product page",
      menu: menuItems,
      user: req?.user ? req?.user[0] : null,
      userExists: userExists ? userExists[0] : null,
      loggedInUser: req?.session?.passport?.user,
    });
  };
  
  const logOut = (req, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  };
  
  const loginPage = async (req, res) => {
    /*if (req.session.loggedIn) {
        res.redirect("/");
      }*/
      
      
    const userExists = await Users.userId(req?.session?.passport?.user);
    const message = req.flash('error')
    console.log('flash',req?.session)
    res.render("login", {
      title: "Login",
      menu: menuItems,
      user: req?.user ? req?.user[0] : null,
      userExists: userExists ? userExists[0] : null,
      loggedInUser: req?.session?.passport?.user,
      message
    });
  };
  
  const itemPage = async (req, res) => {
    /* console.log('before calling findById')
      const product = await Product.findById(req.params.productId)
      console.log('after calling findById')
      const productFields = await getProductFields(req.params.productId)
      console.log(productFields)*/
  
    try {
      const product = await Product.findById(req.params.productId);
      let number = product[0].seen + 1;
      const insertViewValue = await Product.insertViewValue(
        number,
        req.params.productId
      );
      ///const type = await Product.getType(product[0].type_id)
  
      const massiveName = [];
      const types = await Product.loadTypes();
      const type = getTypefromTypes(types, product[0].type_id);
      const ancentors = [];
      //agar hamma type lar to'liq bo'lishini xohlasak shunaqa qilinadi: ancentors.push(type)
  
      getTypeAncentors(types, product[0].type_id, ancentors);
      const massive = ancentors.reverse();
      massive.push(type);
  
      console.log("ancestors", massive);
      types.forEach((item) => {
        massiveName[item.id] = item.type;
      });
      //massiveName[0] = '-'
      const proFields = await Product.getProductFields(req.params.productId);
      const userExists = await Users.userId(req?.session?.passport?.user);
      res.render("about-product", {
        title: "Products",
        menu: menuItems,
        type,
        massive,
        parentType: massiveName,
        product: product,
        productFields: proFields,
        appNames: appNames,
        user: req?.user ? req?.user[0] : null,
        userExists: userExists ? userExists[0] : null,
        loggedInUser: req?.session?.passport?.user,
      });
    } catch (err) {
      res.redirect("/errorPage");
      console.log(err);
    }
  };
  
  const typePage = async (req, res) => {
    //massives
    const brands = [];
    const typeIds = [];
    const existTypes = [];
    const searchTypes = [];
    const brandId = [];
  
    if (req.query?.brands?.length > 1) {
      brandId.push(...req.query.brands);
      console.log("noldan katta", req.query?.brands?.length);
    } else {
      brandId.push(req.query.brands);
      console.log("endi qoshildi", req.query.brands);
    }
    //functions
    //console.log("index_number", queryParams);
    const types = await Product.loadTypes()
    const typeChildren = await Product.getTypeByName(req.params.type_name);
    const type = getTypefromTypes(types, typeChildren[0]?.id)
    const sortedProducts = getSortCriteria(req?.query?.change_by_something)
    const userExists = await Users.userId(req?.session?.passport?.user);
    existTypes.push(type);
  getTypeChildren(types, typeChildren[0]?.id, existTypes);
    //console.log('index is valid', getProductsByBrandId)
    console.log("index is valid", req.query.types);

    if (existTypes[0]?.id) {
      existTypes.forEach((item) => {
        if (+item.id >= 0) {
          //console.log('parent', +item.parent_type)
          typeIds.push(item.id);
        }
      });
    } else {
      typeIds.push(0);
    }
    
    const typeProducts = await Product.getProductsByType(
      typeIds,
      sortedProducts.sortField,
      sortedProducts.sortDirection
    );

    const prices = {
      price1: req.query.price1 ?? "",
      price2: req.query.price2 ?? "",
    };
  
    const queryParams = [];
    if (typeIds) {
      queryParams.push({
        name: "type_id",
        value: typeIds,
        criteria: "IN",
      });
    }
  
    if (prices.price1) {
      queryParams.push({
        name: "price",
        value: prices.price1,
        criteria: ">=",
      });
    }
  
    if (prices.price2) {
      queryParams.push({
        name: "price",
        value: prices.price2,
        criteria: "<=",
      });
    }
  
    if (brandId.length > 0 && brandId[0] !== undefined) {
      queryParams.push({
        name: "brand_id",
        value: brandId ?? "",
        criteria: "IN",
      });
    }
  
    let indexNumber = 0;
    console.log("children", brandId);
     if (+req.query.index_number) {
       indexNumber += +req.query.index_number
     }

     const searchProductResult = await Product.fetchAll(
      queryParams,
      sortedProducts.sortField,
      sortedProducts.sortDirection,
      indexNumber
    );
    console.log('producwdwsdwswst',typeIds,
    sortedProducts.sortDirection)
    if (searchProductResult?.length > 0) {
      searchProductResult?.forEach((item) => {
        console.log("brands", item.brand_id);
        searchTypes.push(item?.type_id);
        brands.push(item?.brand_id);
      });
    }
    //console.log('food brends', searchProductResult)
    //
    const productBrands = await Product.fetchAll(
      queryParams,
      sortedProducts.sortField,
      sortedProducts.sortDirection,
      -1,
      ["brand_id"],
      ["brand_id"]
    );
  
    const productTypes = await Product.fetchAll(
      queryParams,
      sortedProducts.sortField,
      sortedProducts.sortDirection,
      -1,
      ["type_id"],
      ["type_id"]
    );
  
    const productUsed = await Product.fetchAll(
      queryParams,
      sortedProducts.sortField,
      sortedProducts.sortDirection,
      -1,
      ["id"]
    );

    const productBrandsAsArray = productBrands.map((x) => x.brand_id);
  const productTypesAsArray = productTypes.map((x) => x.type_id);


  const getBrands = await Product.getBrand(productBrandsAsArray);
  const getTypes = await Product.getTypes(productTypesAsArray);
    res.render("typePage", {
      title: "Types page",
      product_of_types: typeProducts,
      existTypes,
      productUsed,
      prices,
      getBrands,
      existId: brandId,
      searchProductResult,
      getTypes,
      typeName: req.params.type_name,
      selectBoxValue: req.query.change_by_something,
      indexValue: req.query.index_number,
      menu: menuItems,
      user: req?.user ? req?.user[0] : null,
      userExists: userExists ? userExists[0] : null,
      loggedInUser: req?.session?.passport?.user,
    });
  };
  
  const getProductsWithJson = async (req, res) => {
    const indexNumber = req?.query?.index_number;
    const first = req?.query?.first;
    const second = req?.query?.second;
    const existTypes = [];
    const typeIds = [];
    const types = await Product.loadTypes();
    const typeChildren = await Product.getTypeByName(req.params.type_name);
    const type = getTypefromTypes(types, typeChildren[0]?.id);
    const sortedProducts = getSortCriteria(req.query.change_by_something);
    const queryParams = [];
    //
    if (req.query?.brands?.length > 1) {
      if (req.query?.brands.length > 0 && req.query?.brands[0] !== undefined) {
        queryParams.push({
          name: "brand_id",
          value: req.query?.brands ?? "",
          criteria: "IN",
        });
      }
    }
    existTypes.push(type);
    getTypeChildren(types, typeChildren[0]?.id, existTypes);
  
    //const existProducts = await Product.loadProducts(sortedProducts.sortField, sortedProducts.sortDirection)
    //actiontypes, typeId, ancentors
    //console.log('product', getSortCriteria(req.query.change_by_something))
    //
    //ancentors.push(type)
  
    //console.log('children', req.query.brands)
    if (existTypes[0]?.id) {
      existTypes.forEach((item) => {
        if (+item.id >= 0) {
          //console.log('parent', +item.parent_type)
          typeIds.push(item.id);
        }
      });
    } else {
      typeIds.push(0);
    }
  
    const prices = {
      price1: req.query.price1 ?? "",
      price2: req.query.price2 ?? "",
    };
  
    if (typeIds) {
      queryParams.push({
        name: "type_id",
        value: typeIds,
        criteria: "IN",
      });
    }
  
    if (prices.price1) {
      queryParams.push({
        name: "price",
        value: prices.price1,
        criteria: ">=",
      });
    }
  
    if (prices.price2) {
      queryParams.push({
        name: "price",
        value: prices.price2,
        criteria: "<=",
      });
    }
  
    //const result = new Product(productsIds)
    const searchProductResult = await Product.fetchAll(
      queryParams,
      sortedProducts.sortField,
      sortedProducts.sortDirection,
      indexNumber,
      [first],
      [second]
    );
    //console.log('new value', searchProductResult)
    console.log(
      "zor tv",
      indexNumber,
      "selectbox",
      req.query.change_by_something,
      "price1",
      req.query.price1,
      "price2",
      req.query.price2
    );
  
    res.send(searchProductResult);
  };
  
  const getTypesByTypeId = async (req, res) => {
    const searchOrderResult = await Product.getTypes(req.query.types);
    //req.body.change_by_something,
    console.log("brandaa", req.query.types);
    // console.log('qiymat bor ekannnn',massive)
    //const searchOrder = await Order.getOrders(massive)
  
    //console.log('types/' + req.params.type_name)
    res.send(searchOrderResult);
  };
  
  const getBrandsByBrandId = async (req, res) => {
    const getBrands = await Product.getBrand(req.query.brands);
    //req.body.change_by_something,
    console.log("brandaa", req.query.brands);
    // console.log('qiymat bor ekannnn',massive)
    //const searchOrder = await Order.getOrders(massive)
  
    //console.log('types/' + req.params.type_name)
    res.send(getBrands);
  };
  
  const getJustProducts = async (req, res) => {
    const getUsed = await Product.getUsed(req.query.type_id);
    //req.body.change_by_something,
    console.log("brandaa", req.query.type_id);
    // console.log('qiymat bor ekannnn',massive)
    //const searchOrder = await Order.getOrders(massive)
  
    //console.log('types/' + req.params.type_name)
    res.send(getUsed);
  };
  
  const getProductsByOption = async (req, res) => {
    //const searchOrderResult = await Order.getOrders()
    //req.body.change_by_something,
    console.log("brandaa", req.query.brands);
    // console.log('qiymat bor ekannnn',massive)
    //const searchOrder = await Order.getOrders(massive)
  
    //console.log('types/' + req.params.type_name)
    res.redirect("/types/" + req.params.type_name);
  };
  
  const editUserPage = async (req, res) => {
    const userExists = await Users.userId(req?.session?.passport?.user);
    console.log(userExists);
    res.render("edit-user", {
      title: "Add product form",
      menu: menuItems,
      user: req?.user ? req?.user[0] : null,
      userExists: userExists ? userExists[0] : null,
      loggedInUser: req?.session?.passport?.user,
    });
  };
  
  const loginSuccess = async (req, res) => {
    const userExists = await Users.userId(req?.session?.passport?.user);
    res.render("login-success", {
      title: "Login-success",
      menu: menuItems,
      user: req?.user ? req?.user[0] : null,
      userExists: userExists ? userExists[0] : null,
      loggedInUser: req?.session?.passport?.user,
    });
  };
  
  const addAddress = async (req, res) => {
    const userExists = await Users.userId(req?.session?.passport?.user);
  
    res.render("add-address", {
      title: "Add address form",
      menu: menuItems,
      countries,
      user: req?.user ? req?.user[0] : null,
      userExists: userExists ? userExists[0] : null,
      loggedInUser: req?.session?.passport?.user,
    });
  };
  
  const addAddressPostPage = async (req, res) => {
    console.log(req?.session?.passport?.user)
    console.log(
      'address',req.body.address,
      'phone_number',req.body.phone_number,
      'payment_type',req.body.payment_type,
      'firstname',req.body.firstname,
      'lastname',req.body.lastname,
      'country', req.body.country
    )
  
    const user = new Users(
      null,
      null,
      req?.body?.firstname ?? null,
      req?.body?.lastname ?? null,
      req?.body?.address ?? null,
      req?.body?.phone_number ?? null,
      null,
      req?.session?.passport?.user ?? null,
      req?.body?.country ?? null,
    )
  
    const result = user.addUserFeatures()
  console.log(user)
    res.redirect('/address')
  };
  
  const loginPostPage = async (req, res) => {
    let message = "invalid";
  
    const authenticate = passport.authenticate("local", {
      failureRedirect: "/login-failure",
      successRedirect: "/login-success",
    });
  
    if (authenticate) {
      res.redirect("/login-failure");
    }
    res.redirect("/login-success");
  
    /*const loginUser = new Users(
        req.body.login, 
        req.body.password  insertUser(login, password, role_id, firstname, lastname)
      )*/
  
    /*const authResult = await Users.authenticate(req.body.login, req.body.password)
      //res.send(authResult)
      /*const insertUser = await Users.insertUser(
        authResult[0].login,
        authResult[0].password,
        authResult[0].role_id,
        authResult[0].firstname,
        authResult[0].lastname)*/
    //const isLoggedUser = loginUser.saveUser()
  
    /*console.log('Logged Users are valid: ',authResult);
          if (authResult.length) {
            const user = new Users(
              authResult[0].login,
              authResult[0].password,
              authResult[0].firstname,
              authResult[0].lastname,
              authResult[0].role
            )
            user.setId(authResult[0].id)
            req.session.loggedIn = true;
            req.session.loggedInUser = user;
            res.redirect("/");
          
          }*/
  };
  
  const postProfilePage = async (req, res) => {
    const userExists = await Users.userId(req?.session?.passport?.user);
  
    const userInforms = {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      address: req.body.address,
      payment_type: req.body.payment_type,
      id: userExists ? userExists[0].id : null,
      blocked: userExists ? userExists[0].blocked : null
    };
  
   //
   console.log('user', userExists)
    const user = new Users(
      userExists ? userExists[0].username : null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );
    
    user.setId(userInforms.id);
    user.setUsername(userInforms.username);
    /*user.setFirstname(userInforms.firstname);
    user.setLastname(userInforms.lastname);
    user.setAddress(userInforms.address);
    user.setPaymentType(userInforms.payment_type);*/
    const result = user.save();
    console.log(result)
    result
      .then((data) => {
        req.session.loggedInUser = user;
        console.log("datartddsiri6t76t",  req.session);
        res.redirect("/account");
      })
      .catch((err) => {
        console.log("datartddsiri6t76t", err);
        res.redirect("/errorPage");
      });
  };
  
  
  const aboutAddress = async (req, res) => {
    
    const getUserAddress = await Users.getAddressUser(req.params.addressId);
    console.log("new ids",getUserAddress);
    const userExists = await Users.userId(req?.session?.passport?.user);
    res.render("edit-address", {
      title: "order product",
      menu: menuItems,
      countries,
      user: req?.user ? req?.user[0] : null,
      getUserAddress: getUserAddress ? getUserAddress[0] : null,
      userExists: userExists ? userExists[0] : null,
      loggedInUser: req?.session?.passport?.user,
    });
  };
  
  const postAddress = async (req, res) => {
    const editAddress = await Users.editAddress(req.body.address,
      req.body.phone_number,
      req.body.firstname,
      req.body.lastname,
      req.body.country,
      req.params.addressId)
  
  
      console.log("new ids");
    res.redirect("/address")
  };
  
  const deleteAddress = async (req, res) => {
    const result = await Users.deleteAddress(req.params.addressId);
    console.log("result", result);
    res.json({ status: "OK" });
  };
  
  const postUser = (req, res) => {
    const result = passport.authenticate("local", {
      failureRedirect: "/login-failure",
      successRedirect: "/",
    })
  //console.log(result)
    res.redirect('/')
  };
  
  
  module.exports = {
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
    loginPostPage,
    postProfilePage,
    cartPage,
    getJustProducts,
    cart,
    proceedToCheckOut,
    addInfo,
    productInfo,
    typePage,
    getProductsByOption,
    getProductsWithJson,
    getTypesByTypeId,
    getBrandsByBrandId,
    loginSuccess,
    addressPage,
    addAddress,
    addAddressPostPage,
    aboutAddress,
    postAddress,
    deleteAddress,
    postUser
  };
  
  
  //13:04 zumar: Surah Zumar - Abdul Basit
  