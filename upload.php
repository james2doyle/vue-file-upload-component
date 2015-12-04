<?php

/*!
 * simple json response
 * @param  integer $code    HTTP Status Code
 * @param  mixed   $message The message to send
 * @return string           JSON encoded string
 */
function json_response($code = 200, $message = null)
{
    // clear the old headers
    header_remove();
    // set the header to make sure cache is forced
    header("Cache-Control: no-transform,public,max-age=300,s-maxage=900");
    // treat this as json
    header('Content-Type: application/json');
    $status = array(
        200 => '200 OK',
        400 => '400 Bad Request',
        500 => '500 Internal Server Error'
        );
    // ok, validation error, or failure
    header('Status: '.$status[$code]);
    // return the encoded json
    return json_encode(array(
    'status' => $code < 300, // success or not?
    'message' => $message
    ));
}

// this function is very simple
// it just uploads a single file with a timestamp prepended
$target_dir = "uploads/";
$target_file = $target_dir . time() . basename($_FILES["file"]["name"]);
if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
    echo json_response(200, "The file ". basename( $_FILES["file"]["name"]). " has been uploaded.");
} else {
    echo json_response(500, "Sorry, there was an error uploading your file.");
}