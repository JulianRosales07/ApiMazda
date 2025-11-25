export const success = (res, data, message = "Operación exitosa") => {
  res.status(200).json({ ok: true, message, data });
};

export const error = (res, err, code = 500) => {
  console.error(err);
  res
    .status(code)
    .json({ ok: false, message: err.message || "Error interno del servidor" });
};
