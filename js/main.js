//creating websocket object
var blkchainSocket = new WebSocket('wss://ws.blockchain.info/inv');

//defining websocket connection
blkchainSocket.onopen = function(event) {
  subMessage = '{"op":"unconfirmed_sub"}';
  blkchainSocket.send(subMessage);
};

//creating graph object
var graph = Viva.Graph.graph();

//creating webgl graphics object
var graphics = Viva.Graph.View.webglGraphics();

var width = $("#graph").width(), height= $("#graph").height();
graphics.scale(0.15, {x : width/2, y : height/2});

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
       return '#047af7';
   }else if(node.data == "i"){
       return '#21cc1e';
   }else if(node.data == "o"){
       return '#ff0707';
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
  
  console.log('count');
  
  var txData = JSON.parse(event.data);
  var inputs = txData.x.inputs;
  var outputs = txData.x.out;


  //transaction
  $('.dump').append(count+': Transaction Hash: '+JSON.stringify(txData.x.hash)+'<br>');
  graph.addNode(JSON.stringify(txData.x.hash), 't');

  //inputs
  for(var i = 0; i < inputs.length; i++){
    $('.dump').append('Input Address: '+JSON.stringify(inputs[i].prev_out.addr)+'<br>');
    graph.addNode(JSON.stringify(inputs[i].prev_out.addr), 'i');  
    graph.addLink(JSON.stringify(txData.x.hash), JSON.stringify(inputs[i].prev_out.addr));
    
    //combining input of transaction A with input of transaction B
    graph.addLink(JSON.stringify(inputs[i].prev_out.addr), JSON.stringify(inputs[i].prev_out.addr));
  }    

  //outputs
  for(var i = 0; i < outputs.length; i++){
    $('.dump').append('Output Address: '+JSON.stringify(outputs[i].addr)+'<br>');  
    graph.addNode(JSON.stringify(outputs[i].addr), 'o');
    graph.addLink(JSON.stringify(txData.x.hash), JSON.stringify(outputs[i].addr));


  }
  
  //limit transaction
  // if(count==10)
  //   blkchainSocket.close(); 
  // count++;
};

//run renderer
$( document ).ready(function() {   
 var renderer = Viva.Graph.View.renderer(graph, {
    container: document.getElementById('graph'),
    graphics : graphics,
    layout     : layout
  });
  renderer.run();
});