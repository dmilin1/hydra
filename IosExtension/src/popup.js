// Adding code for part 2 if we can enable smart app banner to automatically open Reddit links in Hydra

// window.addEventListener("DOMContentLoaded", (event) => {
//     browser.storage.local.get((item) => {
//         const automaticToggle = document.getElementById("automatic-toggle");

//         var automaticObj = item.automaticObj;

//         if (automaticObj == undefined) {
//             automaticToggle.checked = true;
//         } else {
//             automaticToggle.checked = automaticObj.isAutomatic;
//         }

//         automaticToggle.addEventListener("change", (event) => {
//             if (document.getElementById("automatic-toggle").checked) {
//                 let automaticObj = { isAutomatic: true };
//                 browser.storage.local.set({ automaticObj });
//             } else {
//                 let automaticObj = { isAutomatic: false };
//                 browser.storage.local.set({ automaticObj });
//             }
//         });
//     });
// });