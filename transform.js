// const readline = require("readline");
// const fs = require("fs");

// const readJSONL = async (filepath) => {
//   const fileStream = fs.createReadStream(filepath);
//   console.log("entered");
//   const rl = readline.createInterface({
//     input: fileStream,
//     crlfDelay: Infinity,
//   });

//   const data = [];
//   console.log("entered2");
//   for await (const line of rl) {
//     console.log("line");
//     console.log(line);

//     // data.push(JSON.parse(line));
//   }

//   return data;
// };

// readJSONL("./train.jsonl")
//   .then((data) => console.log(data))
//   .catch((e) => console.log("e" + e));

const fs = require("fs");
const { resolve } = require("path");
const readline = require("readline");
const readJSONL = (filepath) => {
  const stream = fs.createReadStream(filepath, { encoding: "utf8" });
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  const data = [];
  output = [];
  rl.on("line", (line) => {
    try {
      const obj = JSON.parse(line);
      data.push(obj);
    } catch (error) {}
  });

  return new Promise((resolve, reject) => {
    rl.on("close", () => resolve(data));
    rl.on("error", (err) => reject(err));
  });
};

const writeJSONFile = (filepath, data) => {
  const stream = fs.createWriteStream(filepath, { encoding: "utf8" });
  const json = JSON.stringify(data);

  return new Promise((resolve, reject) => {
    stream.write(json, (err) => {
      if (err) {
        reject(err);
      } else {
        stream.end();
        resolve();
      }
    });
  });
};

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Define the CSV file header
const header = [
  { id: "data", title: "data" },
  { id: "part1", title: "part1" },
];

// Define the data to write to the CSV file
const data = [
  { name: "John Doe", email: "john.doe@example.com", age: 30 },
  { name: "Jane Smith", email: "jane.smith@example.com", age: 25 },
  { name: "Bob Johnson", email: "bob.johnson@example.com", age: 45 },
];
let arg_res = [];
// Create a new CSV file and write the header and data
const csvWriter = createCsvWriter({
  path: "example4.csv",
  header: header,
  encoding: "utf-8",
});
let index = 0;
let max_value = 0;
// Example usage
readJSONL("./train.jsonl")
  .then((data) => {
    data.forEach((element) => {
      let tes = {};
      tes.Bufferle = Buffer.byteLength(JSON.stringify(element.text), "utf-8");

      let str = element.text;
      str = str.replace(/[^\x20-\x7E]/g, "");

      const part1 = str.slice(0, Math.floor(str.length)); // Get the first part

      const part2 = str.slice(
        Math.floor(str.length / 3),
        Math.floor(str.length / 3) * 2
      ); // Get the second part
      const part3 = str.slice(Math.floor(str.length / 3) * 2); // Get the third part

      //  tes.text = element.text ? element.text : null;
      tes.event_mentions = element.event_mentions;
      let ter = tes.event_mentions;
      let fest = ter.reduce(function (result, current) {
        // Find the item in the result array with the same key as the current item
        const item = result.find(function (item) {
          return item.event_type === current.event_type;
        });
        current.trigger.arguments = current.arguments;
        // If the item doesn't exist yet, create it
        if (!item) {
          result.push({
            event_type: current.event_type,
            triggers: [current.trigger],
          });
        } else {
          // Add the current value to the existing item's values array
          item.triggers.push(current.trigger);
        }
        return result;
      }, []);
      let max_row = 0;

      fest.forEach((ele) => {
        ele.triggers.forEach((arr) => {
          max_row = Math.max(arr.arguments.length, max_row);
        });
      });
      fest.forEach((kint) => {
        for (let i = 0; i < max_row; i++) {
          let res_row = [];
          for (let j = 0; i < kint.triggers.length; i++) {
            if (kint.triggers[j] && kint.triggers[j].arguments[i]) {
              res_row.push(
                kint.triggers[j].arguments[i].role +
                  kint.triggers[j].arguments[i].text
              );
            }
            arg_res.push({ [i]: res_row });
          }
        }
      });

      output.push({ data: JSON.stringify(fest) });
    });
    console.log(arg_res);
    let ert = [];
    ert[0] = output[0];
    ert[1] = output[1];
    csvWriter
      .writeRecords(ert)
      .then(() => console.log("CSV file successfully written"))
      .catch((err) => console.log(err));
    writeJSONFile("./output.json", output)
      .then(() => console.log("File written successfully"))
      .catch((err) => console.error(err));
  })
  .catch((err) => console.error(err));

// Example usage
