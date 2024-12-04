import { Router } from 'express';
import { getTasks, 
        ValidarDatos, 
        BuscarClientesTodos, 
        aTablas, 
        consecutivos, 
        DatosProgreso, 
        PedidosEnviados, 
        DetalleDelPedidoVendedor, 
        PedidosCerrados, 
        PedidosPorEntregar,
        DetallePedidoEntregas, 
        ActualizarProcesoDelPedido, 
        DetallePedidoCerrado,
        ListOfAlias,
        ProductDataWeb,
        checkLogInData,
        changePassword,
        BottonCaroucel,
        SendSale,
        putNewClient,
        getClientList,
        putNewProduct,
        getProductList,
        getInventory,
        getPurchaseList,
        putNewSale,
        getSalesPerDay,
        postUpdateProduct,
        postUpdateInventory,
        putUpdateCient,
        getSubCategories,
        getPurchaseDetail,
        putAddPurchase,
        bestRoute,
        putUpdateVefied,
        putModifyPurchaseProduct,
        getShoppingList,
        inserSivarList,
        getCashFlow,
        putNewMoneyFlow,
        updateRemoveFlow,
        putNewOutput,
        putCancelTheSale,
        getCRDetail,
        getSalesByCategory,
        getBestProducts,
        ChechUserDataPos,
        verifyToken,
        postAddProduct,
        getDataLoginColtek,
        getClientOcupation,
        postToRemsionToElectronic,
        getSubClases} from '../controllers/tasks';


const router = Router();

/**
 * @swagger
 * tags:
 *  name: products
 *  description: products endpoints
 */

/**
 * @swagger
 * /tasks:
 * get:
 *  summary: Get all products
 *  tags: [products]
 */
router.get('/tasks', getTasks)

/**
 * @swagger
 * /tasks/count:
 *  get:
 *  summary: count all the products
 *  tags: [products]
 */
/*router.get('/tasks/search/:cod', searchTasks)*/

/**
 * @swagger
 * /tasks/:cod:
 *  get:
 *  summary: Get a product by cod
 *  tags: [products]
 */
/*router.get('/tasks/:cod', getTask)*/

/**
 * @swagger
 * /tasks:
 *  get:
 *  summary: save a new product
 *  tags: [products]
 */
/*router.get('/tasks/clientes/:cod', clientes)*/

router.post('/tasks/validar', ValidarDatos)

router.get('/tasks/BuscarClientesTodos/:cod', BuscarClientesTodos)

router.post('/tasks/aTablas', aTablas)

router.post('/tasks/con', consecutivos)

router.get('/tasks/DatosProgreso/:cod', DatosProgreso)

router.get('/tasks/PedidosEnviados/:cod', PedidosEnviados)

router.get('/tasks/DetallePedidoVendedor/:cod', DetalleDelPedidoVendedor)

router.get('/tasks/PedidosCerrados/:cod', PedidosCerrados)

router.get('/tasks/PedidosPorEntregar/:cod', PedidosPorEntregar)

router.get('/tasks/DetallePedidoEntregas/:cod', DetallePedidoEntregas)

router.post('/tasks/ActualizarProcesoDelPedido', ActualizarProcesoDelPedido)

router.get('/tasks/DetallePedidoCerrado/:cod', DetallePedidoCerrado)


//Routes for the webpage
router.post('/tasks/login', checkLogInData)

router.post('/tasks/Changepassword', changePassword)

router.get('/tasks/TAlias', ListOfAlias)

router.post('/tasks/productsdataweb', ProductDataWeb)

router.post('/tasks/BottonCaroucel', BottonCaroucel)

router.post('/tasks/SendSale', SendSale)

router.post('/tasks/bestroute', bestRoute)





//to the siver pos%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//*All about the aurotitation
router.post('/tasks/loginPos', ChechUserDataPos);

router.post('/tasks/verifytoken', verifyToken);
//*All retalet to clients
router.post('/pos/newclient', putNewClient);

router.post('/pos/clientlist', getClientList);

router.post('/pos/updateclient', putUpdateCient);

//*All about products
router.post('/pos/newproduct', putNewProduct);

router.post('/pos/productList', getProductList);

router.post('/pos/inventory', getInventory);

router.post('/pos/updateproduct', postUpdateProduct);

router.post('/pos/postupdateinventory', postUpdateInventory);

router.get('/pos/subcategories', getSubCategories);

router.post('/pos/shoppinglist', getShoppingList);

router.post('/pos/addproduct', postAddProduct);

//* All about purchases
router.post('/pos/purchaseList', getPurchaseList);

router.post('/pos/purchasedetail', getPurchaseDetail);

router.post('/pos/addpurchase', putAddPurchase);

router.post('/pos/updatevefied' , putUpdateVefied);

router.post('/pos/subclases' , getSubClases);

router.post('/pos/modifypurchaseproduct', putModifyPurchaseProduct);

//*All about sales
router.post('/pos/newsale', putNewSale);

router.post('/pos/salesperday', getSalesPerDay);

router.post('/pos/cashflow', getCashFlow);

router.post('/pos/newmoneyflow', putNewMoneyFlow);

router.post('/pos/removeflow', updateRemoveFlow);

router.post('/pos/newoutput', putNewOutput)

router.post('/pos/cancelthesale', putCancelTheSale)

router.post('/pos/crdetail', getCRDetail);

router.post('/pos/bestProducts', getBestProducts);

router.post('/pos/salesbycategory', getSalesByCategory)

router.get('/tasks/datalogincoltek', getDataLoginColtek)

router.get('/pos/clientocupation', getClientOcupation)

router.post('/pos/toremsiontoelectronic', postToRemsionToElectronic)



//*Other Functions
router.post('/pos/inserSivarList', inserSivarList);

export default router
