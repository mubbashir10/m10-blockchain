//creating websocket object
var blkchainSocket = new WebSocket('wss://ws.blockchain.info/inv');

//defining websocket connection
blkchainSocket.onopen = function(event) {
  var subMessage = '{"op":"unconfirmed_sub"}';
  blkchainSocket.send(subMessage);
};

//creating graph object
var graph = Viva.Graph.graph();

//creating webgl graphics object
var graphics = Viva.Graph.View.webglGraphics();


//defnining node properties
graphics
.node(function(node){
   var img = Viva.Graph.View.webglSquare(getNodeSize(node), getNodeColor(node));
   return img;
})

//defining transaction count
var count = 0;

//defining graph layout
var layout = Viva.Graph.Layout.forceDirected(graph, {
  springLength : 30,
  springCoeff: 0.0008,
  dragCoeff : 0.02,
  gravity: -1.2,
  timeStep : 10,
  theta : 0.1
});


//defining node colors
var getNodeColor = function(node) {
   // here different colors for tx, input, output, mixed and txconfirmed
   if(node.data == "t"){ 
       return '#E89500';
   }else if(node.data == "i"){
       return '#00B8FF';
   }else if(node.data == "o"){
       return '#FF0039';
   }
   return '#fff';
};

//defining node sizes
getNodeSize = function(node){
   if(node.data == "t"){ 
       return 15;
   }else if(node.data == "i"){
       return 10;
   }else if(node.data == "o"){
       return 10;
   }
 }

//listening
blkchainSocket.onmessage = function(event) {
  
  // console.log('count');
  
  var txData = JSON.parse(event.data);
  var inputs = txData.x.inputs;
  var outputs = txData.x.out;


  //transaction
  $('.dump').append('<strong>Transaction Hash: </strong>'+JSON.stringify(txData.x.hash)+'<br>');
  // $('span.tx').html(JSON.stringify(txData.x.hash));
  graph.addNode(JSON.stringify(txData.x.hash), 't');

  //inputs
  for(var i = 0; i < inputs.length; i++){
    $('.dump').append('<strong>Input Address: </strong>'+JSON.stringify(inputs[i].prev_out.addr)+'<br>');
    // $('span.i').html(JSON.stringify(inputs[i].prev_out.addr));
    graph.addNode(JSON.stringify(inputs[i].prev_out.addr), 'i');  
    graph.addLink(JSON.stringify(txData.x.hash), JSON.stringify(inputs[i].prev_out.addr));
    
    //combining input of transaction A with input of transaction B
    graph.addLink(JSON.stringify(inputs[i].prev_out.addr), JSON.stringify(inputs[i].prev_out.addr));
  }    

  //outputs
  for(var i = 0; i < outputs.length; i++){
    $('.dump').append('<strong>Output Address: </strong>'+JSON.stringify(outputs[i].addr)+'<br>'); 
    // $('span.o').html(JSON.stringify(outputs[i].addr)); 
    graph.addNode(JSON.stringify(outputs[i].addr), 'o');
    graph.addLink(JSON.stringify(txData.x.hash), JSON.stringify(outputs[i].addr));


  }

  $('.dump').append('<hr><br>');

  //limit transaction
  // if(count==10)
  //   blkchainSocket.close(); 
  // count++;
};

//mouse listener
var events = Viva.Graph.webglInputEvents(graphics, graph);
events.click(function (node) {
    $('.details .data').html(node.id);
});

//run renderer
var renderer;
$( document ).ready(function() {   
 renderer = Viva.Graph.View.renderer(graph, {
    container: document.getElementById('graph'),
    graphics : graphics,
    layout     : layout
  });
  renderer.run();
});


//key bindings
var pause = false;
$(window).keypress(function (e) {

  //reload
  if (e.key === ' ' || e.key === 'Spacebar') {
    window.location.reload();
  }  

  //pause or resume
  if (e.key === 'p') {
    if(pause==false){
      renderer.pause();
      pause = true;
    }
    else if(pause==true){
      renderer.resume();
      pause = false;
    }
  }

  //dump data
  // if (e.key === 's') {
  //   let dump = $('.dump').html();
  //   // data = 'da'
  //   $.post('http://localhost/dump.php', { data: dump})
  //   .done(function( data ) {
  //     alert( "Dumped Successfully! ");
  //   });

  // }

});
