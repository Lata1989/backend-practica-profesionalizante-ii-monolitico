export const addIdEmpresaToUrl = (req, res, next) => {
    if (req.user && req.user.idEmpresa) {
      // Agregar el idEmpresa a los parámetros de la URL
      req.params.idEmpresa = req.user.idEmpresa;
    } else {
      return res.status(401).json({ message: 'Token inválido: falta idEmpresa' });
    }
    next();
  };
  