import http from "http";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { read, write } from "./utils/FS.js";

const options = {
  "Content-Type": "application/json",
};

const server = http.createServer(async (req, res) => {
  // GET
  if (req.method == "GET") {
    res.writeHead(200, options)
    const marketId = req.url.split("/")[2];
    const url = req.url.split("/")[1];
    if (url == "branches") {
      const branches = read("branches.json");
      const workers = read("workers.json");
      const products = read("products.json");
      if (marketId) {
        const findBranches = branches.find(
          (e) => e.id == marketId && delete e.marketid
        );
        findBranches.workers = [];
        findBranches.products = [];
        workers.filter((e) => {
          if (e.branchId == findBranches.id && delete e.branchId) {
            findBranches.workers.push(e);
          }
        });
        products.filter((e) => {
          if (e.branchId == findBranches.id && delete e.branchId) {
            findBranches.products.push(e);
          }
        });
        return res.end(JSON.stringify(findBranches));
      }
      return res.end(JSON.stringify(branches));
    }

    if (url == "markets" && marketId) {
      const market = read("market.json");
      const branches = read("branches.json");
      const workers = read("workers.json");
      const products = read("products.json");
      const findMerket = market.find((e) => e.id == marketId);

      findMerket.branches = [];

      const findBranches = branches.filter(
        (e) => e.marketid == findMerket.id && delete e.marketid
      );
      findMerket.branches.push(...findBranches);
      findBranches.map((e) => {
        e.workers = [];
        e.products = [];
        workers.filter((m) => {
          if (m.branchId == e.id && delete m.branchId) {
            e.workers.push(m);
          }
        });
        products.filter((n) => {
          if (n.branchId == e.id && delete n.branchId) {
            e.products.push(n);
          }
        });
      });

      return res.end(JSON.stringify(findMerket));
    }
    return res.end("Not found GET");
  }
  // POST
  if (req.method == "POST") {
    const marketId = req.url.split("/")[2];
    const url = req.url.split("/")[1];
    // login
    if (req.url == "/login") {
      req.on("data", (chunk) => {
        const { name, password } = JSON.parse(chunk);
        const foundUser = read("users.json").find(
          (e) => (e.name == name && e.password == password)
        );

        if (!foundUser) {
          res.writeHead(401, options);
          return res.end(
            JSON.stringify({
              message: "Unauthorized",
            })
          );
        }

        res.writeHead(200, options);
        return res.end(
          JSON.stringify({
            massage: "Successfully loggend in",
            access_token: jwt.sign(
              { id: foundUser?.id },
              process.env.SECRET_KEY
            ),
          })
        );
      });
    }

    // market post
    if (req.url == "/markets") {
      req.on("data", async (chunk) => {
        const { name } = JSON.parse(chunk);
        const { access_token } = req.headers;
        jwt.verify(access_token, process.env.SECRET_KEY, async (err) => {
          if (err instanceof jwt.JsonWebTokenError) {
            res.writeHead(401, options);
            return res.end(
              JSON.stringify({
                massage: "Invalid token",
              })
            );
          }
          const allMarket = read("market.json");

          allMarket.push({
            id: allMarket.at(-1)?.id + 1 || 1,
            name,
          });

          const newMarket = await write("market.json", allMarket);

          if (newMarket) {
            res.writeHead(201, options);
            return res.end(
              JSON.stringify({
                massage: "Post has been market",
              })
            );
          }
        });
      });
    }

    // branches post
    if (req.url == "/branches") {
      req.on("data", (chunk) => {
        const { name, addres, marketid } = JSON.parse(chunk);
        const { access_token } = req.headers;
        jwt.verify(access_token, process.env.SECRET_KEY, async (err) => {
          if (err instanceof jwt.JsonWebTokenError) {
            res.writeHead(401, options);
            return res.end(
              JSON.stringify({
                massage: "Invalid token",
              })
            );
          }
          const allBranchs = read("branches.json");

          allBranchs.push({
            id: allBranchs.at(-1)?.id + 1 || 1,
            name,
            addres,
            marketid,
          });

          const newBRanchs = await write("branches.json", allBranchs);

          if (newBRanchs) {
            res.writeHead(201, options);
            return res.end(
              JSON.stringify({
                massage: "Post has been branches",
              })
            );
          }
        });
      });
    }

    // products post
    if (req.url == "/products") {
      req.on("data", (chunk) => {
        const { title, price, branchId } = JSON.parse(chunk);
        const { access_token } = req.headers;
        jwt.verify(access_token, process.env.SECRET_KEY, async (err) => {
          if (err instanceof jwt.JsonWebTokenError) {
            res.writeHead(401, options);
            return res.end(
              JSON.stringify({
                massage: "Invalid token",
              })
            );
          }
          const allProducts = read("products.json");
          allProducts.push({
            id: allProducts.at(-1)?.id + 1 || 1,
            title,
            price,
            branchId,
          });
          const newProducts = await write("products.json", allProducts);
          if (newProducts) {
            res.writeHead(201, options);
            return res.end(
              JSON.stringify({
                massage: "Post has been created",
              })
            );
          }
        });
      });
    }

    // worker post
    if (req.url == "/worker") {
      req.on("data", (chunk) => {
        const { name, phoneNumber, branchId } = JSON.parse(chunk);
        const { access_token } = req.headers;
        jwt.verify(access_token, process.env.SECRET_KEY, async (err) => {
          if (err instanceof jwt.JsonWebTokenError) {
            res.writeHead(401, options);
            return res.end(
              JSON.stringify({
                massage: "Invalid token",
              })
            );
          }
          const allWorkers = read("workers.json");
          allWorkers.push({
            id: allWorkers.at(-1)?.id + 1 || 1,
            name,
            phoneNumber,
            branchId,
          });

          const newWorkers = await write("workers.json", allWorkers);
          if (newWorkers) {
            res.writeHead(201, options);
            return res.end(
              JSON.stringify({
                massage: "Post has been workers",
              })
            );
          }
        });
      });
    }
    return;
  }
  // PUT
  if (req.method == "PUT") {
    const marketId = req.url.split("/")[2];
    const url = req.url.split("/")[1];
    if (url == "markets" && marketId) {
      req.on("data", async (chunk) => {
        const { name } = JSON.parse(chunk);
        const { access_token } = req.headers;
        jwt.verify(access_token, process.env.SECRET_KEY, async (err) => {
          if (err instanceof jwt.JsonWebTokenError) {
            res.writeHead(401, options);
            return res.end(
              JSON.stringify({
                massage: "Invalid token",
              })
            );
          }
          const allMarkets = read("market.json");

          const findMarket = allMarkets.find((e) => e.id == marketId);
          findMarket.name = name || findMarket.name;

          const newMarket = await write("market.json", allMarkets);

          if (newMarket) {
            res.writeHead(201, options);
            return res.end(
              JSON.stringify({
                massage: "Put has been market",
              })
            );
          }
        });
      });
    }

    if (url == "branches" && marketId) {
      req.on("data", async (chunk) => {
        const { name, addres, marketid } = JSON.parse(chunk);
        const { access_token } = req.headers;
        jwt.verify(access_token, process.env.SECRET_KEY, async (err) => {
          if (err instanceof jwt.JsonWebTokenError) {
            res.writeHead(401, options);
            return res.end(
              JSON.stringify({
                massage: "Invalid token",
              })
            );
          }
          const allBranches = read("branches.json");

          const findBranches = allBranches.find((e) => e.id == marketId);
          findBranches.name = name || findBranches.name;
          findBranches.addres = addres || findBranches.addres;
          findBranches.marketid = marketid || findBranches.marketid;

          const newBranches = await write("branches.json", allBranches);

          if (newBranches) {
            res.writeHead(201, options);
            return res.end(
              JSON.stringify({
                massage: "Put has been branches",
              })
            );
          }
        });
      });
    }

    if (url == "products" && marketId) {
      req.on("data", async (chunk) => {
        const { title, price, branchId } = JSON.parse(chunk);
        const { access_token } = req.headers;
        jwt.verify(access_token, process.env.SECRET_KEY, async (err) => {
          if (err instanceof jwt.JsonWebTokenError) {
            res.writeHead(401, options);
            return res.end(
              JSON.stringify({
                massage: "Invalid token",
              })
            );
          }
          const allBranches = read("products.json");

          const findBranches = allBranches.find((e) => e.id == marketId);
          findBranches.title = title || findBranches.title;
          findBranches.price = price || findBranches.price;
          findBranches.branchId = branchId || findBranches.branchId;

          const newBranches = await write("products.json", allBranches);

          if (newBranches) {
            res.writeHead(201, options);
            return res.end(
              JSON.stringify({
                massage: "Put has been products",
              })
            );
          }
        });
      });
    }

    if (url == "worker" && marketId) {
      req.on("data", async (chunk) => {
        const { name, phoneNumber, branchId } = JSON.parse(chunk);
        const { access_token } = req.headers;
        jwt.verify(access_token, process.env.SECRET_KEY, async (err) => {
          if (err instanceof jwt.JsonWebTokenError) {
            res.writeHead(401, options);
            return res.end(
              JSON.stringify({
                massage: "Invalid token",
              })
            );
          }
          const allWorkers = read("workers.json");

          const findWorkers = allWorkers.find((e) => e.id == marketId);
          findWorkers.name = name || findWorkers.name;
          findWorkers.phoneNumber = phoneNumber || findWorkers.phoneNumber;
          findWorkers.branchId = branchId || findWorkers.branchId;

          const newWorkers = await write("workers.json", allWorkers);

          if (newWorkers) {
            res.writeHead(201, options);
            return res.end(
              JSON.stringify({
                massage: "Put has been workers",
              })
            );
          }
        });
      });
    }

    return;
  }
  // delete 
  if (req.method == "DELETE") {
    const marketId = req.url.split("/")[2];
    const url = req.url.split("/")[1];
    if (url == "markets" && marketId) {
      const { access_token } = req.headers;

      jwt.verify(access_token, process.env.SECRET_KEY, async (err) => {
        if (err instanceof jwt.JsonWebTokenError) {
          res.writeHead(401, options);
          return res.end(
            JSON.stringify({
              massage: "Invalid token",
            })
          );
        }
        const allMarkets = read("market.json");

        const deletefin = allMarkets.findIndex((e) => e.id == marketId);

        allMarkets.splice(deletefin, 1);

        const newMarket = await write("market.json", allMarkets);

        if (newMarket) {
          return res.end(
            JSON.stringify({
              massage: "Delete has been market",
            })
          );
        }
      });
    }

    if (url == "branches" && marketId) {
      const { access_token } = req.headers;

      jwt.verify(access_token, process.env.SECRET_KEY, async (err) => {
        if (err instanceof jwt.JsonWebTokenError) {
          res.writeHead(401, options);
          return res.end(
            JSON.stringify({
              massage: "Invalid token",
            })
          );
        }
        const allBranches = read("branches.json");

        const deletefin = allBranches.findIndex((e) => e.id == marketId);

        allBranches.splice(deletefin, 1);

        const newBranches = await write("branches.json", allBranches);

        if (newBranches) {
          return res.end(
            JSON.stringify({
              massage: "Delete has been branches",
            })
          );
        }
      });
    }

    if (url == "products" && marketId) {
      const { access_token } = req.headers;

      jwt.verify(access_token, process.env.SECRET_KEY, async (err) => {
        if (err instanceof jwt.JsonWebTokenError) {
          res.writeHead(401, options);
          return res.end(
            JSON.stringify({
              massage: "Invalid token",
            })
          );
        }
        const allBranches = read("products.json");

        const deletefin = allBranches.findIndex((e) => e.id == marketId);

        allBranches.splice(deletefin, 1);

        const newBranches = await write("products.json", allBranches);

        if (newBranches) {
          return res.end(
            JSON.stringify({
              massage: "Delete has been products",
            })
          );
        }
      });
    }

    if (url == "worker" && marketId) {
      const { access_token } = req.headers;

      jwt.verify(access_token, process.env.SECRET_KEY, async (err) => {
        if (err instanceof jwt.JsonWebTokenError) {
          res.writeHead(401, options);
          return res.end(
            JSON.stringify({
              massage: "Invalid token",
            })
          );
        }
        const allWorkers = read("workers.json");

        const deletefin = allWorkers.findIndex((e) => e.id == marketId);

        allWorkers.splice(deletefin, 1);

        const newWorkers = await write("workers.json", allWorkers);

        if (newWorkers) {
          return res.end(
            JSON.stringify({
              massage: "Delete has been workers",
            })
          );
        }
      });
    }
    return;
  }

  res.end("Not found");
});

server.listen(1717, console.log(1717));