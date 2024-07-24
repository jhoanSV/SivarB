import { connect, connectDBSivarPos } from "../database";
const bcrypt = require('bcryptjs');


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
                                                p.Detalle
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
                                                            ) / (SELECT COUNT(Codigo) FROM salidas WHERE CodCliente = '259' AND NDePedido <> '0') AS Score
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
                                                    PVenta,
                                                    Iva,
                                                    Agotado,
                                                    Detalle,
                                                    Score
                                                FROM
                                                    RankedResults
                                                WHERE
                                                    RowNum = 1 AND Cod <> '1'
                                                ORDER BY
                                                    Score DESC;`,[req.body.CodUser,req.body.CodUser,req.body.CodUser,req.body.CodUser,req.body.CodUser,req.body.CodUser,req.body.CodUser,req.body.CodUser,req.body.CodUser]);
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
        //console.log(dbPassword);
        bcrypt.compare(req.body.Password, dbPassword, function(err, result) {
          if (err) {
            // Handle error
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
          } else if (result) {
            // Passwords match
            delete rows[0].Contraseña
            res.json(rows[0]);
            //console.log(rows[0])
          } else {
            // Passwords do not match
            console.log('Password is incorrect');
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
        //console.log(dbPassword);
  
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
            console.log('Password is incorrect');
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




//to the sivar pos %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

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
                                                                        Fecha)
                                                          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[req.body.IdFerreteria,
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
                                                                                                  req.body.Fecha]);
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
                                              cli.Fecha
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
                    Nota = ?
                  WHERE
                    Consecutivo = ? AND IdFerreteria = ?`
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
                     req.body.Consecutivo,
                     req.body.IdFerreteria]
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
                                          Iva) 
                                  VALUES (?,?,?,?,?,?,?)`
      const values1 = [req.body.IdFerreteria,
                       req.body.Cod,
                       req.body.Descripcion,
                       req.body.Clase,
                       req.body.IdSubCategoria,
                       req.body.Detalle,
                       req.body.Iva]
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
                                                          Ubicacion,
                                                          Medida,
                                                          UMedida,
                                                          PrecioUM)
                                      VALUES (?,?,?,?,?,?,?,?,?,?)`
      const values2 = [Consecutivo,
                       req.body.IdFerreteria,
                       req.body.PCosto,
                       req.body.PVenta,
                       req.body.InvMinimo,
                       req.body.InvMaximo,
                       req.body.Ubicacion,
                       req.body.Medida,
                       req.body.UMedida,
                       req.body.PrecioUM]
      await connection.execute(sql2, values2);

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
                                          ConsecutivoCompra)
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
                       0]
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
                                                    IFNULL(dpro.PCosto,0) AS PCosto,
                                                    IFNULL(dpro.PVenta,0) AS PVenta,
                                                    IFNULL(dpro.Ubicacion, '') AS Ubicacion,
                                                    IFNULL(dpro.InvMinimo, 0) AS InvMinimo,
                                                    IFNULL(dpro.InvMaximo, 0) AS InvMaximo,
                                                    ca.Categoria,
                                                    subca.SubCategoria,
                                                    subca.IdSubCategoria,
                                                    pro.Clase,
                                                    pro.Detalle,
                                                    CAST(COALESCE(en.entradas, 0) - COALESCE(sa.salidas, 0) AS DOUBLE) AS Inventario,
                                                    IFNULL(dpro.Medida, '') AS Medida,
                                                    IFNULL(dpro.UMedida, 0) AS UMedida,
                                                    IFNULL(dpro.PrecioUM, 0) AS PrecioUM
                                                  FROM
                                                    productos AS pro
                                                    LEFT JOIN detalleproductoferreteria AS dpro ON pro.Consecutivo = dpro.Consecutivo
                                                    LEFT JOIN medida AS me ON pro.Consecutivo = me.Consecutivo
                                                    JOIN subcategorias AS subca ON pro.SubCategoria = subca.IdSubCategoria
                                                    JOIN categorias AS ca ON subca.IdCategoria = ca.IdCategoria
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
                                                    pro.IdFerreteria = '' OR pro.IdFerreteria = ?`, [req.body.IdFerreteria])
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
                                                        pro.Cod,
                                                        pro.Descripcion,
                                                        COALESCE(en.entradas, 0) - COALESCE(sa.salidas, 0) AS Inventario,
                                                        det.PCosto,
                                                        det.PVenta,
                                                        det.InvMinimo,
                                                        det.InvMaximo
                                                    FROM
                                                        productos AS pro
                                                        LEFT JOIN detalleproductoferreteria AS det ON pro.Consecutivo = det.Consecutivo
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
                                                        det.IdFerreteria = ?
                                                    GROUP BY 
                                                        pro.Consecutivo`,[req.body.IdFerreteria])
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

    const [queryCantidad] = await connection.query(`
      SELECT
        Consecutivo
      FROM
        detalleproductoferreteria
      WHERE
        Consecutivo = ? AND IdFerreteria = ?`, 
      [req.body.ConsecutivoProd, req.body.IdFerreteria]);

    const detalleSql = queryCantidad.length > 0 
      ? `
        UPDATE
          detalleproductoferreteria
        SET
          PCosto = ?,
          PVenta = ?,
          Ubicacion = ?,
          InvMinimo = ?,
          InvMaximo = ?,
          Medida = ?,
          UMedida = ?,
          PrecioUM = ?
        WHERE
          Consecutivo = ? AND IdFerreteria = ?`
      : `
        INSERT INTO
          detalleproductoferreteria
            (Consecutivo,
            IdFerreteria,
            PCosto,
            PVenta,
            InvMinimo,
            InvMaximo,
            Ubicacion,
            Medida,
            UMedida,
            PrecioUM
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const detalleValues = queryCantidad.length > 0 
      ? [
          req.body.PCosto,
          req.body.PVenta,
          req.body.Ubicacion,
          req.body.InvMinimo,
          req.body.InvMaximo,
          req.body.Medida,
          req.body.UMedida,
          req.body.PrecioUM,
          req.body.ConsecutivoProd,
          req.body.IdFerreteria
        ]
      : [
          req.body.ConsecutivoProd,
          req.body.IdFerreteria,
          req.body.PCosto,
          req.body.PVenta,
          req.body.InvMinimo,
          req.body.InvMaximo,
          req.body.Ubicacion,
          req.body.Medida,
          req.body.UMedida,
          req.body.PrecioUM
        ];

    await connection.execute(detalleSql, detalleValues);
    await connection.commit();
    res.status(200).json({ message: 'Transacción completada con éxito' });
  } catch (error) {
    await connection.rollback();
    console.log(error);
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
    const [productData, [queryCantidad]] = await Promise.all([
      connection.query(`SELECT
                        pro.Cod,
                        pro.Descripcion,
                        pro.subcategoria,
                        pro.Detalle
                      FROM
                        productos AS pro
                      WHERE
                        pro.Consecutivo = ?`, [req.body.ConsecutivoProd]),
    
    //Fourth query of the consecutive of the new product in entradas but the inner consecutive
      connection.query(`SELECT
                          IFNULL(en.entradas, 0) - IFNULL(sa.salidas, 0) AS Cantidad
                      FROM
                          (SELECT
                              ConsecutivoProd,
                              SUM(Cantidad) AS entradas
                          FROM
                              entradas
                          WHERE
                              ConsecutivoProd = ? AND IdFerreteria = ?
                          GROUP BY
                              ConsecutivoProd) AS en
                      LEFT JOIN
                          (SELECT
                              ConsecutivoProd,
                              SUM(Cantidad) AS salidas
                          FROM
                              salidas
                          WHERE
                              ConsecutivoProd = ? AND IdFerreteria = ?
                          GROUP BY
                              ConsecutivoProd) AS sa
                      ON en.ConsecutivoProd = sa.ConsecutivoProd`, [req.body.ConsecutivoProd,
                                                                    req.body.IdFerreteria,
                                                                    req.body.ConsecutivoProd,
                                                                    req.body.IdFerreteria]
      )
    ]);
    
    const cantidadactual = parseFloat(queryCantidad[0].Cantidad);
    value = Math.abs(cantidadactual-req.body.Cantidad)
    const difference = req.body.Cantidad - cantidadactual
    
    console.log("Cantidad actual ", cantidadactual);
    console.log("Cantidad", req.body.Cantidad);
    console.log("value ", value);
    //
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
                                          ConsecutivoCompra)
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
                        0]
      await connection.execute(sql1, values1);
      console.log("entro a entradas")
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
                                         Fecha)
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
                      req.body.Fecha]
    await connection.execute(sql2, values2);
    console.log("entro a salidas")
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

//* All about purchased products
export const getPurchaseList = async (req, res) => {
  try {
      const connection = await connectDBSivarPos();
      const [purchaseList] = await connection.query(`SELECT
                                                      cc.ConInterno,
                                                      cc.NPreFactura,
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
      const [purchaseDetail] = await connection.query(`SELECT
                                                        cpi.Cantidad,
                                                        cpi.Cod,
                                                        pro.Descripcion,
                                                        cpi.VrUnitarioFactura,
                                                        dpro.PCosto,
                                                        COALESCE(en.entradas, 0) - COALESCE(sa.salidas, 0) AS Inventario,
                                                        cpi.verificado
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
                                                        cpi.NPrefactura = ? AND cpi.IdFerreteria = ?`, [req.body.NPrefactura ,req.body.IdFerreteria]);
      res.status(200).json(purchaseDetail);
      connection.end();
  } catch (error) {
      console.log(error);
      res.status(500).json(error);
  }
}

