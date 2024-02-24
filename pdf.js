"use strict";
const { exec } = require("child_process");
const pdfPageCounter = require("pdf-page-counter");
const fs = require("fs");
// const { range } = require("lodash");

module.exports = {
  getMergePdf: async function (array) {
    let list = "";
    const mergePdfName = `Merged-${Date.now()}.pdf`;
    array.map(({ givenName }) => {
      list += `./pdf/${givenName} `;
    });
    const command = `pdftk ${list}cat output ./pdf/${mergePdfName}`; // Add && del command to delete list
    return new Promise((resolve) => {
      exec(command, (err, stdout, stderr) => {
        if (err) {
          resolve({ success: false, message: err.message });
        } else {
          resolve({ success: true, message: `./pdf/${mergePdfName}` });
        }
      });
    });
  },

  getTotalPages: async function (pdf) {
    return new Promise((resolve) => {
      const pdfBuffer = fs.readFileSync(`./pdf/${pdf}`);
      pdfPageCounter(pdfBuffer).then(function ({ numpages }) {
        resolve(numpages);
      });
    });
  },

  keyboardLogin: function (totalPages, removedPages = []) {
    let keyboardArray = [];
    let tmp = [];
    let n = 1;
    while (totalPages) {
      if (n % 5) {
        tmp.push(n.toString());
      } else {
        tmp.push(n.toString());
        keyboardArray.push(
          tmp.filter((i) => {
            return removedPages.includes(i) ? "" : i;
          })
        );
        tmp = [];
      }
      n++;
      totalPages--;
    }
    if (tmp.length) {
      keyboardArray.push(tmp);
    }
    keyboardArray.push(removedPages.length ? ["Done", "Cancel"] : ["Cancel"]);
    return keyboardArray;
  },

  removePages: function (array, total, removedPages) {
    const [{ givenName, originalName }] = array;
    const removedPagePdfName = `RemovedPages-${Date.now()}.pdf`;
    const removedPagesList = removedPages
      .map((n) => Number(n))
      .sort((a, b) => a - b);
    let text = "";
    removedPagesList.map((n, index) => {
      let f = 0;
      let l = 0;
      if (n !== removedPagesList[index + 1] - 1) {
        if (removedPagesList.length === 1 && (n === 1 || n === total)) {
          f = n === 1 ? 2 : 1;
          l = n === 1 ? total : total - 1;
          text += `${f}-${l} `;
        } else {
          if (n !== 1 && index === 0) {
            f = 1;
            l = removedPagesList[index] - 1;
            text += `${f}-${l} `;
          }
          if (n !== total) {
            f = n + 1;
            l = removedPagesList[index + 1] - 1;
            text += `${f}-${l ? l : total} `;
          }
        }
      } else {
        if (index === 0 && n !== 1) {
          text += `1-${removedPagesList[index] - 1} `;
        }
      }
    });
    return new Promise((resolve) => {
      exec(
        `pdftk ./pdf/${givenName} cat ${text}output ./pdf/${removedPagePdfName}`,
        (err, stdout, stderr) => {
          if (err) {
            resolve({ success: false, message: err.message });
          } else {
            resolve({ success: true, message: `./pdf/${removedPagePdfName}` });
          }
        }
      );
    });
  },
};
