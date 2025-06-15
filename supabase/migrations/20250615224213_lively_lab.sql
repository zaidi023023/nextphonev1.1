-- دالة لتقليل كمية قطع الغيار
CREATE OR REPLACE FUNCTION decrease_spare_part_quantity(part_id uuid, quantity_to_decrease integer)
RETURNS void AS $$
BEGIN
  UPDATE spare_parts 
  SET quantity = GREATEST(0, quantity - quantity_to_decrease)
  WHERE id = part_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;