/*export const putAddPurchase = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
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
                                          ConsecutivoCompra)
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
                                              ?)`
    for (const entry of req.body.Order) {
      const [DetalleProductoPorFerreteria] = await connection.query(`SELECT
                                                                      Consecutivo
                                                                    FROM
                                                                      detalleproductoferreteria
                                                                    WHERE
                                                                      Consecutivo = ? AND IdFerreteria = ?`, [req.body.Consecutivo, req.body.IdFerreteria])
      if (DetalleProductoPorFerreteria.length > 0) {
        const sql2 = `UPDATE
                        detalleproductoferreteria
                      SET
                        PCosto =?,
                        PVenta =?,
                        Ubicacion =?,
                        InvMinimo =?,
                        InvMaximo =?,
                        Medida =?,
                        UMedida =?,
                        PrecioUM =?
                      WHERE
                        Consecutivo = ?`
      const values2 = [req.body.PCosto,
                       req.body.PVenta,
                       req.body.Ubicacion,
                       req.body.InvMinimo,
                       req.body.InvMaximo,
                       req.body.Medida,
                       req.body.UMedida,
                       req.body.PrecioUM,
                       req.body.ConsecutivoProd]
      await connection.execute(sql2, values2);
      } else {
        const values1 = [
          "000",
          req.body.IdFerreteria,		      
          req.body.ConsecutivoProd,
          entry.Cantidad,
          entry.Cod,
          entry.Descripcion,
          entry.PCosto,
          entry.PCostoLP,
          req.body.Fecha,
          entry.Iva,
          req.body.CodResponsable,
          req.body.Responsable,
          req.body.Motivo,
          req.body.ConsecutivoCompra
        ];
        await connection.execute(sql1, values1);
      }
    }


    const [purchaseList] = await connection.query(`SELECT
                                                        cc.ConInterno,
                                                        cc.NPreFactura,
                                                        cc.Estado,
                                                        cc.Fecha,
                                                        SUM(cpi.Cantidad * cpi.VrUnitarioFactura)
                                                    FROM
                                                        cabeceracompras AS cc
                                                    INNER JOIN
                                                        comprasporingresar AS cpi ON cc.NPreFactura = cpi.NPrefactura
                                                    WHERE
                                                        cc.IdFerreteria = ?
                                                    GROUP BY
                                                        cc.NPreFactura
                                                    ORDER DESC`, [req.body.IdFerreteria]);
    res.status(200).json(purchaseList);
    connection.end();
  } catch (error) {
      console.log(error);
      res.status(500).json(error);
  }
}*/

