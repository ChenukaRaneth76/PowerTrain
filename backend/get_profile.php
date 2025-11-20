<?php
include "config.php";
$username = $_GET['username'];
$q = mysqli_query($conn, "SELECT profile_image FROM users WHERE username='$username'");
$r = mysqli_fetch_assoc($q);
echo $r['profile_image'] ?? "";
