<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $imageData = $data['image'];

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email address.";
        exit;
    }

    // Decode base64 image
    $imageData = str_replace('data:image/png;base64,', '', $imageData);
    $imageData = base64_decode($imageData);
    $imagePath = "uploads/photo_strip.png";
    file_put_contents($imagePath, $imageData);

    // Send email
    $to = $email;
    $subject = "Your Picture Cuts Photo Strip";
    $message = "Here is your photo strip!";
    $headers = "From: your_email@example.com";

    $boundary = md5(time());

    // Email headers
    $headers .= "\r\nMIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary}\"";

    // Email body
    $body = "--{$boundary}\r\n";
    $body .= "Content-Type: text/plain; charset=\"UTF-8\"\r\n\r\n";
    $body .= $message . "\r\n\r\n";
    $body .= "--{$boundary}\r\n";
    $body .= "Content-Type: image/png; name=\"photo_strip.png\"\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n";
    $body .= "Content-Disposition: attachment; filename=\"photo_strip.png\"\r\n\r\n";
    $body .= chunk_split(base64_encode(file_get_contents($imagePath))) . "\r\n";
    $body .= "--{$boundary}--";

    if (mail($to, $subject, $body, $headers)) {
        echo "Email sent successfully!";
    } else {
        echo "Failed to send email.";
    }
}
?>