export const putAddPurchase = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
    await connection.beginTransaction();
    const insertEntradasQuery = `INSERT INTO entradas (CodInterno,
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
                                          ConsecutivoCompra)
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
                                              ?)`
    const insertDetalleQuery  = `INSERT INTO 
                                  detalleproductoferreteria
                                ( IdFerreteria,
                                  PCosto,
                                  PVenta,
                                  InvMinimo,
                                  InvMaximo,
                                  Ubicacion,
                                  Medida,
                                  UMedida,
                                  PrecioUM)
                                VALUES (?,
                                        ?,
                                        ?,
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
                                  PVenta =?`
    for (const entry of req.body.Order) {
      const [DetalleProductoPorFerreteria] = await connection.query(`SELECT
                                                                      Consecutivo
                                                                    FROM
                                                                      detalleproductoferreteria
                                                                    WHERE
                                                                      Consecutivo = ? AND IdFerreteria = ?`, [req.body.Consecutivo, req.body.IdFerreteria])
      if (DetalleProductoPorFerreteria.length > 0) {
        const valuesUpdate = [req.body.PCosto,
                              req.body.PVenta,
                              req.body.ConsecutivoProd]
        await connection.execute(updateDetalleQuery, valuesUpdate);
      } else {
        const valuesInsert = [
          "000",
          req.body.IdFerreteria,		      
          req.body.ConsecutivoProd,
          entry.Cantidad,
          entry.Cod,
          entry.Descripcion,
          entry.PCosto,
          entry.PCostoLP,
          req.body.Fecha,
          entry.Iva,
          req.body.CodResponsable,
          req.body.Responsable,
          req.body.Motivo,
          req.body.ConsecutivoCompra
        ]
        await connection.execute(insertDetalleQuery, valuesInsert)
      }
      await connection.execute(insertEntradasQuery, valuesInsert);
    }
    // Confirm the transaction
    await connection.commit();
    res.status(200).json({ message: 'Transacción completada con éxito' });
  } catch (error) {
    await connection.rollback();
    console.log("este es el error de la compra nueva ", error);
    res.status(500).json(error);
  } finally {
      // Close the connection
      await connection.end();
  }
}

