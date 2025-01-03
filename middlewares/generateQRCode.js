import QRCode from 'qrcode';

// Middleware para generar QR
export const generateQR = async (req, res, next) => {
    try {
        const { data } = req.body;

        if (!data) {
            return res.status(400).json({ error: 'Datos para generar el QR no proporcionados' });
        }

        // Genera el código QR como una URL base64
        const qrCode = await QRCode.toDataURL(JSON.stringify(data));

        // Adjunta el QR al objeto de respuesta
        req.qrCode = qrCode;

        next();
    } catch (error) {
        res.status(500).json({ error: 'Error al generar el QR', detalles: error.message });
    }
};
