const { menuItems } = require('../data')
const { getProducts } = require('../helpers/products')
const express = require('express')
const app = express()
const passport = require("passport");
const Users = require("../model/users");
const Products = require("../model/products");
const Order = require("../model/order");
const Consumers = require('../model/consumers');
const datetime = require("../helpers/datetime");

const addProduct = async (req, res) => {
  const userExists = await Users.userId(req?.session?.passport?.user);
  const types = await Products.loadTypes()
  const brands = await Products.loadBrands()
  res.render('admin/add-product', {
    title: "Add product form",
    menu: menuItems,
    types,
    brands,
    isAdmin: true,
    user: req?.user ? req?.user[0] : null,
    userExists: userExists ? userExists[0] : null,
    loggedInUser: req?.session?.passport?.user,
  })
}

const postAddedProduct = async (req, res) => {
  const pros = {
    name: req.body.name,
    typeId: req.body.type_id,
    price: req.body.price,
    description: req.body.description,
    image: req.body.image,
    brandId: req.body.brand_id,
    featured: req.body.featured ?? ""
  }
 
  const product = new Products(
    null, 
    req.body.name,
    req.body.type_id,
    req.body.price,
    req.body.description,
    req.body.image,
    req.body.brand_id,
    req.body.featured ?? ""
  )

  const products_fields = {
    name: req.body.field_name,
    value: req.body.field_value,
    id: req?.body?.field_id
  }

  console.log(product)
  const result = await product.save()
console.log(result)
  if(req.body.field_name){
    await Products.addProductFields(
      result.insertId,
      req.body.field_name,
      req.body.field_value
    )
  }
  //console.log("fild inform", result);


  res.redirect('/admin/products')
}

const productController = async (req, res) => {
  const sortDetails = Products.getSortCriteria(req.query.sort_by)
    
    console.log('sort by',req.query.sort_by)
    const queryParams = []
    if(typeof req.query.keyword === 'string' && req.query.keyword.trim()){
      queryParams.push({
        name: "name",
        value: req.query.keyword.trim(),
        criteria: "LIKE",
      });
    }
    const searchProductResult = await Products.fetchAll(
      queryParams,
      sortDetails.sortField,
      sortDetails.sortDirection
    );
  const userExists = await Users.userId(req?.session?.passport?.user);
  console.log('keyword',req.query.keyword)
  res.render("admin/products", {
    title: "Products",
    menu: menuItems,
    keyword: req.query.keyword,
    sortby: req.query.sort_by,
    products: searchProductResult,
    isAdmin: true,
    user: req?.user ? req?.user[0] : null,
    userExists: userExists ? userExists[0] : null,
    loggedInUser: req?.session?.passport?.user,
  });
  
}

const types = async (req, res) => {
  const types = await Products.loadTypes();
  const massiveName = [];

  const sortedList = types.sort((a, b) => a.type.localeCompare(b.type));

  types.forEach((item, index) => {
    massiveName[item.id] = item.type;
  });

  
  const userExists = await Users.userId(req?.session?.passport?.user);

  res.render("admin/types", {
    title: "Product types",
    menu: menuItems,
    productTypes: types,
    parentType: massiveName,
    isAdmin: true,
    user: req?.user ? req?.user[0] : null,
    userExists: userExists ? userExists[0] : null,
    loggedInUser: req?.session?.passport?.user,
  });
}

const addtype = async (req, res) => {
  //console.log("dwdwwwwwww", req.body.name);
  const typesName = {
    name: req.body.type,
    parent_type: req.body.typeOptions,
  };

  //console.log("type name", typesName);

  const result = await Products.addType(typesName);
  //console.log("result", result);
  res.redirect("/admin/types");
};

const addTypeController = async (req, res) => {
  const types = await Products.loadTypes();
  const userExists = await Users.userId(req?.session?.passport?.user);
  res.render("admin/add-types", {
    title: "Add type form",
    menu: menuItems,
    types: types,
    isAdmin: true,
    user: req?.user ? req?.user[0] : null,
    userExists: userExists ? userExists[0] : null,
    loggedInUser: req?.session?.passport?.user,
  });
};

const editProductPage = async (req, res) => {
  const brands = await Products.loadBrands();
  const types = await Products.loadTypes();
  const userExists = await Users.userId(req?.session?.passport?.user);
  const productFields = await Products.getProductFields(req.params.productId);
  const getPro = await Products.getProduct(req.params.productId)
  console.log('fields',productFields)
  res.render("admin/edit-product", {
    title: "Edit product form",
    menu: menuItems,
    types: types,
    isAdmin: true,
    product_fields: productFields,
    getPro,
    brands,
    user: req?.user ? req?.user[0] : null,
    userExists: userExists ? userExists[0] : null,
    loggedInUser: req?.session?.passport?.user,
  });
};

