import express, { Request, Response } from "express";
import cors from "cors";
const Redis = require("ioredis");
const redis = new Redis({
  port: 6379,
  host: "127.0.0.1",
});
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pass_key = "passwords";
app.get("/", async (req: Request, res: Response) => {
  res.json("server started");
});

async function loadpasswords() {
  const fs = require("fs");
  fs.readFile("./password.json", "utf-8", async (err: any, data: any) => {
    if (err) throw err;
    const password: any = [];
    let jsonData = JSON.parse(data);
    for (var i = 0; i < 10000; i++) {
      const data = jsonData[i];
      password.push(data);
    }
    await insertdata(password);
  });
}

async function insertdata(pass: any) {
  console.log(pass);
  const adddata = await redis.call("BF.MADD", pass_key, pass);
  console.log(adddata);
  return;
}
loadpasswords()  //enable this to insert data

app.post("/checkpassword", async (req: Request, res: Response) => {
  const { password } = req.body;
  const checkpass = await redis.call("BF.EXISTS", pass_key, password);
  if (checkpass) {
    return res.json("Weak Password");
  }
  return res.json("Strong Password");
});

app.listen(5200, () => {
  console.log(`Server started in http://localhost:5200`);
});
