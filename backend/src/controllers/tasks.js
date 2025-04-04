import { connect, connectDBSivarPos } from "../database";
//import jwt from 'jsonwebtoken';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const ambiente = 2


export const getTasks = async(req, res) => {
    try {
        const connection = await connect()
        const [rows] = await connection.query(`SELECT
                                                p.cod,
                                                p.Descripcion,
                                                p.EsUnidadOpaquete,
                                                subc.SubCategoria,
                                                p.PCosto,
                                                p.PVenta,
                                                p.Agotado,
                                                p.Nota,
                                                p.Detalle,
                                                p.ImgName
                                              FROM
                                                productos AS p
                                              JOIN
                                                subcategorias AS subc ON subc.IDSubCategoria = p.subcategoria`);
        res.json(rows)
        connection.end()
      } catch (error) {
        console.log(error)
      }
};

export const ValidarDatos = async(req, res) => {
    try {
        const connection = await connect()
        const [rows] = await connection.query("SELECT Cod, Cargo, Nombre FROM colaboradores WHERE Usuario = ? AND Contraseña = ?", [req.body.Email, req.body.Contraseña]);
        res.json(rows)
    connection.end()
    } catch (error) {
        console.log(error)
    }
};

export const BuscarClientesTodos = async(req, res) => {
    try {
        const connection = await connect()
        const [rows] = await connection.query("SELECT c.Cod, c.Nit, c.Ferreteria, c.Contacto, c.Telefono, c.Cel, c.Email, c.Direccion, c.Barrio, (SELECT nombreRuta FROM rutas WHERE codRuta= c.ruta) AS Ruta, c.Geolocalizacion , c.Nota FROM clientes AS c WHERE CodVendedor = ?", [req.params.cod]);
        res.json(rows)
        connection.end()
    } catch (error) {
        console.log(error);
    }
};

export const aTablas = async(req, res) => {
    try {
        const connection = await connect()
        let cadena = "INSERT INTO " + req.body.tabla + " VALUES " + req.body.cadenaDeInsercion
        const [rows] = await connection.query(cadena);
        res.json(rows)
        connection.end()
    } catch (error) {
        console.log(error)
    }
};

export const consecutivos = async(req, res) => {
    try {
        const connection = await connect()
        const [rows] = await connection.query("SELECT MAX("+ req.body.Columna +") + 1  As consecutivo FROM "+ req.body.Tabla);/*"SELECT (SELECT NPreFactura FROM consecutivos) As PreFactura, (SELECT MAX(ODePedido) FROM tabladeingresados) AS ODePedido");*/
        res.json(rows)
        connection.end()
    } catch (error) {
        console.log(error)
    }
};

export const DatosProgreso = async(req, res) => {
    try {
        const connection = await connect()
        const [rows] = await connection.query("SELECT me.Meta, me.Meta2, (SELECT MAX(re.Valor_por_fecha) AS record FROM (SELECT SUM(sa.Cantidad*sa.VrUnitario) AS Valor_por_fecha , DATE_FORMAT(sa.FechaDeIngreso, '%m-%Y') AS Fecha, sa.CodColaborador FROM salidas AS sa WHERE CodColaborador <> '000' GROUP BY MONTH(FechaDeIngreso), CodColaborador) AS re) AS record ,IFNULL(Vm.VentasMes, 0) AS VentasMes FROM DM_Metas AS me LEFT JOIN (SELECT IFNULL(SUM(sa.Cantidad * sa.VrUnitario), 0) AS VentasMes, sa.CodColaborador FROM salidas AS sa WHERE sa.CodColaborador = ? AND MONTH(sa.FechaDeIngreso) = MONTH(NOW()) AND YEAR(sa.FechaDeIngreso) = YEAR(NOW()) GROUP BY sa.CodColaborador) AS Vm ON 1=1 WHERE YEAR(me.Fecha) = YEAR(NOW()) AND MONTH(me.Fecha) = MONTH(NOW())", [req.params.cod]);
        res.json(rows)
        connection.end()
    } catch (error) {
        console.log(error);
    }
};

export const PedidosEnviados = async(req, res) => {
    try {
        const connection = await connect()
        const [rows] = await connection.query(`SELECT con.NDePedido,
                                                      cli.Ferreteria,
                                                      cli.Direccion,
                                                      cli.Barrio,
                                                      con.FechaFactura,
                                                      con.FechaDeEntrega,
                                                      con.VrFactura,
                                                      con.Estado,
                                                      con.ProcesoDelPedido,
                                                      con.NotaVenta,
                                                      con.NotaEntrega FROM clientes  AS cli INNER JOIN (SELECT te.NDePedido, te.CodCliente, DATE_FORMAT(te.FechaFactura, '%d-%m-%Y') AS FechaFactura, DATE_FORMAT(te.FechaDeEntrega, '%d-%m-%Y') AS FechaDeEntrega, SUM(ti.Cantidad*ti.VrUnitario) AS VrFactura , te.Estado, te.ProcesoDelPedido, te.NotaVenta, te.NotaEntrega FROM tabladeestados AS te INNER JOIN tabladeingresados AS ti ON te.NDePedido= ti.NDePedido AND te.Estado <> 'Cerrado' AND te.Estado <> 'Anulado' AND te.CodColaborador = ? GROUP BY te.NDePedido) AS con ON cli.Cod = con.CodCliente`, [req.params.cod]);
        res.json(rows)
        connection.end()
    } catch (error) {
        console.log(error);
    }
};

export const PedidosCerrados = async(req, res) => {
    try {
        const connection = await connect()
        const [rows] = await connection.query("SELECT con.NDePedido ,cli.Ferreteria, cli.Direccion, cli.Barrio, con.FechaFactura, con.FechaDeEntrega, con.VrFactura , con.Estado, con.ProcesoDelPedido, con.NotaVenta, con.NotaEntrega FROM clientes  AS cli INNER JOIN (SELECT te.NDePedido, te.CodCliente, DATE_FORMAT(te.FechaFactura, '%d-%m-%Y') AS FechaFactura, DATE_FORMAT(te.FechaDeEntrega, '%d-%m-%Y') AS FechaDeEntrega, SUM(ti.Cantidad*ti.VrUnitario) AS VrFactura , te.Estado, te.ProcesoDelPedido, te.NotaVenta, te.NotaEntrega FROM tabladeestados AS te INNER JOIN salidas AS ti ON te.NDePedido= ti.NDePedido AND te.Estado = 'Cerrado' AND MONTH(te.FechaDeEstado) = MONTH(NOW()) AND YEAR(te.FechaDeEstado) = YEAR(NOW()) AND te.CodColaborador = ? GROUP BY te.NDePedido) AS con ON cli.Cod = con.CodCliente", [req.params.cod]);
        res.json(rows)
        connection.end()
    } catch (error) {
        console.log(error);
    }
};

export const DetalleDelPedidoVendedor = async(req, res) => {
    try {
        const connection = await connect()
        const [rows] = await connection.query("SELECT ti.Codigo, pro.Descripcion ,ti.Cantidad, ti.VrUnitario FROM tabladeingresados AS ti LEFT JOIN productos AS pro ON ti.Codigo = pro.Cod WHERE ti.NDePedido = ?", [req.params.cod]);
        res.json(rows)
        connection.end()
    } catch (error) {
        console.log(error)
    }
};

export const PedidosPorEntregar = async(req, res) => {
    try {
        const connection = await connect()
        const [rows] = await connection.query("SELECT con.NDePedido ,cli.Ferreteria, cli.Direccion, cli.Barrio, con.FechaFactura, con.FechaDeEntrega, con.VrFactura , con.Estado, con.ProcesoDelPedido, con.NotaVenta, con.NotaEntrega FROM clientes  AS cli INNER JOIN (SELECT te.NDePedido, te.CodCliente, DATE_FORMAT(te.FechaFactura, '%d-%m-%Y') AS FechaFactura, DATE_FORMAT(te.FechaDeEntrega, '%d-%m-%Y') AS FechaDeEntrega, SUM(ti.Cantidad*ti.VrUnitario) AS VrFactura , te.Estado, te.ProcesoDelPedido, te.NotaVenta, te.NotaEntrega FROM tabladeestados AS te INNER JOIN flujodeestados AS ti ON te.NDePedido= ti.NDePedido AND te.Estado = 'Verificado' AND te.Repartidor = ? GROUP BY te.NDePedido) AS con ON cli.Cod = con.CodCliente", [req.params.cod]);
        res.json(rows)
        connection.end()
    } catch (error) {
        console.log(error)
    }
};

export const DetallePedidoEntregas = async(req, res) => {
    try {
        const connection = await connect()
        const [rows] = await connection.query("SELECT fe.Codigo, pro.Descripcion ,fe.Cantidad, fe.VrUnitario FROM flujodeestados AS fe LEFT JOIN productos AS pro ON fe.Codigo = pro.Cod WHERE fe.NDePedido = ?", [req.params.cod]);
        res.json(rows)
        connection.end()
    } catch (error) {
        console.log(error)
    }
};

export const ActualizarProcesoDelPedido = async(req, res) => {
    try {
        const connection = await connect()
        const [rows] = await connection.query("UPDATE tabladeestados SET NotaEntrega = ?, ProcesoDelPedido = ? WHERE NDepedido =  ?", [req.body.NotaEntrega, req.body.ProcesoDelPedido, req.body.NDepedido]);
        res.json(rows)
        connection.end()
    } catch (error) {
        console.log(error)
    }
};

export const DetallePedidoCerrado = async(req, res) => {
    try {
        const connection = await connect()
        const [rows] = await connection.query("SELECT sa.Codigo, pro.Descripcion ,sa.Cantidad, sa.VrUnitario FROM salidas AS sa LEFT JOIN productos AS pro ON sa.Codigo = pro.Cod WHERE sa.NDePedido = ?", [req.params.cod]);
        res.json(rows)
        connection.end()
    } catch (error) {
        console.log(error)
    }
};

//Todo: create just one quiery to send the product data if the client is logged in or not
export const ProductDataWeb = async(req, res) => {
  /*Return the whole list of product only with the necessary information deppending on if the user is logged in or not */
  try {
      //if (req.body.logged == true) {
          const connection = await connect()
          const [rows] = await connection.query(`WITH RankedResults AS (
                                                    SELECT
                                                        *,
                                                        ROW_NUMBER() OVER (PARTITION BY Cod ORDER BY Score DESC) AS RowNum
                                                    FROM (
                                                        SELECT
                                                            p.Cod,
                                                            p.Descripcion,
                                                            p.EsUnidadOpaquete,
                                                            c.Categoria,
                                                            p.PVenta,
                                                            p.Iva,
                                                            p.Agotado,
                                                            p.Detalle,
                                                            p.ImgName,
                                                            (
                                                                0.3 * IFNULL((p.PVenta - p.PCosto) / p.PVenta * 100, 0) +
                                                                0.5 * (
                                                                    COUNT(CASE 
                                                                        WHEN DATE_FORMAT(sa.FechaDeIngreso, '%Y-%m') >= DATE_FORMAT(NOW() - INTERVAL 6 MONTH, '%Y-%m') AND sa.Codigo IS NOT NULL AND sa.CodCliente = ? THEN sa.Codigo
                                                                    END) / (SELECT COUNT(sa.Codigo) FROM salidas AS sa WHERE DATE_FORMAT(sa.FechaDeIngreso, '%Y-%m') >= DATE_FORMAT(NOW() - INTERVAL 6 MONTH, '%Y-%m') AND sa.CodCliente = ?)
                                                                ) / 6 +
                                                                0.2 * IFNULL(
                                                                    SUM(CASE 
                                                                        WHEN DATE_FORMAT(sa.FechaDeIngreso, '%Y-%m') >= DATE_FORMAT(NOW() - INTERVAL 6 MONTH, '%Y-%m') AND sa.Codigo IS NOT NULL AND sa.CodCliente = ? THEN sa.Cantidad * (sa.VrUnitario - sa.Costo) 
                                                                    END), 0)
                                                            ) / (SELECT COUNT(Codigo) FROM salidas WHERE CodCliente = ? AND NDePedido <> '0') AS Score
                                                        FROM 
                                                            productos AS p
                                                        JOIN
                                                            salidas AS sa ON p.Cod = sa.Codigo
                                                        JOIN
                                                            subcategorias AS sub ON p.subcategoria = sub.IDSubCategoria
                                                        JOIN
                                                            categoria AS c ON sub.IDCategoria = c.IDCategoria
                                                        WHERE
                                                            sa.CodCliente = ? AND p.Cod <> '1'
                                                        GROUP BY p.Cod
                                                
                                                        UNION ALL
                                                
                                                        SELECT
                                                            p.Cod,
                                                            p.Descripcion,
                                                            p.EsUnidadOpaquete,
                                                            c.Categoria,
                                                            p.PVenta,
                                                            p.Iva,
                                                            p.Agotado,
                                                            p.Detalle,
                                                            p.ImgName,
                                                            (
                                                                0.3 * IFNULL((p.PVenta - p.PCosto) / p.PVenta * 100, 0) +
                                                                0.5 * (
                                                                    COUNT(CASE 
                                                                        WHEN DATE_FORMAT(sa.FechaDeIngreso, '%Y-%m') >= DATE_FORMAT(NOW() - INTERVAL 6 MONTH, '%Y-%m') AND sa.Codigo IS NOT NULL AND sa.CodCliente <> ? THEN sa.Codigo
                                                                    END) / (SELECT COUNT(sa.Codigo) FROM salidas AS sa WHERE DATE_FORMAT(sa.FechaDeIngreso, '%Y-%m') >= DATE_FORMAT(NOW() - INTERVAL 6 MONTH, '%Y-%m') AND sa.CodCliente <> ?)
                                                                ) / 6 +
                                                                0.2 * IFNULL(
                                                                    SUM(CASE 
                                                                        WHEN DATE_FORMAT(sa.FechaDeIngreso, '%Y-%m') >= DATE_FORMAT(NOW() - INTERVAL 6 MONTH, '%Y-%m') AND sa.Codigo IS NOT NULL AND sa.CodCliente <> ? THEN sa.Cantidad * (sa.VrUnitario - sa.Costo) 
                                                                    END), 0)
                                                            ) / (SELECT COUNT(Codigo) FROM salidas WHERE CodCliente <> ? AND NDePedido <> '0') AS Score
                                                        FROM 
                                                            productos AS p
                                                        JOIN
                                                            salidas AS sa ON p.Cod = sa.Codigo
                                                        JOIN
                                                            subcategorias AS sub ON p.subcategoria = sub.IDSubCategoria
                                                        JOIN
                                                            categoria AS c ON sub.IDCategoria = c.IDCategoria
                                                        WHERE
                                                            sa.CodCliente <> ? AND p.Cod <> '1'
                                                        GROUP BY p.Cod
                                                    ) AS CombinedResults
                                                )
                                                SELECT
                                                    Cod,
                                                    Descripcion,
                                                    EsUnidadOpaquete,
                                                    Categoria,
                                                    PVenta,
                                                    Iva,
                                                    Agotado,
                                                    Detalle,
                                                    ImgName,
                                                    Score
                                                FROM
                                                    RankedResults
                                                WHERE
                                                    RowNum = 1 AND Cod <> '1'
                                                ORDER BY
                                                    Score DESC;`,[req.body.CodUser,
                                                                  req.body.CodUser,
                                                                  req.body.CodUser,
                                                                  req.body.CodUser,
                                                                  req.body.CodUser,
                                                                  req.body.CodUser,
                                                                  req.body.CodUser,
                                                                  req.body.CodUser,
                                                                  req.body.CodUser,
                                                                  req.body.CodUser]);
          res.json(rows)
          connection.end()
  } catch (error) {
      console.log(error)
  }
};

