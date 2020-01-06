/* SoupTV
 * front-end
 * ==================== */

// // When the #make-new button is clicked
$(document).on("click", "#pickTenant", function() {
  // AJAX POST call to the submit route on the server
  // This will take the data from the form and send it to the server
  let tenant = $("#tenantSelector").val();

  $.ajax({
    type: "GET",
    dataType: "json",
    url: `/orders/${tenant}`
  })
    // If that API call succeeds, add the title and a delete button for the note to the page
    .then(function(data) {
      console.log(data);
      $("#main").empty();
      $("#main").append(`
      <h3 style="margin-top: 200px;">Select Order</h3>
      <select class="custom-select" id="orderSelector">
      </select>
      `);
      data.forEach(order => {
        $("#orderSelector").append(
          `<option data-tenant=${tenant} value=${order.id}>${tenant} #${order.orderNumber} | ${order.billTo.firstName} ${order.billTo.lastName}</option>`
        );
      });
      $("#main").append(
        `      <br /><br />
          <input
            class="btn btn-primary"
            id="pickOrder"
            type="submit"
            value="Submit"
          />`
      );
    });
});

$(document).on("click", "#pickOrder", function() {
  // AJAX POST call to the submit route on the server
  // This will take the data from the form and send it to the server
  let order = $("#orderSelector").val();
  let tenant = $("#orderSelector option:selected").attr("data-tenant");

  console.log(tenant);

  $.ajax({
    type: "GET",
    dataType: "json",
    url: `/order/${tenant}/${order}`
  })
    // If that API call succeeds, add the title and a delete button for the note to the page
    .then(function(data) {
      console.log(data.items);
      $("#main").empty();
      $("#main").append(`
      <h3 style="margin-top: 200px;">Assign METRC tags</h3>
      `);
      data.items.forEach(item => {
        for (var i = 1; i <= item.quantity; i++) {
          $("#main").append(`
            <label>Product: ${item.productTitle} | SKU: ${item.sku}</label><br />
            <input data-item="${item.productTitle}" data-sku=${item.sku} data-price=${item.price} class="form-control" id="metrcDescription" type="text" placeholder="Enter METRC Description">
            <input data-item="${item.productTitle}" data-sku=${item.sku} data-price=${item.price} class="form-control" id="metrcNumber" type="text" placeholder="Enter METRC #">
            <br/>            `);
        }
      });
      $("#main").append(
        `      <br />
          <input
            class="btn btn-primary"
            id="saveMetrc"
            data-tenant=${tenant}
            data-orderNum=${data.orderNumber}
            type="submit"
            value="Submit"
          />`
      );
    });
});

$(document).on("click", "#saveMetrc", function() {
  // tenant, order#, launchItem, sku, metrcDesc, metrc#, price
  //metrc save format:
  // delivery Date/Time: (YYYY-MM-DD HH:MM), customerType: "consumer", metrc #, quantity, unit: "each", product price before tax and after discount

  let tenant = $(this).attr("data-tenant");
  let orderNum = $(this).attr("data-orderNum");
  let arr = $("#main").children();
  console.log(arr);
  let metrcDesc = [];
  let metrcNum = [];
  for (key in arr) {
    if (!arr.hasOwnProperty(key)) continue;

    var obj = arr[key];
    if (obj.id === "metrcDescription") {
      metrcDesc.push({
        Tenant: tenant,
        OrderNum: orderNum,
        ItemPrice: obj.dataset.price,
        Item: obj.dataset.item,
        SKU: obj.dataset.sku,
        Description: obj.value
      });
    }
    if (obj.id === "metrcNumber") {
      metrcNum.push(obj.value);
    }
  }
  for (var i = 0; i < metrcDesc.length; i++) {
    metrcDesc[i].metrcNumber = metrcNum[i];
  }

  $.ajax({
    type: "POST",
    dataType: "json",
    url: `/save`,
    data: {
      items: metrcDesc
    }
  })
    // If that API call succeeds, add the title and a delete button for the note to the page
    .then(function(res) {
      console.log(res);
      window.location.href = "/";
    });
});
