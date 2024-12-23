<?php


// https://github.com/vlucas/phpdotenv

$isLocalEnv = php_sapi_name() === 'cli-server';
$db_file = $_SERVER['DOCUMENT_ROOT'] . '/db/note.db';
$attachments_dir = $_SERVER['DOCUMENT_ROOT'] . '/db/note-attachments';


if ($isLocalEnv) {
  header("Access-Control-Allow-Origin: *");
  $db_file = $_SERVER['DOCUMENT_ROOT'] . '/_db-dev/note.db';
  $attachments_dir = $_SERVER['DOCUMENT_ROOT'] . '/_db-dev/note-attachments';

} else {

  if($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("HTTP/1.1 500 Internal Server Error");
    die('err-1');
  }

  // check same origin
  foreach (['HTTP_ORIGIN', 'HTTP_REFERER'] as $k) {
    if(!empty($_SERVER[$k]) && !preg_match("/^https?:\/\/${_SERVER['SERVER_NAME']}/", $_SERVER[$k])) {
      header("HTTP/1.1 500 Internal Server Error");
      die('err-2');
    }
  }
}



$db = new SQLite3($db_file, SQLITE3_OPEN_READONLY); //SQLITE3_OPEN_READWRITE);
$SqlLite_version = SQLite3::version()['versionNumber'];
