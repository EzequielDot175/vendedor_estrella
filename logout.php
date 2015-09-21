<?php
	require_once('../core_nufarm/libs.php');
	@ob_start(); 
	@session_start();

	session_destroy();


	@header('Location: '.LOGIN_DIR);

// Si no es redirigido por php....
 ?>


 <!DOCTYPE html>
 <html lang="en">
 <head>
 	<meta charset="UTF-8">
 	<title>Vendedor Estrella</title>
 </head>
 <body>
 	<script>
 		setTimeout(function(){
 			window.location.href = "<?php echo LOGIN_DIR ?>";
 		}, 5000);
 	</script>
 </body>
 </html>