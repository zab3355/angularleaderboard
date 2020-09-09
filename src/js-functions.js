const $tableID = $('#table');
const $BTN = $('#export-btn');

 $tableID.on('click', '.table-remove', function () {

   $(this).parents('tr').detach();
 });

 $tableID.on('click', '.table-up', function () {

   const $row = $(this).parents('tr');

   if ($row.index() === 0) {
     return;
   }

   $row.prev().before($row.get(0));
 });

 $tableID.on('click', '.table-down', function () {

   const $row = $(this).parents('tr');
   $row.next().after($row.get(0));
 });

 $BTN.on('click', () => {

    const $rows = $tableID.find('tr:not(:hidden)');
    const headers = [];
    const data = [];
 
    // Get the headers (add special header logic here)
    $($rows.shift()).find('th:not(:empty)').each(function () {
 
      headers.push($(this).text().toLowerCase());
    });
 
    // Turn all existing rows into a loopable array
    $rows.each(function () {
      const $td = $(this).find('td');
      const h = {};
 
      // Use the headers from earlier to name our hash keys
      headers.forEach((header, i) => {
 
        h[header] = $td.eq(i).text();
      });
 
      data.push(h);
    });
 
    // Output the result
    $EXPORT.text(JSON.stringify(data));
  });




//Dropdown functionality

function logoSubmit() {
        if($('#logo').val() == 'cardinals') {

            document.getElementById("logoRow").src = "https://lb-images.nyc3.digitaloceanspaces.com/team-logos/baltimore-ravens-logo-vector-01.png?";   
            
        }
        else if($('#logo').val() == 'falcons') {
          //  var logoFalcons = document.getElementById("logoRow");
       //     logoFalcons.src = "https://lb-images.nyc3.digitaloceanspaces.com/team-logos/atlanta-falcons-logo-vector.png";  
        //    logoFalcons.appendChild("logoRow");  
        } 
        else if($('#logo').val() == 'ravens') {

            logoImage = document.getElementById("logoRow");
            logoImage.src = "https://lb-images.nyc3.digitaloceanspaces.com/team-logos/baltimore-ravens-logo-vector-01.png?";    
            imgData = getBase64Image(logoImage);  
            localStorage.setItem("imgData", imgData);
        } 
        else if($('#logo').val() == 'jets') {

            document.getElementById("logoRow").src = "https://lb-images.nyc3.digitaloceanspaces.com/team-logos/new-york-jets-logo-vector-01.png?";      
        } 
        else if($('#logo').val() == 'giants') {

            document.getElementById("logoRow").src = "https://lb-images.nyc3.digitaloceanspaces.com/team-logos/new-york-jets-logo-vector-01.png";   
        } 
        else {

        }
      }