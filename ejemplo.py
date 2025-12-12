import csv

def safe_float(val):
    try:
        return float(val.strip()) if val and val.strip() else 0.0
    except ValueError:
        return 0.0

filename = 'NUEVO SISTEMA22.csv'
output_file = 'inserts_repuestos.sql'

with open(filename, 'r', encoding='utf-8') as file, open(output_file, 'w', encoding='utf-8') as out:
    reader = csv.reader(file, delimiter=';')
    next(reader)  # Skip header
    
    for row in reader:
        if len(row) < 8:  # Skip incomplete rows
            continue
        
        cb = row[0].strip() if row[0].strip() else None
        ci = row[1].strip() if row[1].strip() else None
        producto = row[2].strip().replace("'", "''") if row[2].strip() else None
        tipo = row[3].strip().replace("'", "''") if row[3].strip() else None
        modelo_espec = row[4].strip().replace("'", "''") if row[4].strip() else None
        referencia = row[5].strip().replace("'", "''") if row[5].strip() else None
        marca = row[6].strip().replace("'", "''") if row[6].strip() else None
        exist_iniciales = safe_float(row[7])
        stock = safe_float(row[10]) if len(row) > 10 else 0.0
        precio = safe_float(row[11]) if len(row) > 11 else 0.0
        estante = row[12].strip().replace("'", "''") if len(row) > 12 and row[12].strip() else None
        nivel = row[13].strip().replace("'", "''") if len(row) > 13 and row[13].strip() else None
        desc_larga = row[15].strip().replace("'", "''") if len(row) > 15 and row[15].strip() else None
        
        cb_val = f"'{cb}'" if cb else 'NULL'
        ci_val = f"'{ci}'" if ci else 'NULL'
        producto_val = f"'{producto}'" if producto else 'NULL'
        tipo_val = f"'{tipo}'" if tipo else 'NULL'
        modelo_val = f"'{modelo_espec}'" if modelo_espec else 'NULL'
        ref_val = f"'{referencia}'" if referencia else 'NULL'
        marca_val = f"'{marca}'" if marca else 'NULL'
        estante_val = f"'{estante}'" if estante else 'NULL'
        nivel_val = f"'{nivel}'" if nivel else 'NULL'
        desc_val = f"'{desc_larga}'" if desc_larga else 'NULL'
        
        insert = f'INSERT INTO "public"."repuestos" ("cb", "ci", "producto", "tipo", "modelo_especificacion", "referencia", "marca", "existencias_iniciales", "stock", "precio", "descripcion_larga", "activo", "estante", "nivel") VALUES ({cb_val}, {ci_val}, {producto_val}, {tipo_val}, {modelo_val}, {ref_val}, {marca_val}, {exist_iniciales}, {stock}, {precio}, {desc_val}, \'true\', {estante_val}, {nivel_val});\n'
        out.write(insert)

print(f"Script SQL generado en {output_file} con {sum(1 for _ in open(output_file, encoding='utf-8'))} líneas.")