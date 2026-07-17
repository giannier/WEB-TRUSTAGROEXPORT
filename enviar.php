<?php
/**
 * ============================================================================
 * TRUST AGRO EXPORT — Procesador del formulario de cotización (cPanel / PHP)
 * ----------------------------------------------------------------------------
 * Recibe el formulario de contacto.html y envía un correo con la solicitud.
 *
 * CONFIGURACIÓN:
 *   1) Cambia $destinatario por el correo real donde quieres recibir las
 *      solicitudes (por ejemplo el buzón que creaste en cPanel).
 *   2) Cambia $remitente por un correo de TU dominio (recomendado en cPanel
 *      para que no lo marque como spam), p. ej. no-reply@tudominio.com.
 *   3) Sube este archivo junto al resto del sitio a public_html.
 *
 * Funciona tanto por AJAX (devuelve JSON) como sin JavaScript (redirige).
 * ============================================================================
 */

// ---- CONFIGURA AQUÍ ----
$destinatario = 'info@trustagro.com';
$remitente    = 'no-reply@trustagroexport.com';
$asunto_base  = 'Nueva solicitud de cotización — Web Trust Agro Export';
// ------------------------

header('X-Content-Type-Options: nosniff');

$es_ajax = (
  isset($_SERVER['HTTP_X_REQUESTED_WITH']) &&
  strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest'
);

function responder($ok, $mensaje, $es_ajax) {
  if ($es_ajax) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => $ok, 'message' => $mensaje]);
    exit;
  }
  // Sin JS: redirige de vuelta con un parámetro de estado
  $destino = $ok ? 'contacto.html?enviado=1#cotizar' : 'contacto.html?error=1#cotizar';
  header('Location: ' . $destino);
  exit;
}

// Solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  responder(false, 'Método no permitido.', $es_ajax);
}

// Anti-spam (honeypot): si viene lleno, es un bot
if (!empty($_POST['website'])) {
  responder(true, 'OK', $es_ajax); // fingimos éxito sin enviar
}

// Sanitización
function limpiar($v) {
  return trim(str_replace(["\r", "\n", "%0a", "%0d"], ' ', (string)$v));
}

$nombre   = limpiar($_POST['nombre']   ?? '');
$email    = limpiar($_POST['email']    ?? '');
$telefono = limpiar($_POST['telefono'] ?? '');
$empresa  = limpiar($_POST['empresa']  ?? '');
$interes  = limpiar($_POST['interes']  ?? '');
$mensaje  = trim($_POST['mensaje'] ?? '');

// Validación
$errores = [];
if ($nombre === '')   $errores[] = 'nombre';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errores[] = 'email';
if ($telefono === '') $errores[] = 'teléfono';

if ($errores) {
  responder(false, 'Faltan campos requeridos: ' . implode(', ', $errores), $es_ajax);
}

// Construcción del correo
$cuerpo  = "Nueva solicitud de cotización desde el sitio web\n";
$cuerpo .= "=================================================\n\n";
$cuerpo .= "Nombre:    $nombre\n";
$cuerpo .= "Correo:    $email\n";
$cuerpo .= "Teléfono:  $telefono\n";
$cuerpo .= "Empresa:   " . ($empresa !== '' ? $empresa : '—') . "\n";
$cuerpo .= "Interés:   " . ($interes !== '' ? $interes : '—') . "\n\n";
$cuerpo .= "Mensaje:\n" . ($mensaje !== '' ? $mensaje : '—') . "\n\n";
$cuerpo .= "-------------------------------------------------\n";
$cuerpo .= "Enviado el " . date('d/m/Y H:i') . "\n";

$headers  = 'From: Trust Agro Export <' . $remitente . ">\r\n";
$headers .= 'Reply-To: ' . $nombre . ' <' . $email . ">\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$asunto = '=?UTF-8?B?' . base64_encode($asunto_base) . '?=';

$enviado = @mail($destinatario, $asunto, $cuerpo, $headers, '-f' . $remitente);

if ($enviado) {
  responder(true, '¡Gracias! Tu solicitud fue enviada.', $es_ajax);
} else {
  responder(false, 'No se pudo enviar el correo. Verifica la configuración de correo en cPanel.', $es_ajax);
}
