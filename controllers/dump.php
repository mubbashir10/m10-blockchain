<?php
	
 $filename = "dump.html";
   $file = fopen( $filename, "a" );
   
   if( $file == false ) {
      echo ( "Error in opening new file" );
      exit();
   }
   fwrite( $file, '<h1 style="text-align:center;">'.date('l jS \of F Y h:i:s A').'</h1><br>'.$_POST['data']);
   fclose( $file );

return ('success');

?>