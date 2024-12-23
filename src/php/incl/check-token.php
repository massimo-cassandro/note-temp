<?php

var_dump($_POST);


// token
if(isset($_POST['t']) and isset($_POST['timestamp']) and isset($_POST['t1']) and $_POST['t1'] > 0) {

  // check token provvisorio
  $coeff = 9865871369; // condiviso con l'app client

  // costruito con lo stesso criterio lato client sulla base del timestamp inviato
  // deve essere uguale a $_POST['t'] => (d.getFullYear() * (d.getMonth() + 1) * d.getDate() * d.getHours() * d.getMinutes * d.getSeconds * coeff).toString(16);
  $date_obj = date_parse($_POST['timestamp']);
  $temp_token = ($date_obj['year'] * $date_obj['month'] * $date_obj['day'] * $date_obj['hour'] * $date_obj['minute'] * $date_obj['second'] * $coeff);


  echo '$date_obj: ' ;
  var_dump($date_obj);
  echo '$temp_token: ';
  var_dump($temp_token);

  if($temp_token !== $_POST['t']) {
    header("HTTP/1.1 500 Internal Server Error");
    die('err-3');

  } else {
    session_start();
    $token = md5(mt_rand(100000));
    $_SESSION['token'] = $token;
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode(['t' => $token]);
    exit();
  }

} else if(isset($_POST['t']) and $_POST['t'] === $_SESSION['token']) {
  runQuery();

} else {
  header("HTTP/1.1 500 Internal Server Error");
  die('err-4');
}