export const ListOfAlias = async(req, res) => {
    /*Return list of alias of the products*/
    try {
        const connection = await connect()
        const [rows] = await connection.query(`SELECT 
                                                al.Cod,
                                                al.Alias,
                                                ca.Categoria
                                              FROM
                                                alias AS al
                                              JOIN
                                                productos AS pro ON al.Cod = pro.Cod
                                              JOIN
                                                subcategorias AS sc ON sc.IDSubCategoria = pro.SubCategoria
                                              JOIN
                                                categoria AS ca ON ca.IDCategoria = sc.IDCategoria `);
        res.json(rows)
        connection.end()
    } catch (error) {
        console.log(error)
    }
};

//Todo: Function for checking if the data of connection is correct.
export const checkLogInData = async (req, res) => {
    /*Check if the data of connection is correct, and if it's then return the data of the user.*/
    try {
      const connection = await connect();  // Assuming you have a connect function
      const [rows] = await connection.query(`SELECT Cli.Cod,
                                                    Cli.Ferreteria,
                                                    Cli.Contacto,
                                                    Cli.Direccion,
                                                    Cli.Telefono,
                                                    Cli.Cel,
                                                    Cli.Email,
                                                    Cli.Contraseña,
                                                    Co.Nombre As Asesor
                                              FROM
                                                    clientes AS Cli
                                              LEFT JOIN
                                                    colaboradores AS Co ON Cli.CodVendedor = Co.Cod
                                              WHERE Cli.Email = ?`, [req.body.EmailUser]);
      connection.end();
      
      // Check if the password matches with the password that the user gave
      if (rows.length > 0) {
        const dbPassword = rows[0].Contraseña;  // Use index 0 to access the first row
       
        bcrypt.compare(req.body.Password, dbPassword, function(err, result) {
          if (err) {
            // Handle error
            //console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
          } else if (result) {
            // Passwords match
            delete rows[0].Contraseña
            res.json(rows[0]);
            
          } else {
            // Passwords do not match
            res.status(401).json({ error: 'Unauthorized' });
          }
          //connection.end();
        });
      } else {
        // No user found with the provided email
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('entro en este' & error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};

//Todo: Function for changind the password.
export const changePassword = async (req, res) => {
    /*Check if the data of connection is correct, and if it's then hash the new password and change it into the database.*/
    try {
      const connection = await connect(); // Assuming you have a connect function
      const [rows] = await connection.query("SELECT Contraseña FROM clientes WHERE Cod = ?", [req.body.CodUser]);
      connection.end();
  
      // Check if the password matches with the password that the user gave
      if (rows.length > 0) {
        const dbPassword = rows[0].Contraseña; // Use index 0 to access the first row
  
        try {
          const result = await new Promise((resolve, reject) => {
            bcrypt.compare(req.body.Password, dbPassword, function (err, result) {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            });
          });
  
          if (result) {
            // Passwords match
            //delete rows[0].Contraseña;
            // To hash the new password
            const plainPassword = req.body.NewPassword;
            const hashedPassword = await new Promise((resolve, reject) => {
              bcrypt.hash(plainPassword, 10, function (err, hashedPassword) {
                if (err) {
                  reject(err);
                } else {
                  resolve(hashedPassword);
                }
              });
            });
  
            const connection = await connect();
            const [upRows] = await connection.query("UPDATE clientes SET Contraseña = ? WHERE Cod =  ?", [hashedPassword, req.body.CodUser]);
            //res.json(upRows);
            res.status(200).json({ authorization: 'Authorized'})
            connection.end();
            
          } else {
            // Passwords do not match
            res.status(401).json({ error: 'Unauthorized' });
          }
        } catch (err) {
          // Handle errors from bcrypt operations
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      } else {
        // No user found with the provided email
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('entro en este' & error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};
  
//Todo: select the first five best productos of each category
export const BottonCaroucel = async(req, res) => {
  /*Return list of the first five best productos of each category*/
  try {
    if (req.body.logged == true) {
      const connection = await connect()
      const [rows] = await connection.query(`WITH ranked_products AS (
                                                  SELECT
                                                      p.Cod,
                                                      p.Descripcion,
                                                      p.EsUnidadOpaquete,
                                                      c.Categoria,
                                                      p.PVenta,
                                                      p.Iva,
                                                      p.Agotado,
                                                      p.Detalle,
                                                      p.ImgName,
                                                      (0.3 * IFNULL((p.PVenta - p.PCosto) / p.PVenta * 100, 0) + 0.5 * COUNT(sa.Codigo) / 6 + 0.2 * IFNULL(SUM(sa.Cantidad * (sa.VrUnitario - sa.Costo)), 0)) / 1000 AS Score,
                                                      ROW_NUMBER() OVER (PARTITION BY c.Categoria ORDER BY (((0.3 * IFNULL((p.PVenta-p.PCosto)/p.PVenta *100,0) + 0.5 * COUNT(sa.Codigo)/6 + 0.2 * IFNULL(SUM(sa.Cantidad*(sa.VrUnitario-sa.Costo)),0))/1000)) DESC) AS row_num
                                                  FROM
                                                      productos AS p
                                                  JOIN
                                                      salidas AS sa ON p.Cod = sa.Codigo
                                                  JOIN
                                                      subcategorias AS sub ON p.subcategoria = sub.IDSubCategoria
                                                  JOIN
                                                      categoria AS c ON sub.IDCategoria = c.IDCategoria
                                                  WHERE
                                                      sa.NDePedido <> '0'
                                                      AND DATE_FORMAT(sa.FechaDeIngreso, '%Y-%m') >= DATE_FORMAT(NOW() - INTERVAL 6 MONTH, '%Y-%m')
                                                      AND (
                                                      NOT EXISTS (SELECT 1 FROM salidas WHERE NDePedido <> '0' AND NDePedido IN (SELECT NDePedido FROM tabladeestados WHERE CodCliente = ?))
                                                      OR p.cod IN (SELECT Codigo FROM salidas WHERE NDePedido <> '0' AND NDePedido IN (SELECT NDePedido FROM tabladeestados WHERE CodCliente = ?))
                                                  )
                                                  GROUP BY
                                                      p.cod
                                                )
                                                SELECT
                                                  Cod,
                                                  Descripcion,
                                                  EsUnidadOpaquete,
                                                  Categoria,
                                                  PVenta,
                                                  Iva,
                                                  Agotado,
                                                  Detalle,
                                                  ImgName,
                                                  Score
                                                FROM
                                                  ranked_products
                                                WHERE
                                                  row_num <= 5 AND Cod <> '1';`,[req.body.CodUser,req.body.CodUser]);
      res.json(rows)
      connection.end()
    }
    else {
      const connection = await connect()
      const [rows] = await connection.query(`WITH ranked_products AS (
                                                SELECT p.cod, 
                                              p.Descripcion,
                                              p.EsUnidadOpaquete,
                                              (SELECT Categoria FROM categoria WHERE IDCategoria = sub.IDCategoria) AS Categoria,
                                              p.PVenta,
                                              p.Iva,
                                              p.Agotado,
                                              p.Detalle,
                                              p.ImgName,
                                              (0.3 * IFNULL((p.PVenta-p.PCosto)/p.PVenta *100,0) + 0.5 * COUNT(sa.Codigo)/6 + 0.2 * IFNULL(SUM(sa.Cantidad*(sa.VrUnitario-sa.Costo)),0))/1000 AS Score,
                                              ROW_NUMBER() OVER (PARTITION BY (SELECT Categoria FROM categoria WHERE IDCategoria = sub.IDCategoria) ORDER BY ((0.3 * IFNULL((p.PVenta-p.PCosto)/p.PVenta *100,0) + 0.5 * COUNT(sa.Codigo)/6 + 0.2 * IFNULL(SUM(sa.Cantidad*(sa.VrUnitario-sa.Costo)),0))/1000) DESC) AS row_num
                                              FROM 
                                                productos AS p
                                              JOIN
                                                salidas AS sa ON p.Cod = sa.Codigo 
                                              JOIN 
                                                subcategorias AS sub ON p.subcategoria = sub.IDSubCategoria
                                              WHERE
                                                sa.NDePedido <> '0' AND DATE_FORMAT(sa.FechaDeIngreso, '%Y-%m') >= DATE_FORMAT(NOW() - INTERVAL 6 MONTH, '%Y-%m')
                                              GROUP BY 
                                                sa.Codigo
                                            )
                                            SELECT
                                                Cod,
                                                Descripcion,
                                                EsUnidadOpaquete,
                                                Categoria,
                                                PVenta,
                                                Iva,
                                                Agotado,
                                                Detalle,
                                                ImgName,
                                                Score
                                            FROM
                                                ranked_products
                                            WHERE
                                                row_num <= 5 AND Cod <> '1';`);
      res.json(rows)
      connection.end()
    }
  } catch (error) {
      console.log(error)
  }


};

export const SendSale = async (req, res) => {
  try {
    const { TIngresados } = req.body;
    const connection = await connect();

    // Insert new estado
    const [rows] = await connection.query(
      `INSERT INTO tabladeestados (SELECT MAX(te.NDePedido) + 1,
                                          ?,
                                          ?,
                                          'Contado',
                                          'Ingresado',
                                          ?,
                                          ?,
                                          '',
                                          cli.CodVendedor,
                                          cli.Iva,
                                          ?,
                                          '',
                                          ?,
                                          '',
                                          ?
                                          FROM
                                            tabladeestados AS te
                                          JOIN
                                            clientes as cli
                                          ON cli.Cod = ?)`,
      [req.body.CodCliente,
       req.body.FechaFactura,
       req.body.FechaDeEstado,
       req.body.FechaDeEntrega,
       req.body.FechaVencimiento,
       req.body.NotaVenta,
       req.body.VECommerce,
       req.body.CodCliente
      ]
    );

    // Get the new NDePedido
    const [NDePedidoRows] = await connection.query("SELECT MAX(NDePedido) AS NDePedido FROM tabladeestados");
    const NDePedido = NDePedidoRows[0].NDePedido;

    // Split the input string by semicolon to get individual entries
    const entries = TIngresados.split(';');

    // Iterate through each entry and construct the SQL statement
    const formattedEntries = entries.map(entry => {
        // Split the entry by commas to get individual elements
        const [quantity, cod, price] = entry.split(',');
        // Construct the SQL statement for each entry
        return `SELECT '${NDePedido}', '${quantity}', '${cod}', '${price}', PCosto FROM productos WHERE cod = '${cod}'`;
    });

    // Join the formatted entries with UNION ALL
    const finalQuery = formattedEntries.join('\nUNION ALL\n');
    // Insert ingresados
    await connection.query(`INSERT INTO tabladeingresados (NDePedido, Cantidad, Codigo, VrUnitario, Costo) ${finalQuery}`);
    // Close the connection
    connection.end();

    res.json({ success: true, NDePedido: NDePedido});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//!to the sivar pos %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

export const putNewClient = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
      const [newClient] = await connection.query(`INSERT INTO clientes (IdFerreteria,
                                                                        Tipo,
                                                                        NitCC,
                                                                        Nombre,
                                                                        Apellido,
                                                                        Telefono1,
                                                                        Telefono2,
                                                                        Correo,
                                                                        Direccion,
                                                                        Barrio,
                                                                        FormaDePago,
                                                                        LimiteDeCredito,
                                                                        Nota,
                                                                        Fecha,
                                                                        Dv,
                                                                        Ocupacion,
                                                                        ResFiscal)
                                                          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[req.body.IdFerreteria,
                                                                                                      req.body.Tipo,
                                                                                                      req.body.NitCC,
                                                                                                      req.body.Nombre,
                                                                                                      req.body.Apellido,
                                                                                                      req.body.Telefono1,
                                                                                                      req.body.Telefono2,
                                                                                                      req.body.Correo,
                                                                                                      req.body.Direccion,
                                                                                                      req.body.Barrio,
                                                                                                      req.body.FormaDePago,
                                                                                                      req.body.LimiteDeCredito,
                                                                                                      req.body.Nota,
                                                                                                      req.body.Fecha,
                                                                                                      req.body.Dv,
                                                                                                      req.body.Ocupacion,
                                                                                                      req.body.ResFiscal]);
      
      res.status(200).json(newClient);
  } catch (error) {
      console.log(error);
      res.status(500).json(error);
  } finally {
    connection.end();
  }
};

export const getClientList = async (req, res) => {
  try {
      const connection = await connectDBSivarPos();
      const [clientList] = await connection.query(`SELECT
                                              cli.Consecutivo,
                                              cli.Tipo,
                                              cli.NitCC,
                                              cli.Nombre,
                                              cli.Apellido,
                                              cli.Telefono1,
                                              cli.Telefono2,
                                              cli.Correo,
                                              cli.Direccion,
                                              cli.Barrio,
                                              cli.FormaDePago,
                                              cli.LimiteDeCredito,
                                              cli.Nota,
                                              cli.Fecha,
                                              cli.Dv,
                                              cli.Ocupacion,
                                              cli.ResFiscal
                                          FROM
                                              clientes AS cli
                                          WHERE
                                              cli.IdFerreteria = ?`,[req.body.IdFerreteria])
      res.status(200).json(clientList);
      connection.end();
  } catch (error) {
      console.log(error);
      res.status(500).json(error);
  }
}

export const putUpdateCient = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
    const sql1 = `UPDATE
                    clientes
                  SET
                    Tipo = ?,
                    NitCC = ?,
                    Nombre = ?,
                    Apellido = ?,
                    Telefono1 = ?,
                    Telefono2 = ?,
                    Correo = ?,
                    Direccion = ?,
                    Barrio = ?,
                    FormaDePago = ?,
                    LimiteDeCredito = ?,
                    Nota = ?,
                    Dv = ?,
                    Ocupacion =?,
                    ResFiscal =?
                  WHERE
                    Consecutivo = ?
                  AND
                    IdFerreteria = ?`
    const values1 = [req.body.Tipo,
                     req.body.NitCC,
                     req.body.Nombre,
                     req.body.Apellido,
                     req.body.Telefono1,
                     req.body.Telefono2,
                     req.body.Correo,
                     req.body.Direccion,
                     req.body.Barrio,
                     req.body.FormaDePago,
                     req.body.LimiteDeCredito,
                     req.body.Nota,
                     req.body.Dv,
                     req.body.Ocupacion,
                     req.body.ResFiscal,
                     req.body.Consecutivo,
                     req.body.IdFerreteria
                    ];
    await connection.execute(sql1, values1);
    await connection.commit();
    res.status(200).json({ message: 'Transacción completada con éxito' });
  } catch (error) {
      // In case of error, the transaction is returned
      await connection.rollback();
      console.log("este es el error del nuevo producto ", error);
      res.status(500).json(error);
  } finally {
      // Close the connection
      await connection.end();
  } 
}

//* All about products 
export const putNewProduct = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
      //Start the transaction
      await connection.beginTransaction();

      //First insertion to the table productos
      const sql1 = `INSERT INTO productos (IdFerreteria,
                                          Cod,
                                          Descripcion,
                                          Clase,
                                          SubCategoria,
                                          Detalle,
                                          Iva,
                                          SVenta) 
                                  VALUES (?,?,?,?,?,?,?,?)`
      const values1 = [req.body.IdFerreteria,
                       req.body.Cod,
                       req.body.Descripcion,
                       req.body.Clase,
                       req.body.IdSubCategoria,
                       req.body.Detalle,
                       req.body.Iva,
                       0]

      await connection.execute(sql1, values1);

      //Second query of the consecutive of the new product
      const [productRows] = await connection.query("SELECT MAX(Consecutivo) AS Consecutivo FROM productos");
      const Consecutivo = productRows[0].Consecutivo;

      //Third insertion to the table detalleproductoferreteria
      const sql2 = `INSERT INTO detalleproductoferreteria (Consecutivo,
                                                          IdFerreteria,
                                                          PCosto,
                                                          PVenta,
                                                          InvMinimo,
                                                          InvMaximo,
                                                          Ubicacion)
                                      VALUES (?,?,?,?,?,?,?)`
      const values2 = [Consecutivo,
                       req.body.IdFerreteria,
                       req.body.PCosto,
                       req.body.PVenta,
                       req.body.InvMinimo,
                       req.body.InvMaximo,
                       req.body.Ubicacion]

      await connection.execute(sql2, values2);

      const sqlMedidas = `INSERT INTO
                            medida
                            (Consecutivo,
                            IdFerreteria,
                            Medida,
                            UMedida,
                            PrecioUM)
                            VALUES (?,?,?,?,?)`
      
      if (req.body.Medidas.length > 0){

        for (const entry of req.body.Medidas) {
          const MedidasValues = [
            Consecutivo,
            req.body.IdFerreteria,
            entry.Medida,
            entry.UMedida,
            entry.PVentaUM
          ]
          await connection.execute(sqlMedidas, MedidasValues)
        }
      }

      //Fourth query of the consecutive of the new product in entradas but the inner consecutive
      const [codInternoRows] = await connection.query("SELECT IFNULL(MAX(CodInterno)+1,0) AS NextCodInterno FROM entradas WHERE IdFerreteria = ?", [req.body.IdFerreteria]);
      const NextCodInterno = codInternoRows[0].NextCodInterno;

      //Fifth insertion to the table detalleproductoferreteria
      const sql3 = `INSERT INTO entradas (CodInterno,
                                          IdFerreteria,
                                          ConsecutivoProd,
                                          Cantidad,
                                          Cod,
                                          Descripcion,
                                          PCosto,
                                          PCostoLP,
                                          Fecha,
                                          Iva,
                                          CodResponsable,
                                          Responsable,
                                          Motivo,
                                          ConsecutivoCompra,
                                          Medida,
                                          UMedida)
                                      VALUES (?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?)`
      const values3 = [NextCodInterno,
                       req.body.IdFerreteria,		      
                       Consecutivo,
                       req.body.Inventario,
                       req.body.Cod,
                       req.body.Descripcion,
                       req.body.PCosto,
                       0,
                       req.body.Fecha,
                       req.body.Iva,
                       req.body.CodResponsable,
                       req.body.Responsable,
                       req.body.Motivo,
                       0,
                       '',
                       1]
      await connection.execute(sql3, values3);
      // Confirm the transaction
      await connection.commit();
      res.status(200).json({ message: 'Transacción completada con éxito' });
  } catch (error) {
      // In case of error, the transaction is returned
      await connection.rollback();
      console.log("este es el error del nuevo producto ", error);
      res.status(500).json(error);
  } finally {
      // Close the connection
      await connection.end();
  }
}

export const getProductList = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
      const [productList] = await connection.query(`SELECT
                                                        pro.Consecutivo,
                                                        pro.IdFerreteria,
                                                        pro.Cod,
                                                        pro.Descripcion,
                                                        IFNULL(dpro.PCosto, 0) AS PCosto,
                                                        IFNULL(dpro.PVenta, 0) AS PVenta,
                                                        IFNULL(dpro.Ubicacion, '') AS Ubicacion,
                                                        IFNULL(dpro.InvMinimo, 0) AS InvMinimo,
                                                        IFNULL(dpro.InvMaximo, 0) AS InvMaximo,
                                                        ca.Categoria,
                                                        ca.IdCategoria,
                                                        subca.SubCategoria,
                                                        subca.IdSubCategoria,
                                                        pro.Clase,
                                                        cla.Nombre AS NombreClase,
                                                        pro.Detalle,
                                                        CAST(COALESCE(en.entradas, 0) - COALESCE(sa.salidas, 0) AS DOUBLE) AS Inventario,
                                                        CASE 
                                                            WHEN EXISTS (
                                                                SELECT 1
                                                                FROM detalleproductoferreteria detPro
                                                                WHERE detPro.Consecutivo = pro.Consecutivo AND detPro.IdFerreteria = ?
                                                            ) THEN TRUE
                                                            ELSE FALSE
                                                        END AS ExisteEnDetalle
                                                    FROM
                                                        productos AS pro
                                                        LEFT JOIN
                                                          detalleproductoferreteria AS dpro
                                                          ON pro.Consecutivo = dpro.Consecutivo AND dpro.IdFerreteria = ?
                                                        JOIN subcategorias AS subca ON pro.SubCategoria = subca.IdSubCategoria
                                                        JOIN categorias AS ca ON subca.IdCategoria = ca.IdCategoria
                                                        LEFT JOIN (
                                                            SELECT 
                                                                e.ConsecutivoProd,
                                                                SUM(e.Cantidad / e.UMedida) AS entradas
                                                            FROM 
                                                                entradas e
                                                            WHERE EXISTS (
                                                                SELECT 1
                                                                FROM detalleproductoferreteria detPro
                                                                WHERE detPro.Consecutivo = e.ConsecutivoProd AND e.CodResponsable = ?
                                                            )
                                                            GROUP BY 
                                                                e.ConsecutivoProd
                                                        ) AS en ON pro.Consecutivo = en.ConsecutivoProd
                                                        LEFT JOIN (
                                                            SELECT 
                                                                s.ConsecutivoProd,
                                                                SUM(s.Cantidad / s.UMedida) AS salidas
                                                            FROM 
                                                                salidas s
                                                            WHERE EXISTS (
                                                                SELECT 1
                                                                FROM detalleproductoferreteria detPro
                                                                WHERE detPro.Consecutivo = s.ConsecutivoProd AND s.CodResponsable = ?
                                                            )
                                                            GROUP BY 
                                                                s.ConsecutivoProd
                                                        ) AS sa ON pro.Consecutivo = sa.ConsecutivoProd
                                                        LEFT JOIN clases AS cla ON cla.Id = pro.Clase
                                                    WHERE
                                                        pro.IdFerreteria = '0' OR pro.IdFerreteria = ?`, [req.body.IdFerreteria,
                                                                                                          req.body.IdFerreteria,
                                                                                                          req.body.IdFerreteria,
                                                                                                          req.body.IdFerreteria,
                                                                                                          req.body.IdFerreteria])
      const [MedidasList] = await connection.query(`SELECT
                                                      Consecutivo,
                                                      Medida,
                                                      UMedida,
                                                      PrecioUM AS PVentaUM
                                                    FROM
                                                      medida
                                                    WHERE
                                                      IdFerreteria = ?`, [req.body.IdFerreteria])

      // Crear un mapa para agrupar las medidas por Consecutivo
      const measuresMap = MedidasList.reduce((map, measure) => {
        if (!map[measure.Consecutivo]) {
          map[measure.Consecutivo] = [];
        }
        map[measure.Consecutivo].push({
          Medida: measure.Medida,
          UMedida: measure.UMedida,
          PVentaUM: measure.PVentaUM,
        });
        return map;
      }, {});

      // Agregar las medidas correspondientes a cada producto
      for (let product of productList) {
        product.Medidas = measuresMap[product.Consecutivo] || [];
      }
      res.status(200).json(productList);
  } catch (error) {
      console.log(error);
      res.status(500).json(error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

export const getInventory = async (req, res) => {
  try {
      const connection = await connectDBSivarPos();
      const [InventoryList] = await connection.query(`SELECT
                                                        pro.Consecutivo,
                                                        pro.IdFerreteria,
                                                        pro.Cod,
                                                        pro.Descripcion,
                                                        -- Cálculo de Inventario basado en subconsultas adaptadas
                                                        COALESCE(
                                                            (
                                                                SELECT
                                                                    COALESCE(en.entradas, 0) - COALESCE(sa.salidas, 0) AS Cantidad
                                                                FROM
                                                                    -- Subconsulta de entradas
                                                                    (
                                                                        SELECT
                                                                            e.ConsecutivoProd,
                                                                            SUM(e.Cantidad / e.UMedida) AS entradas
                                                                        FROM
                                                                            entradas e
                                                                        WHERE
                                                                            e.ConsecutivoProd = pro.Consecutivo
                                                                            AND e.CodResponsable = ?
                                                                        GROUP BY
                                                                            e.ConsecutivoProd
                                                                    ) AS en
                                                                    -- Subconsulta de salidas
                                                                    LEFT JOIN (
                                                                        SELECT
                                                                            s.ConsecutivoProd,
                                                                            SUM(s.Cantidad / s.UMedida) AS salidas
                                                                        FROM
                                                                            salidas s
                                                                        WHERE
                                                                            s.ConsecutivoProd = pro.Consecutivo
                                                                            AND s.CodResponsable = ?
                                                                        GROUP BY
                                                                            s.ConsecutivoProd
                                                                    ) AS sa
                                                                    ON en.ConsecutivoProd = sa.ConsecutivoProd
                                                            ),
                                                            0
                                                        ) AS Inventario,
                                                        det.PCosto,
                                                        det.PVenta,
                                                        det.InvMinimo,
                                                        det.InvMaximo,
                                                        pro.Iva,
                                                        pro.Clase,
                                                        pro.Detalle,
                                                        pro.SubCategoria AS IdSubCategoria,
                                                        sc.SubCategoria,
                                                        sc.IdCategoria,
                                                        ca.Categoria,
                                                        det.Ubicacion,
                                                        1 AS ExisteEnDetalle
                                                    FROM
                                                        productos AS pro
                                                        LEFT JOIN detalleproductoferreteria AS det ON pro.Consecutivo = det.Consecutivo
                                                        LEFT JOIN subcategorias AS sc ON pro.SubCategoria = sc.IdSubCategoria
                                                        LEFT JOIN categorias AS ca ON ca.IdCategoria = sc.IdCategoria
                                                    WHERE
                                                        det.IdFerreteria = ?
                                                    GROUP BY
                                                        pro.Consecutivo`,[req.body.IdFerreteria, req.body.IdFerreteria, req.body.IdFerreteria])
      const [MedidasList] = await connection.query(`SELECT
                                                      Consecutivo,
                                                      Medida,
                                                      UMedida,
                                                      PrecioUM AS PVentaUM
                                                    FROM
                                                      medida
                                                    WHERE
                                                      IdFerreteria = ?`, [req.body.IdFerreteria])
    
      // Crear un mapa para agrupar las medidas por Consecutivo
      const measuresMap = MedidasList.reduce((map, measure) => {
        if (!map[measure.Consecutivo]) {
          map[measure.Consecutivo] = [];
        }
        map[measure.Consecutivo].push({
          Medida: measure.Medida,
          UMedida: measure.UMedida,
          PVentaUM: measure.PVentaUM,
        });
        return map;
      }, {});

      // Agregar las medidas correspondientes a cada producto
      for (let product of InventoryList) {
        product.Medidas = measuresMap[product.Consecutivo] || [];
      }
      res.status(200).json(InventoryList);
      connection.end();
  } catch (error) {
      console.log(error);
      res.status(500).json(error);
  }
}

export const postUpdateProduct = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
    await connection.beginTransaction();

    // Actualizar el producto principal
    const updateProductSql = `
      UPDATE productos
      SET
        Cod = ?,
        Descripcion = ?,
        Clase = ?,
        SubCategoria = ?,
        Detalle = ?,
        Iva = ?
      WHERE
        Consecutivo = ?`;
    const productValues = [
      req.body.Cod,
      req.body.Descripcion,
      req.body.Clase,
      req.body.IdSubCategoria,
      req.body.Detalle,
      req.body.Iva,
      req.body.ConsecutivoProd
    ];
    
    await connection.execute(updateProductSql, productValues);
    // Verificar si ya existe el producto en detalleproductoferreteria
    const [queryCantidad] = await connection.query(`
                                                    SELECT
                                                      Consecutivo
                                                    FROM
                                                      detalleproductoferreteria
                                                    WHERE
                                                      Consecutivo = ? AND IdFerreteria = ?`, 
                                                    [req.body.ConsecutivoProd, req.body.IdFerreteria]);
    // Construir las consultas y valores para detalleproductoferreteria y medida
    const isUpdate = queryCantidad.length > 0;
    //const isUpdateMedidas =  queryCantidad.length  >0;
    const detalleProductoSql = isUpdate ? `
      UPDATE
        detalleproductoferreteria
      SET
        PCosto = ?,
        PVenta = ?,
        InvMinimo = ?,
        InvMaximo = ?,
        Ubicacion = ?
      WHERE
        Consecutivo = ? AND IdFerreteria = ?`
      : 
      `INSERT INTO
        detalleproductoferreteria
        (Consecutivo,
        IdFerreteria,
        PCosto,
        PVenta,
        InvMinimo,
        InvMaximo,
        Ubicacion)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const detalleProductoValues = isUpdate ? [
      req.body.PCosto,
      req.body.PVenta,
      req.body.InvMinimo,
      req.body.InvMaximo,
      req.body.Ubicacion,
      req.body.ConsecutivoProd,
      req.body.IdFerreteria
    ] : [
      req.body.ConsecutivoProd,
      req.body.IdFerreteria,
      req.body.PCosto,
      req.body.PVenta,
      req.body.InvMinimo,
      req.body.InvMaximo,
      req.body.Ubicacion
    ];
    // Ejecutar la consulta para detalleproductoferreteria
    await connection.execute(detalleProductoSql, detalleProductoValues);
    const eliminarMedida = `DELETE FROM
                              medida
                            WHERE
                              Consecutivo = ? AND IdFerreteria = ?`
    const eliminarMedidaValues = [req.body.ConsecutivoProd, req.body.IdFerreteria,]
    await connection.execute(eliminarMedida, eliminarMedidaValues)
    
    // Incerta las medidas
    if (req.body.Medidas.length > 0 ) {
      const medidaPromises = req.body.Medidas.map(entry => {
        const detalleMedidaSql = `INSERT INTO
                                    medida
                                    (Consecutivo,
                                    IdFerreteria,
                                    Medida,
                                    UMedida,
                                    PrecioUM)
                                  VALUES (?, ?, ?, ?, ?)`;
        const detalleMedidaValues = [
          req.body.ConsecutivoProd,
          req.body.IdFerreteria,
          entry.Medida,
          entry.UMedida,
          entry.PVentaUM
        ];
        
        return connection.execute(detalleMedidaSql, detalleMedidaValues);
      });
      await Promise.all(medidaPromises);
    }
    // Confirmar la transacción
    await connection.commit();
    res.status(200).json({ message: 'Transacción completada con éxito' });
  } catch (error) {
    console.log(error);
    await connection.rollback();
    res.status(500).json(error);
  } finally {
    await connection.end();
  }
};

export const postAddProduct = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
    //Fourth query of the consecutive of the new product in entradas but the inner consecutive
    const [codInternoRows] = await connection.query("SELECT IFNULL(MAX(CodInterno)+1,0) AS NextCodInterno FROM entradas WHERE IdFerreteria = ?", [req.body.IdFerreteria]);
    const NextCodInterno = codInternoRows[0].NextCodInterno;
    //Add to the entradas table
    const addProductData = `INSERT INTO
                                    entradas
                                    (CodInterno,
                                    IdFerreteria,
                                    ConsecutivoProd,
                                    Cantidad,
                                    Cod,
                                    Descripcion,
                                    PCosto,
                                    PCostoLP,
                                    Fecha,
                                    Iva,
                                    CodResponsable,
                                    Responsable,
                                    Motivo,
                                    ConsecutivoCompra,
                                    Medida,
                                    UMedida) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    const values = [
      NextCodInterno,
      req.body.IdFerreteria,
      req.body.ConsecutivoProd,
      req.body.Cantidad,
      req.body.Cod,
      req.body.Descripcion,
      req.body.PCosto,
      req.body.PCostoLP,
      req.body.Fecha,
      req.body.Iva,
      req.body.CodResponsable,
      req.body.Responsable,
      req.body.Motivo,
      req.body.ConsecutivoCompra,
      req.body.Medida,
      req.body.UMedida
    ]
    
    await connection.execute(addProductData, values);
    //Modify the PCosto and the PVenta
    const updateProductData = `UPDATE
                                    detalleproductoferreteria
                                SET
                                    PCosto = ?,
                                    PVenta = ? 
                                WHERE
                                    Consecutivo = ? AND IdFerreteria = ?`
    const updateProductValues = [
      req.body.PCosto,
      req.body.PVenta,
      req.body.ConsecutivoProd,
      req.body.IdFerreteria
    ]
    await connection.execute(updateProductData, updateProductValues);          
    await connection.commit();
    res.status(200).json({ message: 'Transacción completada con éxito' });
  } catch (error) {
    console.log(error);
    await connection.rollback();
    res.status(500).json(error);
  } finally {
    await connection.end();
  }
};

export const postUpdateInventory = async(req, res) => {
  const connection = await connectDBSivarPos();
  try {
    await connection.beginTransaction();
    let value = 0
    //First query of the consecutive of the new product in entradas but the inner consecutive
    const [productData] = await connection.query(`SELECT
                                                    pro.Cod,
                                                    pro.Descripcion,
                                                    pro.subcategoria,
                                                    pro.Detalle
                                                  FROM
                                                    productos AS pro
                                                  WHERE
                                                    pro.Consecutivo = ?`, [req.body.ConsecutivoProd]);
    
    const [queryCantidad] = await connection.query(`SELECT
                                                      IFNULL(en.entradas, 0) - IFNULL(sa.salidas, 0) AS Cantidad
                                                  FROM
                                                      (SELECT
                                                    COALESCE(e.ConsecutivoProd, ?) AS ConsecutivoProd,
                                                    COALESCE(SUM(e.Cantidad), 0) AS entradas
                                                      FROM
                                                    (SELECT ? AS ConsecutivoProd, 0 AS Cantidad) AS defaultValues
                                                      LEFT JOIN
                                                    entradas e ON e.ConsecutivoProd = ? AND e.CodResponsable = ?
                                                      GROUP BY
                                                    e.ConsecutivoProd) AS en
                                                  LEFT JOIN
                                                      (SELECT
                                                    COALESCE(s.ConsecutivoProd, ?) AS ConsecutivoProd,
                                                    COALESCE(SUM(s.Cantidad), 0) AS salidas
                                                      FROM
                                                    (SELECT ? AS ConsecutivoProd, 0 AS Cantidad) AS defaultValues
                                                      LEFT JOIN
                                                    salidas s ON s.ConsecutivoProd = ? AND s.CodResponsable = ?
                                                      GROUP BY
                                                    s.ConsecutivoProd) AS sa
                                                  ON en.ConsecutivoProd = sa.ConsecutivoProd`, [req.body.ConsecutivoProd,
                                                                                                req.body.ConsecutivoProd,
                                                                                                req.body.ConsecutivoProd,
                                                                                                req.body.CodResponsable,
                                                                                                req.body.ConsecutivoProd,
                                                                                                req.body.ConsecutivoProd,
                                                                                                req.body.ConsecutivoProd,
                                                                                                req.body.CodResponsable]);
    const cantidadactual = parseFloat(queryCantidad[0].Cantidad);
    value = Math.abs(cantidadactual-req.body.Cantidad)
    const difference = req.body.Cantidad - cantidadactual
    if (difference > 0) {
      const sql1 = `INSERT INTO entradas (CodInterno,
                                          IdFerreteria,
                                          ConsecutivoProd,		      
                                          Cantidad,
                                          Cod,
                                          Descripcion,
                                          PCosto,
                                          PCostoLP,
                                          Fecha,
                                          Iva,
                                          CodResponsable,
                                          Responsable,
                                          Motivo,
                                          ConsecutivoCompra,
                                          Medida,
                                          UMedida)
                                      VALUES (?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?,
                                              ?)`
        const values1 = ["000",
                        req.body.IdFerreteria,		      
                        req.body.ConsecutivoProd,
                        value,
                        productData[0].Cod,
                        productData[0].Descripcion,
                        0,
                        0,
                        req.body.Fecha,
                        0,
                        req.body.CodResponsable,
                        req.body.Responsable,
                        req.body.Motivo,
                        0,
                        '',
                        1]
      await connection.execute(sql1, values1);
    } else if (difference < 0) { 
      const sql2 = `INSERT INTO salidas (ConsecutivoVenta,
                                         IdFerreteria,
                                         ConsecutivoProd,
                                         Cantidad,
                                         Cod,
                                         Descripcion,
                                         VrUnitario,
                                         VrCosto,
                                         CodResponsable,
                                         Responsable,
                                         Iva,
                                         Motivo,
                                         Fecha,
                                         Medida,
                                         UMedida)
                                VALUES (?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?)`
      const values2 = ["000",
                      req.body.IdFerreteria,
                      req.body.ConsecutivoProd,
                      value,
                      productData[0].Cod,
                      productData[0].Descripcion,
                      0,
                      0,
                      req.body.CodResponsable,
                      req.body.Responsable,
                      0,
                      req.body.Motivo,
                      req.body.Fecha,
                      '',
                      1]
    await connection.execute(sql2, values2);
    }
    // Confirm the transaction
    await connection.commit();
    res.status(200).json({ message: 'Transacción completada con éxito' });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

export const getSubCategories = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
      const [SubCategoryList] = await connection.query(`SELECT
                                                          sc.IdSubCategoria,
                                                          sc.SubCategoria,
                                                          sc.IdCategoria,
                                                          ca.Categoria
                                                        FROM
                                                          subcategorias AS sc
                                                          LEFT JOIN categorias AS ca ON sc.IdCategoria = ca.IdCategoria`)
      res.status(200).json(SubCategoryList);
  } catch (error) {
      console.log(error);
      res.status(500).json(error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

export const getShoppingList = async (req, res) => {
  const connection = await connectDBSivarPos();
  const connectionSivar = await connect()
  try {
    if (req.body.Compras === false) {
      const [lowInventory] = await connection.query(`SELECT
                                                        pro.Consecutivo,
                                                        pro.IdFerreteria,
                                                        pro.Cod,
                                                        pro.Descripcion,
                                                        COALESCE(en.entradas, 0) - COALESCE(sa.salidas, 0) AS Inventario,
                                                        det.InvMinimo,
                                                        det.InvMaximo,
                                                        ca.Categoria,
                                                        pro.Detalle,
                                                        pro.Iva,
                                                        pro.SVenta,
                                                        pro.Clase
                                                      FROM
                                                        productos AS pro
                                                        LEFT JOIN
                                                      subcategorias AS sc ON sc.IDSubCategoria = pro.SubCategoria
                                                        LEFT JOIN
                                                      categorias AS ca ON sc.IDCategoria = ca.IDCategoria
                                                        LEFT JOIN detalleproductoferreteria AS det ON pro.Consecutivo = det.Consecutivo
                                                        LEFT JOIN (
                                                      SELECT 
                                                    ConsecutivoProd,
                                                    SUM(Cantidad/UMedida) AS entradas 
                                                      FROM 
                                                    entradas 
                                                      WHERE entradas.CodResponsable = ?
                                                      GROUP BY 
                                                    ConsecutivoProd
                                                        ) AS en ON pro.Consecutivo = en.ConsecutivoProd
                                                        LEFT JOIN (
                                                      SELECT 
                                                    ConsecutivoProd, 
                                                    SUM(Cantidad/UMedida) AS salidas 
                                                      FROM
                                                    salidas
                                                      WHERE salidas.CodResponsable = ?
                                                      GROUP BY 
                                                    ConsecutivoProd
                                                        ) AS sa ON pro.Consecutivo = sa.ConsecutivoProd
                                                    WHERE
                                                        det.IdFerreteria = ? AND COALESCE(en.entradas, 0) - COALESCE(sa.salidas, 0) <= det.InvMinimo
                                                    GROUP BY 
                                                        pro.Consecutivo`, [req.body.IdFerreteria, req.body.IdFerreteria, req.body.IdFerreteria]);
      if (!lowInventory || lowInventory.length === 0) {
        // Devuelve una respuesta vacía explícita al cliente
        return res.status(200).json([]);
      }
      const sivarProducts = lowInventory.filter(pro => pro.IdFerreteria === 0)
      // Extraer solo los Cod de esos productos
      const codList = sivarProducts.map(pro => pro.Cod);
      
      // Crear una lista para usarse en la consulta SQL
      const codListForQuery = codList.map(cod => `'${cod}'`).join(',');
      const [formProductsSivar] = await connectionSivar.query(`SELECT
                                                                pro.Cod,
                                                                pro.EsUnidadOpaquete,
                                                                pro.PVenta AS PCosto,
                                                                pro.Iva,
                                                                pro.Agotado
                                                              FROM
                                                                productos AS pro
                                                              WHERE
                                                                pro.Cod IN (${codListForQuery})`)
      
    // Convertir formProductsSivar en un diccionario para fácil acceso
    const formProductsSivarMap = formProductsSivar.reduce((acc, item) => {
      acc[item.Cod] = item;
      return acc;
    }, {});

    // Añadir datos a lowInventory
    const updatedLowInventory = lowInventory.map(pro => {
      if (pro.IdFerreteria === 0) {
          const additionalData = formProductsSivarMap[pro.Cod] || {
              EsUnidadOpaquete: 1,
              PCosto: 0,
              Iva: 1,
              Agotado: 0
          };
          return { ...pro, ...additionalData };
      }
      return pro;
    });
      res.status(200).json(updatedLowInventory);
            
  } else {
    //console.log('entro a compras')
    const [productsList] = await connectionSivar.query(`WITH RankedResults AS (
                                                    SELECT
                                                        *,
                                                        ROW_NUMBER() OVER (PARTITION BY Cod ORDER BY Score DESC) AS RowNum
                                                    FROM (
                                                        SELECT
                                                            p.Cod,
                                                            p.Descripcion,
                                                            p.EsUnidadOpaquete,
                                                            c.Categoria,
                                                            p.PVenta,
                                                            p.Iva,
                                                            p.Agotado,
                                                            p.Detalle,
                                                            (
                                                                0.3 * IFNULL((p.PVenta - p.PCosto) / p.PVenta * 100, 0) +
                                                                0.5 * (
                                                                    COUNT(CASE 
                                                                        WHEN DATE_FORMAT(sa.FechaDeIngreso, '%Y-%m') >= DATE_FORMAT(NOW() - INTERVAL 6 MONTH, '%Y-%m') AND sa.Codigo IS NOT NULL AND sa.CodCliente = ? THEN sa.Codigo
                                                                    END) / (SELECT COUNT(sa.Codigo) FROM salidas AS sa WHERE DATE_FORMAT(sa.FechaDeIngreso, '%Y-%m') >= DATE_FORMAT(NOW() - INTERVAL 6 MONTH, '%Y-%m') AND sa.CodCliente = ?)
                                                                ) / 6 +
                                                                0.2 * IFNULL(
                                                                    SUM(CASE 
                                                                        WHEN DATE_FORMAT(sa.FechaDeIngreso, '%Y-%m') >= DATE_FORMAT(NOW() - INTERVAL 6 MONTH, '%Y-%m') AND sa.Codigo IS NOT NULL AND sa.CodCliente = ? THEN sa.Cantidad * (sa.VrUnitario - sa.Costo) 
                                                                    END), 0)
                                                            ) / (SELECT COUNT(Codigo) FROM salidas WHERE CodCliente = ? AND NDePedido <> '0') AS Score
                                                        FROM 
                                                            productos AS p
                                                        JOIN
                                                            salidas AS sa ON p.Cod = sa.Codigo
                                                        JOIN
                                                            subcategorias AS sub ON p.subcategoria = sub.IDSubCategoria
                                                        JOIN
                                                            categoria AS c ON sub.IDCategoria = c.IDCategoria
                                                        WHERE
                                                            sa.CodCliente = ?
                                                        GROUP BY p.Cod
                                                
                                                        UNION ALL
                                                
                                                        SELECT
                                                            p.Cod,
                                                            p.Descripcion,
                                                            p.EsUnidadOpaquete,
                                                            c.Categoria,
                                                            p.PVenta,
                                                            p.Iva,
                                                            p.Agotado,
                                                            p.Detalle,
                                                            (
                                                                0.3 * IFNULL((p.PVenta - p.PCosto) / p.PVenta * 100, 0) +
                                                                0.5 * (
                                                                    COUNT(CASE 
                                                                        WHEN DATE_FORMAT(sa.FechaDeIngreso, '%Y-%m') >= DATE_FORMAT(NOW() - INTERVAL 6 MONTH, '%Y-%m') AND sa.Codigo IS NOT NULL AND sa.CodCliente <> ? THEN sa.Codigo
                                                                    END) / (SELECT COUNT(sa.Codigo) FROM salidas AS sa WHERE DATE_FORMAT(sa.FechaDeIngreso, '%Y-%m') >= DATE_FORMAT(NOW() - INTERVAL 6 MONTH, '%Y-%m') AND sa.CodCliente <> ?)
                                                                ) / 6 +
                                                                0.2 * IFNULL(
                                                                    SUM(CASE 
                                                                        WHEN DATE_FORMAT(sa.FechaDeIngreso, '%Y-%m') >= DATE_FORMAT(NOW() - INTERVAL 6 MONTH, '%Y-%m') AND sa.Codigo IS NOT NULL AND sa.CodCliente <> ? THEN sa.Cantidad * (sa.VrUnitario - sa.Costo) 
                                                                    END), 0)
                                                            ) / (SELECT COUNT(Codigo) FROM salidas WHERE CodCliente <> ? AND NDePedido <> '0') AS Score
                                                        FROM 
                                                            productos AS p
                                                        JOIN
                                                            salidas AS sa ON p.Cod = sa.Codigo
                                                        JOIN
                                                            subcategorias AS sub ON p.subcategoria = sub.IDSubCategoria
                                                        JOIN
                                                            categoria AS c ON sub.IDCategoria = c.IDCategoria
                                                        WHERE
                                                            sa.CodCliente <> ?
                                                        GROUP BY p.Cod
                                                    ) AS CombinedResults
                                                )
                                                SELECT
                                                    Cod,
                                                    Descripcion,
                                                    EsUnidadOpaquete,
                                                    Categoria,
                                                    PVenta as PCosto,
                                                    Iva,
                                                    Agotado,
                                                    Detalle,
                                                    Score
                                                FROM
                                                    RankedResults
                                                WHERE
                                                    RowNum = 1 AND Cod <> '1'
                                                ORDER BY
                                                    Score DESC;`,[req.body.IdFerreteria,
                                                                  req.body.IdFerreteria,
                                                                  req.body.IdFerreteria,
                                                                  req.body.IdFerreteria,
                                                                  req.body.IdFerreteria,
                                                                  req.body.IdFerreteria,
                                                                  req.body.IdFerreteria,
                                                                  req.body.IdFerreteria,
                                                                  req.body.IdFerreteria,
                                                                  req.body.IdFerreteria]);
    const codList = productsList.map(pro => pro.Cod);
    // Crear una lista para usarse en la consulta SQL
    const codListForQuery = codList.map(cod => `'${cod}'`).join(',');
    const [formProductsSivar] = await connection.query(`SELECT
                                                          pro.Cod,
                                                          COALESCE(en.entradas, 0) - COALESCE(sa.salidas, 0) AS Inventario,
                                                          det.InvMinimo,
                                                          det.InvMaximo
                                                        FROM
                                                        productos AS pro
                                                        LEFT JOIN detalleproductoferreteria AS det ON pro.Consecutivo = det.Consecutivo
                                                        LEFT JOIN (
                                                            SELECT 
                                                          ConsecutivoProd,
                                                          SUM(Cantidad/UMedida) AS entradas 
                                                            FROM 
                                                          entradas 
                                                            GROUP BY 
                                                          ConsecutivoProd
                                                        ) AS en ON pro.Consecutivo = en.ConsecutivoProd
                                                        LEFT JOIN (
                                                            SELECT 
                                                          ConsecutivoProd, 
                                                          SUM(Cantidad/UMedida) AS salidas 
                                                            FROM 
                                                          salidas 
                                                            GROUP BY 
                                                          ConsecutivoProd
                                                        ) AS sa ON pro.Consecutivo = sa.ConsecutivoProd
                                                        WHERE
                                                        det.IdFerreteria = ? AND pro.Cod IN (${codListForQuery})
                                                        GROUP BY 
                                                        pro.Consecutivo`, [req.body.IdFerreteria])
    // Convertir formProductsSivar en un diccionario para fácil acceso
    const formProductsSivarMap = formProductsSivar.reduce((acc, item) => {
      acc[item.Cod] = item;
      return acc;
    }, {});

    // Añadir datos a lowInventory
    const updatedProductList = productsList.map(pro => {
          const additionalData = formProductsSivarMap[pro.Cod] || {
            Inventario: 0,
            InvMinimo: 0,
            InvMaximo: 0
          };
          return { ...pro, ...additionalData };
      }
    );
    res.status(200).json(updatedProductList);
  }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  } finally {
    // Close the connection
    await connection.end();
    await connectionSivar.end();
  }
}
//* All about purchased products
export const getPurchaseList = async (req, res) => {
  try {
      const connection = await connectDBSivarPos();
      const [purchaseList] = await connection.query(`SELECT
                                                      cc.Consecutivo,                                              
                                                      cc.ConInterno,
                                                      cc.NPreFactura,
                                                      cc.FacturaElectronica,
                                                      cc.Estado,
                                                      cc.Fecha,
                                                      SUM(cpi.Cantidad * cpi.VrUnitarioFactura) AS Total
                                                    FROM
                                                      cabeceracompras AS cc
                                                    INNER JOIN
                                                      comprasporingresar AS cpi ON cc.NPreFactura = cpi.NPrefactura
                                                    WHERE
                                                      cc.IdFerreteria = ?
                                                    GROUP BY
                                                      cc.NPreFactura
                                                    ORDER BY
                                                      cc.ConInterno DESC`, [req.body.IdFerreteria]);
      res.status(200).json(purchaseList);
      connection.end();
  } catch (error) {
      console.log(error);
      res.status(500).json(error);
  }
}

export const getPurchaseDetail = async (req, res) => {
  try {
      const connection = await connectDBSivarPos();
      if (req.body.Estado === 'Por ingresar') {
        const [purchaseDetail] = await connection.query(`SELECT
                                                          cpi.Cantidad,
                                                          pro.Consecutivo AS ConsecutivoProd,
                                                          cpi.Cod,
                                                          pro.Descripcion,
                                                          cpi.VrUnitarioFactura AS PCosto,
                                                          dpro.PCosto AS PCostoLP,
                                                          dpro.PVenta,
                                                          pro.Iva,
                                                          COALESCE(en.entradas, 0) - COALESCE(sa.salidas, 0) AS Inventario,
                                                          cpi.Verificado,
                                                          dpro.InvMinimo,
                                                          dpro.InvMaximo
                                                        FROM
                                                          comprasporingresar AS cpi
                                                        LEFT JOIN
                                                          productos AS pro ON cpi.Cod = pro.Cod
                                                        LEFT JOIN
                                                          detalleproductoferreteria AS dpro ON dpro.Consecutivo = pro.Consecutivo AND dpro.IdFerreteria = cpi.IdFerreteria
                                                        LEFT JOIN (
                                                              SELECT 
                                                            ConsecutivoProd,
                                                            SUM(Cantidad) AS entradas 
                                                              FROM 
                                                            entradas 
                                                              GROUP BY 
                                                            ConsecutivoProd
                                                          ) AS en ON pro.Consecutivo = en.ConsecutivoProd
                                                          LEFT JOIN (
                                                              SELECT 
                                                            ConsecutivoProd, 
                                                            SUM(Cantidad) AS salidas 
                                                              FROM 
                                                            salidas 
                                                              GROUP BY 
                                                            ConsecutivoProd
                                                          ) AS sa ON pro.Consecutivo = sa.ConsecutivoProd
                                                        WHERE
                                                          cpi.NPrefactura = ? AND cpi.IdFerreteria = ?`, [req.body.NPreFactura ,req.body.IdFerreteria]);
        res.status(200).json(purchaseDetail);
      } else if (req.body.Estado === 'Recibido') {
        const [purchaseDetail] = await connection.query(`SELECT
                                                          en.Cantidad,
                                                          en.ConsecutivoProd,
                                                          en.Cod,
                                                          en.Descripcion,
                                                          en.PCosto,
                                                          en.PCostoLP,
                                                          dpro.PVenta,
                                                          en.Iva,
                                                          COALESCE(ent.entradas, 0) - COALESCE(sa.salidas, 0) AS Inventario,
                                                          dpro.InvMinimo,
                                                          dpro.InvMaximo
                                                        FROM
                                                          entradas AS en
                                                        LEFT JOIN
                                                          productos AS pro ON en.Cod = pro.Cod
                                                        LEFT JOIN
                                                          detalleproductoferreteria AS dpro ON dpro.Consecutivo = pro.Consecutivo AND dpro.IdFerreteria = en.IdFerreteria
                                                        LEFT JOIN (
                                                            SELECT 
                                                          ConsecutivoProd,
                                                          SUM(Cantidad) AS entradas 
                                                            FROM 
                                                          entradas 
                                                            GROUP BY 
                                                          ConsecutivoProd
                                                        ) AS ent ON pro.Consecutivo = ent.ConsecutivoProd
                                                        LEFT JOIN (
                                                            SELECT 
                                                          ConsecutivoProd, 
                                                          SUM(Cantidad) AS salidas 
                                                            FROM 
                                                          salidas 
                                                            GROUP BY 
                                                          ConsecutivoProd
                                                        ) AS sa ON pro.Consecutivo = sa.ConsecutivoProd
                                                        WHERE
                                                        en.ConsecutivoCompra = CONCAT('C-', ?) AND en.IdFerreteria = ?`, [req.body.Consecutivo, req.body.IdFerreteria]);
        res.status(200).json(purchaseDetail);
      }
      connection.end();
  } catch (error) {
      console.log(error);
      res.status(500).json(error);
  }
}

export const putAddPurchase = async (req, res) => {
  const connection = await connectDBSivarPos();
  const DEFAULT_UBICACION = 'Principal';
  const DEFAULT_INVMINIMO = 1;
  const DEFAULT_INVMAXIMO = 1;

  try {
    if (!req.body.Order || req.body.Order.length === 0) {
      return res.status(400).json({ message: 'No hay productos para procesar' });
    }

    const commonValues = {
      IdFerreteria: req.body.IdFerreteria,
      CodResponsable: req.body.CodResponsable,
      Responsable: req.body.Responsable,
      Fecha: req.body.Fecha,
      ConsecutivoCompra: req.body.Consecutivo,
    };

    const updateDetalleQuery = `
      INSERT INTO detalleproductoferreteria (
                                            Consecutivo,
                                            IdFerreteria,
                                            PCosto,
                                            PVenta,
                                            InvMinimo,
                                            Invmaximo,
                                            Ubicacion
                                            )
      VALUES ?
      ON DUPLICATE KEY UPDATE
        PCosto = VALUES(PCosto),
        PVenta = VALUES(PVenta)
    `;

    const insertEntradasQuery = `
      INSERT INTO entradas (
                            CodInterno,
                            IdFerreteria,
                            ConsecutivoProd,
                            Cantidad,
                            Cod,
                            Descripcion,
                            PCosto, 
                            PCostoLP, 
                            Fecha, 
                            Iva,
                            CodResponsable,
                            Responsable,
                            Motivo,
                            ConsecutivoCompra,
                            Medida,
                            UMedida
                            )
      VALUES ?
    `;

    await connection.beginTransaction();

    const entradasValues = [];
    const detalleValues = [];

    for (const entry of req.body.Order) {
      detalleValues.push([
        entry.ConsecutivoProd,
        commonValues.IdFerreteria,
        entry.PCosto,
        entry.PVenta,
        DEFAULT_INVMINIMO,
        DEFAULT_INVMAXIMO,
        DEFAULT_UBICACION,
      ]);

      entradasValues.push([
        '000',
        commonValues.IdFerreteria,
        entry.ConsecutivoProd,
        entry.Cantidad,
        entry.Cod,
        entry.Descripcion,
        entry.PCosto,
        entry.PCostoLP,
        commonValues.Fecha,
        entry.Iva,
        commonValues.CodResponsable,
        commonValues.Responsable,
        'Compra',
        'C-' + commonValues.ConsecutivoCompra,
        'Unidades',
        1
      ]);
    }

    await connection.query(updateDetalleQuery, [detalleValues]);
    await connection.query(insertEntradasQuery, [entradasValues]);

    const updateComprasPorIngresar = `
      UPDATE
        cabeceracompras
      SET
        Estado = 'Recibido'
      WHERE
        Consecutivo = ? AND IdFerreteria = ?
    `;
    const deleteComprasPorIngresar = `
      DELETE FROM
        comprasporingresar
      WHERE
        NPrefactura = ?
    `;

    await connection.execute(updateComprasPorIngresar, [
      commonValues.ConsecutivoCompra,
      commonValues.IdFerreteria,
    ]);
    await connection.execute(deleteComprasPorIngresar, [commonValues.ConsecutivoCompra]);

    await connection.commit();
    res.status(200).json({ message: 'Transacción completada con éxito' });
  } catch (error) {
    await connection.rollback();
    console.error('Error en la transacción de compras:', error);
    res.status(500).json({ message: 'Error procesando la transacción', error: error.message });
  } finally {
    await connection.end();
  }
};

export const putModifyPurchaseProduct = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
    await connection.beginTransaction();
    const insertDetalleQuery  = `INSERT INTO 
                                  detalleproductoferreteria
                                ( Consecutivo,
                                  IdFerreteria,
                                  PCosto,
                                  PVenta,
                                  InvMinimo,
                                  InvMaximo,
                                  Ubicacion)
                                VALUES (?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?)`
    const updateDetalleQuery = `UPDATE
                                  detalleproductoferreteria
                                SET
                                  PCosto =?,
                                  PVenta =?
                                WHERE
                                  Consecutivo = ? AND IdFerreteria = ?`
    const [DetalleProductoPorFerreteria] = await connection.query(`SELECT
                                                                    Consecutivo
                                                                  FROM
                                                                    detalleproductoferreteria
                                                                  WHERE
                                                                    Consecutivo = ? AND IdFerreteria = ?`, [req.body.ConsecutivoProd, req.body.IdFerreteria])
    const verificarCheck = `UPDATE
                              comprasporingresar
                            SET
                              verificado = 1
                            WHERE
                              IdFerreteria = ? AND NPrefactura = ? AND cod = ?`
    const valuesCheck = [req.body.IdFerreteria, req.body.NPreFactura, req.body.Cod]
    await connection.execute(verificarCheck, valuesCheck);

    if (DetalleProductoPorFerreteria.length > 0) {
      const valuesUpdate = [req.body.PCosto,
                            req.body.PVenta,
                            req.body.ConsecutivoProd,
                            req.body.IdFerreteria]
      await connection.execute(updateDetalleQuery, valuesUpdate);

    } else {
      const valuesInsert = [
        req.body.ConsecutivoProd,
        req.body.IdFerreteria,
        req.body.PCosto,
        req.body.PVenta,
        1,
        1,
        "",
        "",
        1,
        0
      ]
      await connection.execute(insertDetalleQuery, valuesInsert)
    }
    // Confirm the transaction
    await connection.commit();
    res.status(200).json({ message: 'Transacción completada con éxito' });
  } catch (error) {
    await connection.rollback();
    console.log("este es el error", error);
    res.status(500).json(error);
  } finally {
      // Close the connection
      await connection.end();
  }
}

export const putUpdateVefied = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
      const sql1 = `UPDATE
                      comprasporingresar
                    SET
                      verificado = ?
                    WHERE
                      IdFerreteria = ? AND NPrefactura = ? AND cod = ?`
      const values = [req.body.Verificado,
                      req.body.IdFerreteria,
                      req.body.NPreFactura,
                      req.body.Cod];
      await connection.execute(sql1, values)
      res.status(200).json({ message: 'Transacción completada con éxito' });
      connection.end();
  } catch (error) {
      console.log(error);
      res.status(500).json(error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

export const postToRemsionToElectronic = async (req, res) => {
  const connection = await connectDBSivarPos();
  const connectSivar = await connect()
  try {

    let Customer = req.body
    //To create the new electronic invoice
    const [Resolucion] = await connectSivar.query(`SELECT
                                                    NumeroResolucion,
                                                    DATE_FORMAT(FechaInicio, '%Y-%m-%d') AS FechaInicio,
                                                    DATE_FORMAT(FechaFinal, '%Y-%m-%d') AS FechaFinal,
                                                    Prefijo,
                                                    NumeroInicial,
                                                    NumeroFinal,
                                                    ClaveTecnica
                                                  FROM
                                                    resoluciones
                                                  WHERE
                                                    IdFerreteria = ?`, [req.body.RCData.IdFerreteria]);
    
    const [logInColtek] = await connectSivar.query(`SELECT
                                                      Api,
                                                      Usuario,
                                                      Clave
                                                    FROM
                                                      resoluciones
                                                    WHERE
                                                      IdFerreteria = ?`, [req.body.RCData.IdFerreteria]);
    const [UfacturaRows] = await connection.query(`SELECT
                                                    CASE 
                                                      WHEN MAX(FacturaElectronica) IS NULL THEN 0
                                                      WHEN MAX(FacturaElectronica) = '' THEN 0
                                                      ELSE MAX(FacturaElectronica) + 1
                                                    END AS UFactura
                                                  FROM
                                                    cabeceraventas
                                                  WHERE
                                                    IdFerreteria = ?`, [req.body.RCData.IdFerreteria])
    if (UfacturaRows[0].UFactura === 0) {
      UfacturaRows[0].UFactura = Resolucion[0].NumeroInicial
    }

    if (req.body.IdCliente != 0){
      const [Cliente] = await connection.query(`SELECT 
                                                    cli.Consecutivo,
                                                    cli.Tipo,
                                                    cli.NitCC,
                                                    cli.Nombre,
                                                    cli.Apellido,
                                                    cli.Telefono1,
                                                    cli.Telefono2,
                                                    cli.Correo,
                                                    cli.Direccion,
                                                    cli.Dv,
                                                    cli.ResFiscal
                                                  FROM
                                                    clientes AS cli
                                                  WHERE
                                                    Consecutivo = ?`, [req.body.IdCliente]);
      Customer = {
                  "TipoPersona": Cliente[0].Tipo == 0 ? 2 : 1,
                  "NombreTipoPersona": Cliente[0].Tipo ? 'Persona Natural' : 'Persona Jurídica',
                  "TipoDocumento": Cliente[0].Tipo === 0 ? 13 : 31,
                  "NombreTipoDocumento": Cliente[0].Tipo === 0 ? 'Cédula de ciudadanía ': 'NIT',
                  "Documento": Cliente[0].NitCC,
                  "Dv": Cliente[0].Dv,
                  "NombreComercial": Cliente[0].Nombre + ' ' + Cliente[0].Apellido,
                  "RazonSocial": Cliente[0].Nombre + ' ' + Cliente[0].Apellido,
                  "Telefono": Cliente[0].Telefono1,
                  "Correo": Cliente[0].Correo,
                  "Departamento": {
                    "Codigo": 11,
                    "Nombre": "Bogota"
                  },
                  "Ciudad": {
                    "Codigo": 11001,
                    "Nombre": "Bogota, DC."
                  },
                  "Direccion": Cliente[0].Direccion,
                  "ResponsabilidadFiscal": Cliente[0].ResFiscal,
                  "DetallesTributario": {
                    "Codigo": "01",
                    "Nombre": "IVA"
                  }
                }
    } else if (req.body.IdCliente == 0) {
      Customer =  {
                  "TipoPersona": req.body.Customer.TipoPersona,
                  "NombreTipoPersona": req.body.Customer.NombreTipoPersona,
                  "TipoDocumento": req.body.Customer.TipoDocumento,
                  "NombreTipoDocumento": req.body.Customer.NombreTipoDocumento,
                  "Documento": req.body.Customer.NitCC,
                  "Dv": req.body.Customer.Dv,
                  "NombreComercial": req.body.Customer.Nombre + " " + req.body.Customer.Apellido,
                  "RazonSocial": req.body.Customer.Nombre + " " + req.body.Customer.Apellido,
                  "Telefono": req.body.Customer.Telefono1,
                  "Correo": req.body.Customer.Correo,
                  "Departamento": {
                                    "Codigo": 11,
                                    "Nombre": "Bogota"
                                  },
                  "Ciudad": {
                              "Codigo": 11001,
                              "Nombre": "Bogota, DC."
                            },
                  "Direccion": req.body.Customer.Direccion,
                  "ResponsabilidadFiscal": req.body.Customer.ResFiscal,
                  "DetallesTributario": {
                                          "Codigo": "01",
                                          "Nombre": "IVA"
                                        }
              }
    }
    const ElectronicData = {
            "Ambiente": ambiente,
            "Resolucion": Resolucion[0],
            "Factura": Resolucion[0].Prefijo + UfacturaRows[0].UFactura,
            "Fecha": req.body.RCData.Fecha.split(' ')[0],
            "Hora": req.body.RCData.Fecha.split(' ')[1] + "-05:00",
            "Observacion": "Observacion",
            "FormaDePago": "1", //Es 1 para contado y 2 para credito
            "MedioDePago": req.body.MedioDePagoColtek,
            "FechaVencimiento": req.body.RCData.Fecha.split(' ')[0],
            "CantidadArticulos": req.body.Order.length,
            "Cliente": Customer
      }
      let articulos = []
        let totalBruto = 0;
        let total = 0;
        let totalImpuestos = 0;
        let porcentajes = []
        for (const product of req.body.Order) {
          const detProduct = {
            "CodigoInterno": product.Consecutivo,
            "Nombre": product.Descripcion,
            "Cantidad": product.Cantidad,
            "PrecioUnitario": product.PVenta,
            "Total": ((product.Cantidad * product.PVenta)/(1+(product.Iva/100))),
            "Regalo": "false",
            "DescuentoYRecargos": [],
            "Impuestos": {
                            "IVA": {
                            "Codigo": "01",
                            "Total": (product.Cantidad * product.PVenta)-((product.Cantidad * product.PVenta)/(1+(product.Iva/100))),
                            "porcentajes": [
                                {
                                "porcentaje": product.Iva,
                                "Base": (product.Cantidad * product.PVenta)/(1+(product.Iva/100)),
                                "Total": (product.Cantidad * product.PVenta)-((product.Cantidad * product.PVenta)/(1+(product.Iva/100)))
                                }
                              ]
                            }
                          }
          }
          porcentajes.push({
            "porcentaje": product.Iva,
            "Base": (product.Cantidad * product.PVenta)/(1+(product.Iva/100)),
            "Total": (product.Cantidad * product.PVenta) - (product.Cantidad * product.PVenta)/(1+(product.Iva/100))
          })
          totalBruto += ((product.Cantidad * product.PVenta)/(1+product.Iva/100))
          total += product.Cantidad * product.PVenta
          //detImpuestos.IVA.Total = total
          //detImpuestos.IVA.porcentajes = porcentajes
          totalImpuestos += (product.Cantidad * product.PVenta)-((product.Cantidad * product.PVenta)/(1+(product.Iva/100)))
          articulos.push(detProduct)
        }
        const Totales = {
          Bruto: totalBruto,
          "BaseImpuestos": totalBruto,
          "Descuentos": 0,
          "Cargos": 0,
          "APagar": total,
          "Impuestos": totalImpuestos
        }
        ElectronicData.Articulos = articulos
        ElectronicData.Totales = Totales
        //ElectronicData.Impuestos = detImpuestos
        ElectronicData.Impuestos = {
          "IVA": {
                "Codigo": "01",
                "Total": totalImpuestos,
                "porcentajes": porcentajes
                }
        }
    //Para la factura electronica
    const resFElectronica = await fetch(`${logInColtek[0].Api}/api/v1/facturacion/factura/send?debug=true&type=00`,{
      method: 'POST',
      headers: { Accept: 'application/json',
                         'Content-Type': 'application/json',
                         'Authorization': `Bearer ${req.body.tokenColtek}`},
      body: JSON.stringify(ElectronicData)
    })
    const responceElectronicData = await resFElectronica.json()

    if (responceElectronicData.status){
      const sql1 = `UPDATE
                      cabeceraventas
                    SET
                      Prefijo = ?,
                      FacturaElectronica = ?,
                      Cufe = ?,
                      Resolucion = ?
                    WHERE
                      IdFerreteria = ? AND Consecutivo = ?`
      const values = [Resolucion[0].Prefijo,
                      UfacturaRows[0].UFactura,
                      responceElectronicData.Result.CufeCude,
                      Resolucion[0].NumeroResolucion,
                      req.body.RCData.IdFerreteria,
                      req.body.Consecutivo
                    ];

      await connection.execute(sql1, values)

      let Data = {...req.body}
      if (responceElectronicData && responceElectronicData.Result.IsValid === 'true') {
        Data.Result = responceElectronicData.Result
      }
      res.status(200).json(Data);
    } else {
      res.status(401).json({ message: 'Ocurrio un error al realizar la transacción' });
    }
      connection.end();
  } catch (error) {
      console.log(error);
      res.status(500).json(error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

//* All about sales

const VerifyTokenColtek = async(dataUser) => {
  /*Validate the user information and if it's correct return the data of the user
  you have to send a json of the form:
  {
      "IdFerreteria": "242"
  }
  */
  try {

      const res = await fetch(`http://sivar.colsad.com/api/v1/validation-token`,{
          method: 'POST',
          headers: { Accept: 'application/json',
                              'Content-Type': 'application/json',
                          },
          body: JSON.stringify(dataUser.token)
      })
      const data = await res.json()

      if (data.status === false) {
        const resColtekLogIn = await fetch(`http://sivar.colsad.com/api/v1/login`,{
          method: 'POST',
          headers: { Accept: 'application/json','Content-Type': 'application/json'},
          body: JSON.stringify(logInColtek)
        })
        const respuesta = await resColtekLogIn.json()
        return dataUser
      } else if (data.status === true) {
        return dataUser
      }
  }catch(error) {
      console.log('TheError: '+ error)
  }
}

export const putNewSale = async (req, res) => {
  const connection = await connectDBSivarPos();
  const connectSivar = await connect()
  try {
      let Cufe = '';
      let FacturaElectronica = '';
      let responceElectronicData = null;
      let Prefijo = '';
      let SaveREsolucion = '';
      //* For the electronic facturatión
      if (req.body.Electronic) {
        const [Resolucion] = await connectSivar.query(`SELECT
                                                        NumeroResolucion,
                                                        DATE_FORMAT(FechaInicio, '%Y-%m-%d') AS FechaInicio,
                                                        DATE_FORMAT(FechaFinal, '%Y-%m-%d') AS FechaFinal,
                                                        Prefijo,
                                                        NumeroInicial,
                                                        NumeroFinal,
                                                        ClaveTecnica
                                                      FROM
                                                        resoluciones
                                                      WHERE
                                                        IdFerreteria = ?`, [req.body.RCData.IdFerreteria]);
        SaveREsolucion = Resolucion[0].NumeroResolucion
        const [logInColtek] = await connectSivar.query(`SELECT
                                                        Api,
                                                        Usuario,
                                                        Clave
                                                      FROM
                                                        resoluciones
                                                      WHERE
                                                        IdFerreteria = ?`, [req.body.RCData.IdFerreteria]);

        const [UfacturaRows] = await connection.query(`SELECT
                                                          CASE 
                                                              WHEN MAX(FacturaElectronica) IS NULL THEN 0
                                                              WHEN MAX(FacturaElectronica) = '' THEN 0
                                                              ELSE MAX(FacturaElectronica) + 1
                                                          END AS UFactura
                                                      FROM
                                                          cabeceraventas
                                                      WHERE
                                                          IdFerreteria = ?`, [req.body.RCData.IdFerreteria])
        if (UfacturaRows[0].UFactura === 0) {
          UfacturaRows[0].UFactura = Resolucion[0].NumeroInicial
        }

        const ElectronicData = {
              "Ambiente": ambiente,
              "Resolucion": Resolucion[0],
              "Factura": Resolucion[0].Prefijo + UfacturaRows[0].UFactura,
              "Fecha": req.body.RCData.Fecha.split(' ')[0],
              "Hora": req.body.RCData.Fecha.split(' ')[1],
              "Observacion": req.body.RCData.Comentarios,
              "FormaDePago": "1", //Es 1 para contado y 2 para credito
              "MedioDePago": req.body.MedioDePagoColtek,
              "FechaVencimiento": req.body.RCData.Fecha.split(' ')[0],
              "CantidadArticulos": req.body.Order.length,
              "Cliente": {
                  "TipoPersona": req.body.Customer.TipoPersona,
                  "NombreTipoPersona": req.body.Customer.NombreTipoPersona,
                  "TipoDocumento": req.body.Customer.TipoDocumento,
                  "NombreTipoDocumento": req.body.Customer.NombreTipoDocumento,
                  "Documento": req.body.Customer.NitCC,
                  "Dv": req.body.Customer.Dv,
                  "NombreComercial": req.body.Customer.Nombre + " " + req.body.Customer.Apellido,
                  "RazonSocial": req.body.Customer.Nombre + " " + req.body.Customer.Apellido,
                  "Telefono": req.body.Customer.Telefono1,
                  "Correo": req.body.Customer.Correo,
                  "Departamento": {
                                    "Codigo": 11,
                                    "Nombre": "Bogota"
                                  },
                  "Ciudad": {
                              "Codigo": 11001,
                              "Nombre": "Bogota, DC."
                            },
                  "Direccion": req.body.Customer.Direccion,
                  "ResponsabilidadFiscal": req.body.Customer.ResFiscal,
                  "DetallesTributario": {
                                          "Codigo": "01",
                                          "Nombre": "IVA"
                                        }
              }
        }
              
        let articulos = []
        let totalBruto = 0;
        let total = 0;
        let totalImpuestos = 0;
        let detImpuestos = {}
        let porcentajes = []
        for (const product of req.body.Order) {
          const detProduct = {
            "CodigoInterno": product.Consecutivo,
            "Nombre": product.Descripcion,
            "Cantidad": product.Cantidad,
            "PrecioUnitario": product.PVenta,
            "Total": ((product.Cantidad * product.PVenta)/(1+(product.Iva/100))),
            "Regalo": "false",
            "DescuentoYRecargos": [],
            "Impuestos": {
                            "IVA": {
                            "Codigo": "01",
                            "Total": (product.Cantidad * product.PVenta)-((product.Cantidad * product.PVenta)/(1+(product.Iva/100))),
                            "porcentajes": [
                                {
                                "porcentaje": product.Iva,
                                "Base": (product.Cantidad * product.PVenta)/(1+(product.Iva/100)),
                                "Total": (product.Cantidad * product.PVenta)-((product.Cantidad * product.PVenta)/(1+(product.Iva/100)))
                                }
                              ]
                            }
                          }
          }
          porcentajes.push({
            "porcentaje": product.Iva,
            "Base": (product.Cantidad * product.PVenta)/(1+(product.Iva/100)),
            "Total": (product.Cantidad * product.PVenta) - (product.Cantidad * product.PVenta)/(1+(product.Iva/100))
          })
          totalBruto += ((product.Cantidad * product.PVenta)/(1+product.Iva/100))
          total += product.Cantidad * product.PVenta
          //detImpuestos.IVA.Total = total
          //detImpuestos.IVA.porcentajes = porcentajes
          totalImpuestos += (product.Cantidad * product.PVenta)-((product.Cantidad * product.PVenta)/(1+(product.Iva/100)))
          articulos.push(detProduct)
        }
        const Totales = {
          Bruto: totalBruto,
          "BaseImpuestos": totalBruto,
          "Descuentos": 0,
          "Cargos": 0,
          "APagar": total,
          "Impuestos": totalImpuestos
        }
        ElectronicData.Articulos = articulos
        ElectronicData.Totales = Totales
        //ElectronicData.Impuestos = detImpuestos
        ElectronicData.Impuestos = {
          "IVA": {
                "Codigo": "01",
                "Total": totalImpuestos,
                "porcentajes": porcentajes
                }
        }
        //Para la factura electronica
        //const data = require('C:/Users/pc/Documents/Pruebasjson/FacturaElectronica.json');

        const resFElectronica = await fetch(`${logInColtek[0].Api}/api/v1/facturacion/factura/send?debug=true&type=00`,{
          method: 'POST',
          headers: { Accept: 'application/json',
                             'Content-Type': 'application/json',
                             'Authorization': `Bearer ${req.body.tokenColtek}`},
          body: JSON.stringify(ElectronicData)
        })
        responceElectronicData = await resFElectronica.json()
        //Start the transaction
        await connection.beginTransaction();
        if (responceElectronicData.Result.IsValid === "true") {
          Prefijo = Resolucion[0].Prefijo
          Cufe = responceElectronicData.Result.CufeCude
          FacturaElectronica = UfacturaRows[0].UFactura
        } else if (responceElectronicData.Result.IsValid === "false") {
          Prefijo = Resolucion[0].Prefijo
          Cufe = responceElectronicData.Result.CufeCude
          FacturaElectronica = UfacturaRows[0].UFactura
        }
      }

      //!To the inter database
      //First insertion to the table cabeceraventas
      const sql1 = `INSERT INTO cabeceraventas (IdFerreteria,
                                                Folio,
                                                IdCliente,
                                                Fecha,
                                                CodResponsable,
                                                Prefijo,
                                                FacturaElectronica,
                                                Cufe,
                                                Resolucion)
                                            VALUES (?,?,?,?,?,?,?,?,?)`
      const values1 = [req.body.RCData.IdFerreteria,
                        req.body.RCData.Folio,
                        req.body.Customer.Consecutivo,
                        req.body.RCData.Fecha,
                        req.body.RCData.IdFerreteria,
                        Prefijo,
                        FacturaElectronica,
                        Cufe,
                        SaveREsolucion
                      ]
      await connection.execute(sql1, values1);

      //Second query of the consecutive of the new product
      const [cabeceraventasRows] = await connection.query("SELECT IFNULL(MAX(Consecutivo),0) AS Consecutivo FROM cabeceraventas");
      const Consecutivo = cabeceraventasRows[0].Consecutivo;

      //Third insertion to the table salidas
      const sql2 = `INSERT INTO salidas (ConsecutivoVenta,
                                         IdFerreteria,
                                         ConsecutivoProd,
                                         Cantidad,
                                         Cod,
                                         Descripcion,
                                         VrUnitario,
                                         VrCosto,
                                         CodResponsable,
                                         Responsable,
                                         Iva,
                                         Motivo,
                                         Fecha,
                                         Medida,
                                         UMedida)
                                VALUES (?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?)`
      for (const entry of req.body.Order) {
        const values2 = [
            Consecutivo,
            req.body.RCData.IdFerreteria,
            entry.Consecutivo,
            entry.Cantidad,
            entry.Cod,
            entry.Descripcion,
            entry.PVenta,
            entry.PCosto,
            req.body.RCData.CodResponsable,
            req.body.RCData.Responsable,
            entry.Iva,
            req.body.RCData.Motivo,
            req.body.RCData.Fecha,
            entry.Medida,
            entry.UMedida
        ];
        await connection.execute(sql2, values2);
      }
      //Insertion to the entradadedinero table
      const sql3 = `INSERT INTO flujodedinero (ConsecutivoCV,
                                                 IdFerreteria,
                                                 Fecha,
                                                 Referencia,
                                                 Efectivo,
                                                 Transferencia,
                                                 Motivo,
                                                 Comentarios,
                                                 TipoDeFlujo,
                                                 Activo)
                                    VALUES (?,
                                            ?,
                                            ?,
                                            ?,
                                            ?,
                                            ?,
                                            ?,
                                            ?,
                                            ?,
                                            ?)`
      const values3 = [
          Consecutivo,
          req.body.RCData.IdFerreteria,
          req.body.RCData.Fecha,
          req.body.RCData.Referencia,
          req.body.RCData.Efectivo,
          req.body.RCData.Transferencia,
          req.body.RCData.Motivo,
          req.body.RCData.Comentarios,
          false,
          true
        ]
      await connection.execute(sql3, values3);

      let Data = req.body
      if (responceElectronicData && responceElectronicData.Result.IsValid === 'true') {
        Data.Result = responceElectronicData.Result
      } else if (responceElectronicData && responceElectronicData.Result.IsValid === 'false') {
        Data.Result = responceElectronicData.Result
      }
      // Confirm the transaction
      await connection.commit();
      res.status(200).json(Data);
  } catch (error) {
      // In case of error, the transaction is returned
      await connection.rollback();
      console.log("este es el error de la venta nueva ", error);
      res.status(500).json(error);
  } finally {
      // Close the connection
      await connection.end();
  }
}

export const getSalesPerDay = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
    const [salesList] = await connection.query(`SELECT
                                                  cv.Consecutivo,
                                                  cv.Folio,
                                                  cv.IdCliente,
                                                  CASE 
                                                WHEN cv.IdCliente = 0 THEN '222222222222'
                                                ELSE cli.NitCC
                                                  END AS NitCC,
                                                CASE 
                                                WHEN cv.IdCliente = 0 THEN 'Consumidor final'
                                                ELSE cli.Nombre
                                                  END AS Nombre,
                                                CASE 
                                                WHEN cv.IdCliente = 0 THEN ''
                                                ELSE cli.Apellido
                                                  END AS Apellido,
                                                CASE 
                                                WHEN cv.IdCliente = 0 THEN ''
                                                ELSE cli.Telefono1
                                                  END AS Telefono1,
                                                CASE 
                                                WHEN cv.IdCliente = 0 THEN ''
                                                  ELSE cli.Telefono2
                                                END AS Telefono2,
                                                CASE 
                                                WHEN cv.IdCliente = 0 THEN ''
                                                  ELSE cli.Barrio
                                                END AS Barrio,
                                                CASE 
                                                WHEN cv.IdCliente = 0 THEN ''
                                                  ELSE cli.Correo
                                                END AS Correo,
                                                CASE 
                                                WHEN cv.IdCliente = 0 THEN ''
                                                  ELSE cli.Direccion
                                                END AS Direccion,
                                                CASE 
                                                WHEN cv.IdCliente = 0 THEN 0
                                                  ELSE cli.Tipo
                                                END AS Tipo,
                                                  cv.Fecha,
                                                  cv.CodResponsable,
                                                  cv.FacturaElectronica,
                                                  cv.Prefijo,
                                                  cv.Cufe,
                                                  cv.Resolucion,
                                                  flu.Efectivo,
                                                  flu.Transferencia,
                                                  flu.Comentarios
                                              FROM
                                                  cabeceraventas AS cv
                                              LEFT JOIN
                                                  clientes AS cli ON cv.IdCliente = cli.Consecutivo
                                              LEFT JOIN
                                                  flujodedinero AS flu ON flu.ConsecutivoCV = cv.Consecutivo
                                              WHERE
                                                  cv.IdFerreteria = ? AND DATE(cv.Fecha) = ?
                                              GROUP BY cv.Consecutivo
                                              ORDER BY cv.Folio DESC;`, [req.body.IdFerreteria, req.body.Fecha]);
    const [salesDetail] = await connection.query(`SELECT
                                                      sa.ConsecutivoVenta AS Consecutivo,
                                                      sa.ConsecutivoProd,
                                                      SUM(sa.Cantidad) AS CantidadSa,
                                                      IFNULL(en.TotalCantidadEn, 0) AS CantidadEn,
                                                      sa.Cod,
                                                      sa.Descripcion,
                                                      sa.Medida,
                                                      sa.UMedida,
                                                      sa.VrUnitario,
                                                      sa.VrCosto,
                                                      sa.Iva
                                                  FROM
                                                      salidas AS sa
                                                  LEFT JOIN (
                                                      SELECT
                                                          ConsecutivoCompra,
                                                          ConsecutivoProd,
                                                          Medida,
                                                          SUM(Cantidad) AS TotalCantidadEn
                                                      FROM
                                                          entradas
                                                      WHERE
                                                          Motivo = 'Devolución mercancia'
                                                          AND DATE(Fecha) = ?
                                                    AND ConsecutivoCompra <> 0
                                                      GROUP BY
                                                          ConsecutivoProd, Medida, ConsecutivoCompra
                                                  ) AS en ON en.ConsecutivoProd = sa.ConsecutivoProd 
                                                          AND en.Medida = sa.Medida 
                                                          AND sa.ConsecutivoVenta = en.ConsecutivoCompra
                                                  WHERE
                                                      sa.IdFerreteria = ?
                                                      AND DATE(sa.Fecha) = ?
                                                      AND sa.ConsecutivoVenta <> 0
                                                  GROUP BY
                                                      sa.ConsecutivoProd,
                                                      sa.Medida,
                                                      sa.ConsecutivoVenta,
                                                      sa.Cod,
                                                      sa.Descripcion,
                                                      sa.UMedida,
                                                      sa.VrUnitario,
                                                      sa.VrCosto,
                                                      sa.Iva`, [req.body.Fecha, req.body.IdFerreteria, req.body.Fecha]);
    // Crear un mapa para agrupar las medidas por Consecutivo
    const rowsMap = salesDetail.reduce((map, row) => {
      if (!map[row.Consecutivo]) {
        map[row.Consecutivo] = [];
      }
      map[row.Consecutivo].push({
        ConsecutivoVenta: row.Consecutivo,
        ConsecutivoProd: row.ConsecutivoProd,
        CantidadEn: row.CantidadEn,
        CantidadSa: row.CantidadSa,
        Cod: row.Cod,
        Descripcion: row.Descripcion,
        Medida: row.Medida,
        UMedida: row.UMedida,
        VrUnitario: row.VrUnitario,
        VrCosto: row.VrCosto,
        Iva: row.Iva
      });
      return map;
    }, {});
    
    // Agregar las medidas correspondientes a cada producto
    for (let product of salesList) {
      product.Orden = rowsMap[product.Consecutivo] || [];
      product.Total = product.Orden.reduce((suma, element) => {
        return suma + (element.Cantidad * element.VrUnitario);
      }, 0);
    };
    res.status(200).json(salesList);
  } catch (error) {
    // In case of error, the transaction is returned
    await connection.rollback();
    console.log("este es el error del nuevo producto ", error);
    res.status(500).json(error);
  } finally {
      // Close the connection
      await connection.end();
  }
}

export const getCashFlow = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
    const [cashFlowlist] = await connection.query(`SELECT
                                                    flu.Consecutivo,
                                                    flu.Efectivo,
                                                    flu.Motivo,
                                                    flu.Comentarios,
                                                    flu.Fecha,
                                                    flu.TipoDeFlujo,
                                                    flu.Activo
                                                  FROM
                                                    flujodedinero AS flu
                                                  WHERE
                                                    IdFerreteria = ?
                                                  AND
                                                    DATE(flu.Fecha) = ?
                                                  AND
                                                    ConsecutivoCV = 0`, [req.body.IdFerreteria,
                                                                         req.body.Fecha])
    res.status(200).json(cashFlowlist);
  } catch (error) {
    // In case of error, the transaction is returned
    await connection.rollback();
    console.log("este es el error del flujo de dinero ", error);
    res.status(500).json(error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

export const updateRemoveFlow = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
    const [cashFlowlist] = await connection.query(`UPDATE
                                                    flujodedinero
                                                  SET
                                                    Activo = 0
                                                  WHERE
                                                    IdFerreteria = ? AND Consecutivo = ?`, [req.body.IdFerreteria,
                                                                                            req.body.Consecutivo])
    res.status(200).json(cashFlowlist);
  } catch (error) {
    // In case of error, the transaction is returned
    await connection.rollback();
    console.log("este es el error del flujo de dinero ", error);
    res.status(500).json(error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

export const putNewMoneyFlow = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
    const [newMoneyFlow] = await connection.query(`INSERT INTO flujodedinero (ConsecutivoCV,
                                                                              IdFerreteria,
                                                                              Fecha,
                                                                              Referencia,
                                                                              Efectivo,
                                                                              Transferencia,
                                                                              Motivo,
                                                                              Comentarios,
                                                                              TipoDeFlujo,
                                                                              Activo)
                                                                  VALUES (?,
                                                                          ?,
                                                                          ?,
                                                                          ?,
                                                                          ?,
                                                                          ?,
                                                                          ?,
                                                                          ?,
                                                                          ?,
                                                                          ?)`, [req.body.ConsecutivoCV,
                                                                                req.body.IdFerreteria,
                                                                                req.body.Fecha,
                                                                                req.body.Referencia,
                                                                                req.body.Efectivo,
                                                                                req.body.Transferencia,
                                                                                req.body.Motivo,
                                                                                req.body.Comentarios,
                                                                                req.body.TipoDeFlujo,
                                                                                req.body.Activo]);
    res.status(200).json({ message: 'Transacción completada con éxito' });
  } catch (error) {
    console.error("Error en la función putNewMoneyFlow: ", error);
    res.status(500).json(error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

export const putNewOutput = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
    const [newMoneyFlow] = await connection.query(`INSERT INTO
                                                        entradas (CodInterno,
                                                                  IdFerreteria,
                                                                  ConsecutivoProd,
                                                                  Cantidad,
                                                                  Cod,
                                                                  Descripcion,
                                                                  PCosto,
                                                                  PCostoLP,
                                                                  Fecha,
                                                                  Iva,
                                                                  CodResponsable,
                                                                  Responsable,
                                                                  Motivo,
                                                                  ConsecutivoCompra,
                                                                  Medida,
                                                                  UMedida)
                                                        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [req.body.CodInterno,
                                                                                                    req.body.IdFerreteria,
                                                                                                    req.body.ConsecutivoProd,
                                                                                                    req.body.Cantidad,
                                                                                                    req.body.Cod,
                                                                                                    req.body.Descripcion,
                                                                                                    req.body.PCosto,
                                                                                                    req.body.PCostoLP,
                                                                                                    req.body.Fecha,
                                                                                                    req.body.Iva,
                                                                                                    req.body.CodResponsable,
                                                                                                    req.body.Responsable,
                                                                                                    req.body.Motivo,
                                                                                                    req.body.ConsecutivoCompra,
                                                                                                    req.body.Medida,
                                                                                                    req.body.UMedida]);
        res.status(200).json({ message: 'Transacción completada con éxito' });
  } catch (error) {
    console.error("Error en la función putNewMoneyFlow: ", error);
    res.status(500).json(error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

export const getCRDetail = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
    const [cashflow] = await connection.query(`SELECT
                                                fd.Motivo,
                                                fd.TipoDeFlujo,
                                                SUM(fd.Efectivo) AS Efectivo,
                                                SUM(fd.Transferencia) AS Transferencia
                                              FROM
                                                flujodedinero AS fd
                                              WHERE
                                                fd.IdFerreteria = ? AND fd.Activo = '1' AND DATE(fd.Fecha) = ?
                                              GROUP BY
                                                fd.Motivo, fd.TipoDeFlujo`,[req.body.IdFerreteria, req.body.Fecha])
    const dictionary = {};

    cashflow.forEach(item => {
      dictionary[item.Motivo] = {
        TipoDeFlujo: item.TipoDeFlujo,
        Efectivo: item.Efectivo,
        Transferencia: item.Transferencia
        // agrega otros datos si es necesario
      };
    });
    res.status(200).json(dictionary)
  } catch (error) {
    console.error("Error en la función getCRDetail: ", error);
    res.status(500).json(error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

export const getSubClases = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
    const [subclases] = await connection.query(`SELECT
                                                  UMedida,
                                                  Nombre
                                                FROM
                                                  subclases
                                                WHERE
                                                  Id = ?`,[req.body.IdClase])
    res.status(200).json(subclases)
  } catch (error) {
    console.error("Error en la función getCRDetail: ", error);
    res.status(500).json(error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

export const getSalesByCategory = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
    const [salesByCategory] = await connection.query(`SELECT
                                                        ca.Categoria,
                                                        SUM(Cantidad * Vrunitario) AS ventas,
                                                        SUM(Cantidad * VrCosto) - IFNULL(en.Devoluciones, 0) AS Costos
                                                      FROM
                                                        salidas AS sa
                                                      LEFT JOIN
                                                        productos AS pro ON sa.ConsecutivoProd = pro.Consecutivo
                                                      LEFT JOIN
                                                        subcategorias AS sc ON sc.IdSubCategoria = pro.SubCategoria
                                                      LEFT JOIN
                                                        categorias AS ca ON ca.IdCategoria = sc.IdCategoria
                                                      LEFT JOIN
                                                        (SELECT
                                                          ca.Categoria,
                                                          SUM(Cantidad * PCosto) AS Devoluciones
                                                        FROM
                                                          entradas AS en
                                                        LEFT JOIN
                                                          productos AS pro ON en.ConsecutivoProd = pro.Consecutivo
                                                        LEFT JOIN
                                                          subcategorias AS sc ON sc.IdSubCategoria = pro.SubCategoria
                                                        LEFT JOIN
                                                          categorias AS ca ON ca.IdCategoria = sc.IdCategoria
                                                        WHERE
                                                          en.IdFerreteria = ? AND en.Motivo = 'Devolución mercancia' AND DATE(en.Fecha) = ?
                                                        GROUP BY
                                                          ca.Categoria) AS en ON en.Categoria = ca.Categoria
                                                      WHERE
                                                        sa.IdFerreteria = ? AND sa.Motivo = 'Venta por caja' AND DATE(sa.Fecha) = ?
                                                      GROUP BY
                                                        ca.Categoria`,[req.body.IdFerreteria, req.body.Fecha, req.body.IdFerreteria, req.body.Fecha])
    res.status(200).json(salesByCategory)
  } catch (error) {
    console.error("Error en la función SalesByCategory: ", error);
    res.status(500).json(error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

export const getBestProducts = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
    const [bestProducts] = await connection.query(`SELECT
                                                        sa.ConsecutivoProd,
                                                        pro.Cod,
                                                        SUM(sa.Cantidad/sa.UMedida) AS cantidad,
                                                        pro.Descripcion
                                                      FROM
                                                        salidas AS sa
                                                      LEFT JOIN
                                                        productos AS pro ON pro.Consecutivo = sa.Consecutivo
                                                      WHERE
                                                        sa.IdFerreteria = ? AND DATE(sa.Fecha) = ?
                                                      GROUP BY
                                                        sa.ConsecutivoProd
                                                      ORDER BY
                                                        SUM(sa.Cantidad/sa.UMedida) DESC
                                                      LIMIT 5`,[req.body.IdFerreteria, req.body.Fecha])
    res.status(200).json(bestProducts)
  } catch (error) {
    console.error("Error en la función SalesByCategory: ", error);
    res.status(500).json(error);
  } finally {
    // Close the connection
    await connection.end();
  }
}


export const getCategriesPages = async (req, res ) => {
  const connectSivar = await connect()
  try {
    const [categories] = await connectSivar.query(`SELECT
                                                    cat.IDCategoria,
                                                    cat.Categoria,
                                                    cat.Pag
                                                  FROM
                                                    categoria AS cat
                                                  WHERE
                                                    cat.Pag <> ''`)
    res.status(200).json(categories)
  } catch (error) {
    console.error("Error en la función getCategriesPages: ", error);
    res.status(500).json(error);
  } finally {
    await connectSivar.end();
  }
}
//*Other functions
export const bestRoute = async (req, res) => {
  const connection = await connect();
  try {
    const puntoDeOrigenInicial = [4.609979, -74.140089];
    let puntoDeOrigen = puntoDeOrigenInicial.slice();
    let route = [];
    let clientes = [];

    const [routeslist] = await connection.query(`SELECT
                                                    cli.Cod,
                                                    cli.Ferreteria,
                                                    cli.Geolocalizacion,
                                                    SUBSTRING_INDEX(cli.Geolocalizacion, ',', 1) AS Latitude,
                                                    SUBSTRING_INDEX(cli.Geolocalizacion, ',', -1) AS Longitude
                                                  FROM
                                                    clientes AS cli
                                                  RIGHT JOIN
                                                    tabladeestados AS tde ON cli.Cod = tde.CodCliente
                                                  WHERE
                                                    tde.ProcesoDelPedido = 'En ruta' AND tde.Repartidor = ?
                                                  GROUP BY
                                                    cli.Ferreteria`, [req.body.usuario]);

    routeslist.unshift({
      "Cod": 0,
      "Ferreteria": "Comercializadora Sivar",
      "Geolocalizacion": "4.609979,-74.140089",
      "Latitude": 4.609979,
      "Longitude": -74.140089
    });

    let isFirstIteration = true;

    while (routeslist.length > 1) { // Exclude the last item as destination
      let distanciaMinima = Infinity;
      let posicion = 0;
      for (let i = 0; i < routeslist.length; i++) {
        let distancia = Math.sqrt(
          (puntoDeOrigen[0] - routeslist[i].Latitude) ** 2 +
          (puntoDeOrigen[1] - routeslist[i].Longitude) ** 2
        );
        if (distancia < distanciaMinima) {
          distanciaMinima = distancia;
          posicion = i;
        }
      }

      // Remove the first entry after the first iteration
      if (isFirstIteration) {
        routeslist.shift(); // Remove the starting point from routeslist
        isFirstIteration = false; // Set the flag to false after the first iteration
        continue; // Skip the rest of the first iteration
      }

      puntoDeOrigen = [routeslist[posicion].Latitude, routeslist[posicion].Longitude];
      route.push(routeslist[posicion].Geolocalizacion);
      clientes.push(routeslist[posicion]);
      routeslist.splice(posicion, 1);
    }

    // Last entry as destination
    let destination = route.pop();
    let origin = puntoDeOrigenInicial.join(',');
    let waypoints = route.join('|');

    let googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`;
    let noSpacesStr = googleMapsUrl.replace(/\s+/g, '');

    res.status(200).json({ clientes, noSpacesStr });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  } finally {
    await connection.end();
  }
}

export const inserSivarList = async (req, res) => {
  const connection = await connectDBSivarPos();
  const connectionSivar = await connect()
  try {
    const [getDataFromSivar] = await connectionSivar.query(`SELECT
                                                      Cod,
                                                      Descripcion,
                                                      CASE 
                                                        WHEN EsUnidadOpaquete > 1 THEN 1
                                                        ELSE 0
                                                      END AS EsUnidadOpaquete,
                                                      SubCategoria,
                                                      Detalle,
                                                      Iva
                                                    FROM
                                                      productos AS pro`)
    
    const sendDataToSivarPos = `INSERT INTO
                                      productos (IdFerreteria,
                                                  Cod,
                                                  Descripcion,
                                                  Clase,
                                                  SubCategoria,
                                                  Detalle,
                                                  Iva,
                                                  SVenta)
                                      VALUES (?,?,?,?,?,?,?,?)` 
    for (const values of getDataFromSivar){
      const producto = [
        '0',
        values.Cod,
        values.Descripcion,
        values.EsUnidadOpaquete,
        values.SubCategoria,
        values.Detalle,
        values.Iva,
        '1'
      ];
        await connection.query(sendDataToSivarPos, producto);
    }
    res.status(200).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  } finally {
    // Close the connection
    await connection.end();
    await connectionSivar.end();
  }
}

export const ChechUserDataPos = async (req, res) => {
  const connection = await connect(); // Conectarse a la base de datos
  try {
    // Buscar los datos del cliente en la base de datos
    const [rows] = await connection.query(`SELECT Cli.Cod,
                                                  Cli.Ferreteria,
                                                  Cli.Contacto,
                                                  Cli.Direccion,
                                                  Cli.Telefono,
                                                  Cli.Cel,
                                                  Cli.Email,
                                                  Cli.Contraseña,
                                                  Cli.Nit,
                                                  Cli.VerificacionNit AS Dv,
                                                  Cli.Tipo,
                                                  Cli.ResFiscal,
                                                  Co.Nombre As Asesor
                                          FROM
                                            clientes AS Cli
                                          LEFT JOIN colaboradores AS Co ON Cli.CodVendedor = Co.Cod
                                          WHERE Cli.Email = ?`, [req.body.EmailUser]);

    // Verificar si se encontró al usuario
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];
    const dbPassword = user.Contraseña;

    // Verificar si la contraseña ingresada coincide con la almacenada
    const passwordMatches = await bcrypt.compare(req.body.Password, dbPassword);
    
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Si la contraseña coincide, generar el token JWT
    const token = jwt.sign({ userId: user.Cod }, process.env.SECRET, { expiresIn: '24h' });
    user.token = token;

    // Eliminar la contraseña del objeto antes de enviar la respuesta
    delete user.Contraseña;

    // Guardar el token en la base de datos
    const saveTokenQuery = `INSERT INTO tokens (Cod, Token)
                            VALUES (?, ?)
                            ON DUPLICATE KEY UPDATE
                                Token = VALUES(Token);
                            `;
    await connection.execute(saveTokenQuery, [user.Cod,token]);

    const [Resolucion] = await connection.query(`SELECT
                                                  NumeroResolucion,
                                                  FechaInicio,
                                                  FechaFinal,
                                                  Prefijo,
                                                  NumeroInicial,
                                                  NumeroFinal,
                                                  ClaveTecnica
                                                FROM
                                                  resoluciones
                                                WHERE
                                                  IdFerreteria = ?`, [rows[0]['Cod']]);
    user.Resolucion = Resolucion;
    //This part of the code is to get the infomration from the coltek API
    const logInColtek = {
                          email: "sivar@colsad.com",
                          password: "Sivar2024*"
                        }

    const resColtekLogIn = await fetch(`http://sivar.colsad.com/api/v1/login`,{
        method: 'POST',
        headers: { Accept: 'application/json','Content-Type': 'application/json'},
        body: JSON.stringify(logInColtek)
    })
    const respuesta = await resColtekLogIn.json()
    user.resColtek = respuesta

    // Enviar la información del usuario y el token al cliente
    res.status(200).json(user);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // Cerrar la conexión a la base de datos
    await connection.end();
  }
};

export const verifyToken = async (req, res) => {
  const connection = await connect(); // Conectarse a la base de datos
  try {
    // Obtener el token del encabezado Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Asume formato "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    // Verificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET);
    } catch (error) {
      return res.status(403).json({ authorization: false });
    }
    // Buscar el token en la base de datos
    const [rows] = await connection.query('SELECT Token FROM tokens WHERE Token = ? AND Cod = ?', [token, decoded.userId]);

    if (rows.length === 0) {
      return res.status(403).json({ authorization: false });
    } else {
      return res.status(200).json({ authorization: true})
    }
  } catch (error) {
    console.error(error);
    //res.status(403).json({ error: 'Invalid token' });
    return res.status(403).json({ authorization: false });
  } finally {
    // Cerrar la conexión a la base de datos
    await connection.end();
  }
};

export const getClientOcupation = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
    const [rows] = await connection.query(`SELECT
                                            IdOcupacion,
                                            Ocupacion
                                          FROM
                                            ocupaciones`);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    //res.status(403).json({ error: 'Invalid token' });
    return res.status(403).json({ authorization: false });
  } finally {
    // Cerrar la conexión a la base de datos
    await connection.end();
  }
};

export const getDataLoginColtek = async (req, res) => {
  const connection = await connect(); // Conectarse a la base de datos
  try {
    // Obtener el token del encabezado Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Asume formato "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    // Verificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET);
    } catch (error) {
      return res.status(403).json({ authorization: false });
    }
    // Buscar el token en la base de datos
    const [rows] = await connection.query(`SELECT
                                            Token FROM tokens WHERE Token = ? AND Cod = ?`, [token, decoded.userId]);

    if (rows.length === 0) {
      return res.status(403).json({ authorization: false });
    } else {
      const [ConnectionColtek] = await connection.query(`SELECT Api,
                                                                Usuario,
                                                                Clave
                                                        FROM resoluciones WHERE IdFerreteria = ?`, [decoded.userId]);
      return res.status(200).json(ConnectionColtek)
    }
  } catch (error) {
    console.error(error);
    //res.status(403).json({ error: 'Invalid token' });
    return res.status(403).json({ authorization: false });
  } finally {
    // Cerrar la conexión a la base de datos
    await connection.end();
  }
};