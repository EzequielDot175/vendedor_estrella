<?php
	require_once('../core_nufarm/libs.php');
	@ob_start(); 
	@session_start();

	session_destroy();


	@header('Location: '.LOGIN_DIR);

// Si no es redirigido por php....
