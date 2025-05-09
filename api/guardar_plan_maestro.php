<?php
header('Content-Type: application/json');

// Ruta a tu archivo de base de datos SQLite
// ¡ASEGÚRATE QUE ESTA RUTA SEA LA CORRECTA!
$sqlite_db_file = __DIR__ . '/../database/nutriwell_db.sqlite';
// Ejemplo de ruta absoluta si la necesitas:
// $sqlite_db_file = 'C:/laragon/www/NutriMES/database/nutriwell_db.sqlite';

$response = ['success' => false, 'message' => ''];

try {
    if (!file_exists($sqlite_db_file)) {
        throw new Exception("El archivo de base de datos no existe: " . htmlspecialchars($sqlite_db_file));
    }

    $conn = new PDO('sqlite:' . $sqlite_db_file);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verificar que la solicitud sea POST
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // Obtener los datos del formulario
        $ot = $_POST['pmpOT'] ?? null;
        $producto = $_POST['pmpProducto'] ?? null;
        $item = $_POST['pmpItem'] ?? null;
        $linea = $_POST['pmpLinea'] ?? null;
        $tipo_produccion = $_POST['pmpTipo'] ?? null;
        $gpm_calculado = isset($_POST['pmpGpm']) && is_numeric($_POST['pmpGpm']) ? floatval($_POST['pmpGpm']) : null;
        $cantidad_total = isset($_POST['pmpCantidadTotal']) && is_numeric($_POST['pmpCantidadTotal']) ? intval($_POST['pmpCantidadTotal']) : null;
        $dias_produccion_estimados = isset($_POST['pmpDiasProduccion']) && is_numeric($_POST['pmpDiasProduccion']) ? floatval($_POST['pmpDiasProduccion']) : null;

        // Validación básica
        if (empty($linea) || empty($tipo_produccion) || $cantidad_total === null || $cantidad_total <= 0) {
            $response['message'] = 'Error: Línea, Tipo y Cantidad Total son obligatorios y la cantidad debe ser mayor a cero.';
            echo json_encode($response);
            $conn = null;
            exit();
        }
        // gpm_calculado y dias_produccion_estimados podrían ser 0 o N/A si no se pudo calcular,
        // pero la tabla permite NULLs para ellos si eso es aceptable para tu lógica.
        // Si deben tener un valor numérico válido siempre que se guarda un plan, añade validación.

        $sql = "INSERT INTO planes_maestros (ot, producto, item, linea, tipo_produccion, gpm_calculado, cantidad_total, dias_produccion_estimados)
                VALUES (:ot, :producto, :item, :linea, :tipo_produccion, :gpm_calculado, :cantidad_total, :dias_produccion_estimados)";

        $stmt = $conn->prepare($sql);

        $stmt->bindParam(':ot', $ot);
        $stmt->bindParam(':producto', $producto);
        $stmt->bindParam(':item', $item);
        $stmt->bindParam(':linea', $linea);
        $stmt->bindParam(':tipo_produccion', $tipo_produccion);
        $stmt->bindParam(':gpm_calculado', $gpm_calculado); // PDO::PARAM_STR o PDO::PARAM_NULL si es nulo
        $stmt->bindParam(':cantidad_total', $cantidad_total, PDO::PARAM_INT);
        $stmt->bindParam(':dias_produccion_estimados', $dias_produccion_estimados); // PDO::PARAM_STR o PDO::PARAM_NULL si es nulo

        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = 'Plan Maestro de Producción guardado exitosamente. ID: ' . $conn->lastInsertId();
        } else {
            $response['message'] = 'Error al guardar el Plan Maestro (execute falló).';
        }

    } else {
        http_response_code(405); // Method Not Allowed
        $response['message'] = 'Error: Método de solicitud no permitido.';
    }

} catch (PDOException $e) {
    error_log("Error de PDO en guardar_plan_maestro.php: " . $e->getMessage());
    $response['message'] = 'Error de base de datos: ' . $e->getMessage();
} catch (Exception $e) {
    error_log("Error general en guardar_plan_maestro.php: " . $e->getMessage());
    $response['message'] = 'Error del servidor: ' . $e->getMessage();
}

$conn = null;
echo json_encode($response);
?>