const editPro = async (req, res) => {
  //console.log("dwdwwwwwww", req.params.productId);
  const pros = {
    name: req.body.name,
    type_id: req.body.type_id,
    price: req.body.price,
    image: req.body.image,
    description: req.body.description,
    brand_id: req.body.brand_id,
    featured: req?.body?.featured ?? null,
    id: req.params.productId
  };

  console.log("product features", pros);

  const result = await Products.updateProduct(pros);

 // console.log(result)

  const resultFields = await Products.getProductFields(req.params.productId)
  //console.log("result", result);

  const fieldsToDelete = []

  resultFields.forEach((field) => {
    let fieldFound = false
    if(typeof req.body.field_name === "string"){
      if(field.field_id === +req.body?.field_id){
        fieldFound = true
      }
    } else if(req?.body?.field_id?.length){
      req.body?.field_id.forEach((field_id) => {
        field_id = +field_id;
        if (field.field_id === field_id) {
          fieldFound = true;
          console.log("hellitititobro", field_id, field.field_id);
        }
      });
    }
console.log('found fields',fieldFound)
    if (!fieldFound) {
      fieldsToDelete.push(field.field_id);
    }
  })

  if (typeof req.body.field_name === "string") {
    if (req.body.field_id) {
      const result2 = await Products.updateFields(
        req.body.field_id,
        req.body.field_name,
        req.body.field_value
      );
      console.log("men bu yerdafewffeman HEY4 ssss: 1", result2);
    } else {
      const field_result2 = await Products.addProductFields(
        req.params.productId,
        req.body.field_name,
        req.body.field_value
      );
      console.log("id logirrrrn", field_result2);
    }

    //res.redirect('/admin/products/' + req.params.productId)
  } else if (req.body.field_name?.length) {
    console.log("req.body.field_name", req.body.field_name);
    req.body.field_name.forEach(async (field, index) => {
      if (+req.body.field_id[index]) {
        await Products.updateFields(
          req.body.field_id[index],
          field,
          req.body.field_value[index]
        );
        console.log("id login", req.body.field_id[index]);
      } else {
        await Products.addProductFields(
          req.params.productId,
          field,
          req.body.field_value[index]
        );
        console.log("id login", req.body.field_id[index]);
      }
    });
  }

  if (fieldsToDelete?.length) {
    const deleteProduct = await Products.deleteFields(fieldsToDelete);
    if (deleteProduct[0]) {
      console.log("bu yangi qiymat o'chirish uchun", deleteProduct[0]);
    }
  }

  res.redirect("/admin/products");
};

const deleteController = async (req, res) => {
  const result = await Products.deleteProduct(req.params.productId);
 // console.log("result", result);
  res.json({ status: "OK" });
};

const deleteTypeController = async (req, res) => {
  const result = await Products.deleteType(req.params.typeId);
  //console.log("result", result);
  res.json({ status: "OK" });
};

const brandsPage = async (req, res) => {
  const brands = await Products.loadBrands();
  const massiveName = [];

  const sortedList = brands.sort((a, b) => a.brands.localeCompare(b.brands));

  brands.forEach((item, index) => {
    massiveName[item.id] = item.brands;
  });

  
  const userExists = await Users.userId(req?.session?.passport?.user);

  res.render("admin/brands", {
    title: "Product brands",
    menu: menuItems,
    productBrands: brands,
    parentType: massiveName,
    isAdmin: true,
    user: req?.user ? req?.user[0] : null,
    userExists: userExists ? userExists[0] : null,
    loggedInUser: req?.session?.passport?.user,
  });
}

const addBrandController = async (req, res) => {
  const brands = await Products.loadBrands();
  const userExists = await Users.userId(req?.session?.passport?.user);
  res.render("admin/add-brand", {
    title: "Add brand form",
    menu: menuItems,
    brands,
    isAdmin: true,
    user: req?.user ? req?.user[0] : null,
    userExists: userExists ? userExists[0] : null,
    loggedInUser: req?.session?.passport?.user,
  });
};

const addBrand = async (req, res) => {
  const brandName = {
    name: req.body.brand
  };

  //console.log("brand name", brandName);

  const result = await Products.addBrand(brandName);
  //console.log("result", result);
  res.redirect("/admin/brands");
};

const editTypePage = async (req, res) => {
  const types = await Products.loadTypes();
  const userExists = await Users.userId(req?.session?.passport?.user);
  const getType = await Products.getType(req.params.typeId)
  console.log('type',getType)
  res.render("admin/edit-type", {
    title: "Edit type form",
    menu: menuItems,
    types: types,
    isAdmin: true,
    getType,
    user: req?.user ? req?.user[0] : null,
    userExists: userExists ? userExists[0] : null,
    loggedInUser: req?.session?.passport?.user,
  });
};