//* All about sales
export const putNewSale = async (req, res) => {
  const connection = await connectDBSivarPos();
  try {
      //Start the transaction
      await connection.beginTransaction();
      const Cufe = "000"
      const FacturaElectronica = "000"

      //!To the inter database
      //First insertion to the table cabeceraventas
      const sql1 = `INSERT INTO cabeceraventas (IdFerreteria,
                                                Folio,
                                                IdCliente,
                                                Fecha,
                                                CodResponsable,
                                                FacturaElectronica,
                                                Cufe)
                                            VALUES (?,?,?,?,?,?,?)`
      const values1 = [req.body.IdFerreteria,
                       req.body.Folio,
                       req.body.IdCliente,
                       req.body.Fecha,
                       req.body.CodResponsable,
                       FacturaElectronica,
                       Cufe]
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
                                         Fecha)
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
                                        ?)`
      for (const entry of req.body.Order) {
        const values2 = [
            Consecutivo,
            req.body.IdFerreteria,
            entry.ConsecutivoProd,
            entry.Cantidad,
            entry.Cod,
            entry.Descripcion,
            entry.VrUnitario,
            entry.VrCosto,
            req.body.CodResponsable,
            req.body.Responsable,
            entry.Iva,
            entry.Motivo,
            req.body.Fecha
        ];
        await connection.execute(sql2, values2);
      }

      // Confirm the transaction
      await connection.commit();
      res.status(200).json({ message: 'Transacción completada con éxito' });
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
    const [purchaseList] = await connection.query(`SELECT
                                                    cv.Consecutivo,
                                                    cv.Fecha,
                                                    cv.Folio,
                                                    cv.IdCliente,
                                                    cv.FacturaElectronica,
                                                    cv.Cufe,
                                                    sa.Cantidad,
                                                    sa.ConsecutivoProd,
                                                    sa.Cod,
                                                    sa.Descripcion,
                                                    sa.VrUnitario
                                                  FROM
                                                    cabeceraventas AS cv
                                                    JOIN salidas AS sa ON cv.Consecutivo = sa.ConsecutivoVenta
                                                  WHERE
                                                    cv.IdFerreteria = ? AND DATE(cv.Fecha) = ?
                                                  ORDER BY cv.Folio DESC`, [req.body.IdFerreteria, req.body.Fecha]);
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


/*export const bestRoute = async(req, res) => {
  const connection = await connect();
  try {
    let puntoDeOrigen = [4.609979,-74.140089]
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
    routeslist.unshift({"Cod": 0, "Ferreteria": "Comercilizadora sivar", "Geolocalizacion": "4.609979,-74.140089", "Latitude": 4.609979, "Longitude": -74.140089});
    console.log(routeslist)
    let isFirstIteration = true; // Flag to identify the first iteration
    while (routeslist.length > 0) {
      let distanciaMinima = Infinity
      let posicion = 0;
      for (let i = 0; i < routeslist.length; i++) {
        if (i === posicion) {
          continue; // Skip the current iteration if i is equal to posicion
        }
        let distancia = Math.sqrt((puntoDeOrigen[0]-routeslist[i].Latitude)**2 + (puntoDeOrigen[1]-routeslist[i].Longitude)**2)
        if (distancia < distanciaMinima) {
          distanciaMinima = distancia
          posicion = i
          console.log(distancia)
        }
      }
      // Remove the first entry after the first iteration
      if (isFirstIteration) {
        routeslist.shift(); // Remove the starting point from routeslist
        isFirstIteration = false; // Set the flag to false after the first iteration
      }
      puntoDeOrigen = [routeslist[posicion].Latitude, routeslist[posicion].Longitude]
      //console.log("puntoDeOrigen ", puntoDeOrigen)
      route.push([routeslist[posicion].Geolocalizacion])
      clientes.push(routeslist[posicion]);
      routeslist.splice(posicion, 1);
    }


    // Construct Google Maps Directions URL
    let origin = "4.609979,-74.140089"; // Remove and get the first element as origin
    let destination = route.pop(); // Remove and get the last element as destination
    let waypoints = route.join('|'); // Join the remaining elements as waypoints

    let googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`;


    console.log("route: ", route)
    res.status(200).json(clientes);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  } finally {
    // Close the connection
    await connection.end();
  }
}*/


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

    console.log("Google Maps URL: ", noSpacesStr);
    res.status(200).json({ clientes, noSpacesStr });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  } finally {
    await connection.end();
  }
}