const editPostType = async (req, res) => {
  const typesName = {
    name: req.body.type,
    parent_type: req.body.typeOptions,
    id: req.params.typeId
  };

  const result = await Products.updateType(typesName);
  console.log("type name", typesName);
  console.log("result", result);
  res.redirect("/admin/types");
};

const editBrandPage = async (req, res) => {
  const brands = await Products.loadBrands();
  const userExists = await Users.userId(req?.session?.passport?.user);
  const getBrand = await Products.getBrand(req.params.brandId)
  console.log('brand',getBrand)
  res.render("admin/edit-brand", {
    title: "Edit brand form",
    menu: menuItems,
    brands,
    isAdmin: true,
    getBrand,
    user: req?.user ? req?.user[0] : null,
    userExists: userExists ? userExists[0] : null,
    loggedInUser: req?.session?.passport?.user,
  });
};

const editPostBrand = async (req, res) => {
  const brandInfo = {
    name: req.body.brand,
    id: req.params.brandId
  };

  const result = await Products.updateBrand(brandInfo);
  console.log("type name", brandInfo);
  console.log("result", result);
  res.redirect("/admin/brands");
}

const deleteBrandController = async (req, res) => {
  const result = await Products.deleteBrand(req.params.brandId);
  console.log("result", req.params.brandId);
  res.json({ status: "OK" });
};

const orderPage = async (req, res) => {
  console.log("query ", req.query.keyword);
  const massive = [
    req.query.payment_type,
    req.query.taking_form,
    req.query.status,
  ];
  
  const filters = [
    {
      name: "payment_type",
      value: req.query.payment_type ?? "",
    },
    {
      name: "taking_form",
      value: req.query.taking_form ?? "",
    },
    {
      name: "status",
      value: req.query.status ?? "",
    },
  ];
  const userExists = await Users.userId(req?.session?.passport?.user);
  const searchOrderResult = await Order.getOrders(filters);
  console.log(searchOrderResult)


  res.render("admin/orders", {
    title: "Orders",
    status: massive,
    menu: menuItems,
    orders: searchOrderResult,
    user: req?.user ? req?.user[0] : null,
    userExists: userExists ? userExists[0] : null,
    loggedInUser: req?.session?.passport?.user,
  });
}

const itemPage = async (req, res) => {
  try{
    const order = await Order.getOnlyOrder(req.params.orderId)
    const getCustomer = await Consumers.getConsumer(order[0].customer_id)
    const readibleDate = datetime.getHumanReadibleDateTime(order[0].created);
    const date = datetime.makeDate(order[0].created);
    const date2 = datetime.makeDateNumber(order[0].created);

    let totalCost = 0
console.log(order)
    order.forEach((item) => {
      totalCost += +item.count * +item.price
    })

    const userExists = await Users.userId(req?.session?.passport?.user);

    res.render("admin/about-order", {
      title: "Order",
      menu: menuItems,
      order: order,
      orderId: req.params.orderId,
      status: order[0].status,
      consumer: getCustomer,
      created: readibleDate,
      date: date,
      dateDay: date2,
      totalPrice: totalCost,
      user: req?.user ? req?.user[0] : null,
      userExists: userExists ? userExists[0] : null,
      loggedInUser: req?.session?.passport?.user,
    });
  } catch (err) {
    res.redirect("/errorPage");
    console.log(err);
  }
}

const itemPostPage = async (req, res) => {
  const order = await Order.updateStatus(req.body.selector, req.params.orderId);
  res.redirect("/admin/orderPage");
};

const getUsers = async (req, res) => {
  const userIsValid = await Users.userId(req?.session?.passport?.user)
  
  const users = await Users.loadUsers()
  const array = []

  users.forEach(async (item, index) => {
    array.push(item.id)
  })

  const authenticateUser = await Users.authenticateUser(array)
  console.log('userIs',authenticateUser)
  res.render("admin/users", {
    title: "Users",
    menu: menuItems,
    isAdmin: true,
    users,
    user: req?.user ? req?.user[0] : null,
    IsValid: authenticateUser ? authenticateUser : null,
    userExists: userIsValid ? userIsValid[0] : null,
    loggedInUser: req?.session?.passport?.user,
  });
}

const ediUser = async (req, res) => {
  const userIsValid = await Users.userId(req.params.userId);
  const userIsValid1 = await Users.userId(req?.session?.passport?.user);
  console.log('user',userIsValid, req?.session?.passport)
  
  res.render("admin/edit-user", {
    title: "Users",
    menu: menuItems,
    isAdmin: true,
    userIsValid,
    user: req?.user ? req?.user[0] : null,
    userExists: userIsValid1 ? userIsValid1[0] : null,
    loggedInUser: req?.session?.passport?.user,
  });
};

const postEditUser = async (req, res) => {
  const userIsValid = await Users.updateUserType(req.body.type, req.body?.note ?? '',req.body?.blocked ?? '', req.params.userId);
 
  res.redirect("/admin/users");
};

module.exports = {
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
}